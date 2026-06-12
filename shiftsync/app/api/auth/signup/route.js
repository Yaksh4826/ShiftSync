import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "@/models/User";
import { connectDB } from "@/lib/dbConnect";

export async function POST(request) {
    try {
        await connectDB();

        let data = await request.json();
        let { name, email, password } = data;

        // 1. Check if the user already has an account based on email
        let existedUser = await User.findOne({ email: email });
        if (existedUser) {
            return NextResponse.json(
                { success: false, message: "An account with this email already exists." },
                { status: 400 } // CRITICAL: This sets res.ok to false on the frontend!
            );
        }

        // 2. Hash the password and store it 
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        // 3. Attempt database insertion
        const user = await User.create({ name: name, email: email, password: hash });
        
        // 4. Generate the session authorization token
        const token = jwt.sign(
            { userEmail: user.email, userId: user._id }, 
            process.env.JWT_SECRET
        );

        // 5. Securely bind the session cookie
        const cookieStore = await cookies();
        await cookieStore.set("token", token, {
            httpOnly: true, // Prevents client-side JS from reading the cookie (XSS protection)
            secure: process.env.NODE_ENV === "production", // HTTPS only in production
            sameSite: "strict", // Protects against CSRF attacks
            maxAge: 60 * 60 * 24 * 7, // 1 week in seconds
            path: "/", // Accessible across the entire app
        });

        // Return a clean 201 Created status code for successful creation
        return NextResponse.json(
            { success: true, message: "User created successfully", user: user },
            { status: 201 }
        );

    } catch (e) {
        console.error("Error in creating user execution:", e);
        return NextResponse.json(
            { success: false, message: "Error in creating the user account." },
            { status: 500 } // CRITICAL: Tells the frontend the database operation failed
        );
    }
}