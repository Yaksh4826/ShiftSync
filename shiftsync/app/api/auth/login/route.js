import { NextResponse } from "next/server";
import User from "@/models/User";
import bcrypt from "bcrypt"
import jsonwebtoken from "jsonwebtoken"
import { cookies } from "next/headers";




export async function POST(request){

let data  = await request.json()
let {email , password} = data;

// we need to first find if the email entered user has an account or not 

let foundedUser =  await User.findOne({email:email});

if(!foundedUser){
    return NextResponse.json({success:false, message: "Account does not exist please sign up"})
}

// now we need to compare with bcyrpt

const result =  await bcrypt.compare(password, foundedUser.password)
if(result == false){
    return NextResponse.json({success: false, message: "Please enter correct password"})
}
else{
    
// now correct password , so we set the cookies 

const token = jsonwebtoken.sign({ userEmail: foundedUser.email, userId: foundedUser._id }, process.env.JWT_SECRET);

const cookieStore = await cookies();
cookieStore.set("token", token,  {
            httpOnly: true, // Prevents client-side JS from reading the cookie (XSS protection)
            secure: process.env.NODE_ENV === "production", // HTTPS only in production
            sameSite: "strict", // Protects against CSRF attacks
            maxAge: 60 * 60 * 24 * 7, // 1 week in seconds
            path: "/", // Accessible across the entire app
        })


        return NextResponse.json({success: true , message:"Successfully logged in ", user: foundedUser})

}





}


