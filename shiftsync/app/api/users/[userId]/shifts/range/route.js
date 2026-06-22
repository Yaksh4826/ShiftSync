import { NextResponse } from "next/server";
import Shifts from "@/models/Shifts";
import { connectDB } from "@/lib/dbConnect";


export async function GET(request, {params}){

await connectDB();

const {searchParams}= new URL(request.url);
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  const {userId} = params;

    if (!start || !end || !userId) {
    return NextResponse.json(
      { error: "Missing parameters" },
      { status: 400 }
    );
  }

  const startDate = new Date(start);
  const endDate = new Date(end);

  const shifts= await Shifts.find({
    userId:userId,
    startDateTime:{
        $gte:startDate,
        $lte:endDate
    }
  }).sort({startDateTime:1});

  return NextResponse.json({success:true, shifts})


}