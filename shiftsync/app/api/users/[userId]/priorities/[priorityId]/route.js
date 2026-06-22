import { NextResponse } from "next/server";
import { connectDB } from "@/lib/dbConnect";
import StudyPriorities from "@/models/StudyPriorities";

export async function PATCH(req, { params }) {
  await connectDB();

  const body = await req.json();

  const updated = await StudyPriorities.findByIdAndUpdate(
    params.id,
    {
      $set: body
    },
    { new: true }
  );

  if (!updated) {
    return NextResponse.json(
      { error: "Not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(updated);
}


export async function DELETE(req, { params }) {
  await connectDB();

  const deleted = await StudyPriorities.findByIdAndDelete(params.id);

  if (!deleted) {
    return NextResponse.json(
      { error: "Not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    message: "Priority removed"
  });
}