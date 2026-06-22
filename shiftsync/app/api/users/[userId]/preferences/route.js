import { NextResponse } from "next/server";
import SchedulePreferences from "@/models/SchedulePreferences";
import { connectDB } from "@/lib/dbConnect";


export async function GET(request, { params }) {
    try {
        await connectDB();
        const { userId } = await params;

        const preferences = await SchedulePreferences.find({ userId: userId });

        return NextResponse.json({ success: true, preferences: preferences });
    } catch (e) {

        return NextResponse.json({ success: false, error: e })
    }



}





export async function POST(request, { params }) {
    try {
        await connectDB();
        const { userId } = await params;
        const data = request.json();
        const { wakeTime, sleepTime, preferredStudyHoursPerDay } = data;

        await SchedulePreferences.insertOne({ userId: userId, wakeTime: wakeTime, sleepTime, sleepTime, preferredStudyHoursPerDay: preferredStudyHoursPerDay });



        return NextResponse.json({ success: true, preferences: preferences });
    } catch (e) {

        return NextResponse.json({ success: false, error: e })
    }


}



export async function PATCH(request, {params}) {

try {
    await connectDB();
    const {userId}= params;
    const body = await req.json();
    const {...updates } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    // Update the document
    const updated = await SchedulePreference.findOneAndUpdate(
      { userId },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return NextResponse.json(
        { error: "SchedulePreference not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Schedule preference updated",
      data: updated,
    });
  } catch (error) {
    console.error("PATCH error:", error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
