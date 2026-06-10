import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/dbConnect.js";
import User from "@/models/User";

export async function GET() {
  try {
    // 1. Grab the token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    // If no token exists, return unauthenticated status cleanly (no crash)
    if (!token) {
      return NextResponse.json(
        { authenticated: false, message: "No session token found" },
        { status: 401 }
      );
    }

    // 2. Decode and verify the token payload
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 3. Connect to DB and fetch the user profile
    await connectDB();
    const user = await User.findById(decoded.userId).select("-password"); // Hide password string for safety

    if (!user) {
      return NextResponse.json(
        { authenticated: false, message: "User account no longer exists" },
        { status: 404 }
      );
    }

    // 4. Return user data back to our Context Provider
    return NextResponse.json(
      {
        authenticated: true,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Session verification failed:", error.message);
    return NextResponse.json(
      { authenticated: false, message: "Invalid or expired token session" },
      { status: 401 }
    );
  }
}