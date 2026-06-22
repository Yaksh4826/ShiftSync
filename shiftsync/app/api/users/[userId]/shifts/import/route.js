import { connectDB } from "@/lib/dbConnect";
import Shifts from "@/models/Shifts";
import { NextResponse } from "next/server";
import { success } from "zod";

// basically we are svaing the schedule of the shifts



export async function POST(request, {params}){
try{
await connectDB();
const {userId} = params;

const data = request.json();
const {shifts} = data;

const formattedShifts = shifts.map((item)=>({
        userId:userId,
        startDateTime: item.startDateTime,
        endDateTime:item.endDateTime

}));


// bulk insert with mongo db

await Shifts.insertMany(formattedShifts);

return NextResponse.json({success:true, message:`inserted ${formattedShifts.length} documents`})

}catch(e){

    return NextResponse.json({success:false, error:e})
}







}