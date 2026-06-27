import { NextResponse } from "next/server";
import { connectDB } from "@/lib/dbConnect";
import StudyPriorities from "@/models/StudyPriorities";

export async function POST(req, {params}) {
  await connectDB();

  const body = await req.json();
  const { subjectName, priority, color } = body;
const {userId} =  await params;

  if (!userId || !subjectName) {
    return NextResponse.json(
      { error: "Missing fields" },
      { status: 400 }
    );
  }

  const newPriority = await StudyPriorities.create({
    userId,
    subjectName,
    priority: priority || "medium",
    color: color || null
  });

  return NextResponse.json(newPriority);
}


export async function GET(req, {params}) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const {userId}= params;

  if (!userId) {
    return NextResponse.json(
      { error: "Missing userId" },
      { status: 400 }
    );
  }

  const priorities = await StudyPriorities.find({ userId });

  return NextResponse.json(priorities);
}