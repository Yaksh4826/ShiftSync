import { NextResponse } from "next/server";
import Shifts from "@/models/Shifts";
import { connectDB } from "@/lib/dbConnect";


export async function GET(request, {params}){

await connectDB();


  const {userId} = params;

    if (!userId) {
    return NextResponse.json(
      { error: "Missing parameters" },
      { status: 400 }
    );
  }

  const shifts= await Shifts.find({
    userId:userId,
  }).sort({startDateTime:1});

  return NextResponse.json({success:true, shifts})


}