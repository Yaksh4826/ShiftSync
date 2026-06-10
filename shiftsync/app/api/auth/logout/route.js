import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();

    // Overwrite the cookie with an empty string and expire it immediately
    cookieStore.set("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 0, // 0 seconds means delete right now
      path: "/", // Must match the exact path path used when creating the cookie
    });

    return NextResponse.json(
      { success: true, message: "Successfully logged out clean" },
      { status: 200 } // 200 OK standard
    );
    
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Error during logout execution" },
      { status: 500 } // 500 Server Error
    );
  }
}