import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken";
import User from "@/models/User";
import { connectDB } from "@/lib/dbConnect";




export async function POST(request) {
    await connectDB();

    // const {name, email , password } = request;
    let data = await request.json();
    let { name, email, password } = data;

    // first we need to check if the user already has an account based on email

    let existedUser = await User.findOne({ email: email })
    if (existedUser) {
        return NextResponse.json({ success: false, message: "Something went wrong, user already exists" })
    }


    // we need to hash the password and store it 
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt,);
    try {


        const user = await User.create({ name: name, email: email, password: hash })
        const token = jwt.sign({ userEmail: user.email, userId: user._id }, process.env.JWT_SECRET)
        //NOW WE SET THIS TOKEN IN THE AUTH

        const cookieStore =  await cookies();
        await cookieStore.set("token", token, {
            httpOnly: true, // Prevents client-side JS from reading the cookie (XSS protection)
            secure: process.env.NODE_ENV === "production", // HTTPS only in production
            sameSite: "strict", // Protects against CSRF attacks
            maxAge: 60 * 60 * 24 * 7, // 1 week in seconds
            path: "/", // Accessible across the entire app
        })

        return NextResponse.json({ success: true, message: "user created successfully", user: user })


    } catch (e) {
        console.log("error in creating user")
        return NextResponse.json({ success: false, message: "Errror in creating the user" })
    }







    

}