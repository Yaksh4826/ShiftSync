import PlannerCache from "@/models/PlannerCache";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/dbConnect";
import StudyPriorities from "@/models/StudyPriorities";
import SchedulePreferences from "@/models/SchedulePreferences";
import Shifts from "@/models/Shifts";

export async function POST(request, { params }) {
  try {
    await connectDB();

    const { userId } = await params;
    const body = await request.json();

    const { weekStartDate } = body;

    // -------------------------------
    // 1. VALIDATION
    // -------------------------------
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Missing userId" },
        { status: 400 }
      );
    }

    if (!weekStartDate) {
      return NextResponse.json(
        { success: false, error: "Missing weekStartDate" },
        { status: 400 }
      );
    }

    const weekStart = new Date(weekStartDate);

    if (isNaN(weekStart.getTime())) {
      return NextResponse.json(
        { success: false, error: "Invalid weekStartDate" },
        { status: 400 }
      );
    }

    // -------------------------------
    // 2. FETCH DATA SAFELY
    // -------------------------------

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const shifts = await Shifts.find({
      userId,
      startDateTime: {
        $gte: weekStart,
        $lte: weekEnd
      }
    });

    const priorities = await StudyPriorities.find({ userId });

    const preferencesDoc = await SchedulePreferences.findOne({ userId });

    // -------------------------------
    // 3. NULL SAFETY (VERY IMPORTANT)
    // -------------------------------

    if (!preferencesDoc) {
      return NextResponse.json(
        { success: false, error: "Preferences not set" },
        { status: 400 }
      );
    }

    const preferences = {
      wakeTime: preferencesDoc.wakeTime || "08:00",
      sleepTime: preferencesDoc.sleepTime || "22:00",
      maxStudyBlockMinutes:
        preferencesDoc.maxStudyBlockMinutes || 90,
      breakMinutes: preferencesDoc.breakMinutes || 15
    };

    if (!priorities || priorities.length === 0) {
      return NextResponse.json(
        { success: false, error: "No study priorities found" },
        { status: 400 }
      );
    }

    // -------------------------------
    // 4. PREP PRIORITIES
    // -------------------------------

    const priorityRank = { high: 3, medium: 2, low: 1 };

    const subjects = [...priorities].sort(
      (a, b) =>
        priorityRank[b.priority] - priorityRank[a.priority]
    );

    // -------------------------------
    // 5. SHIFT PROCESSING
    // -------------------------------

    const intervals = (shifts || [])
      .map(s => ({
        start: new Date(s.startDateTime),
        end: new Date(s.endDateTime)
      }))
      .sort((a, b) => a.start - b.start);

    // -------------------------------
    // 6. FREE SLOT GENERATION
    // -------------------------------

    const freeSlots = [];
    let cursor = new Date(weekStart);

    for (const block of intervals) {
      if (block.end < weekStart) continue;
      if (block.start > weekEnd) break;

      if (cursor < block.start) {
        freeSlots.push({
          start: new Date(cursor),
          end: new Date(block.start)
        });
      }

      cursor = new Date(
        Math.max(cursor, block.end)
      );
    }

    if (cursor < weekEnd) {
      freeSlots.push({
        start: new Date(cursor),
        end: new Date(weekEnd)
      });
    }

    // -------------------------------
    // 7. STUDY ALLOCATION
    // -------------------------------

    const studyBlocks = [];
    let subjectIndex = 0;

    for (const slot of freeSlots) {
      let pointer = new Date(slot.start);

      while (pointer < slot.end) {
        const subject = subjects[subjectIndex];

        const maxBlock =
          preferences.maxStudyBlockMinutes * 60 * 1000;

        const nextEnd = new Date(
          Math.min(
            pointer.getTime() + maxBlock,
            slot.end.getTime()
          )
        );

        studyBlocks.push({
          title: subject.subjectName,
          start: new Date(pointer),
          end: nextEnd,
          type: "study"
        });

        pointer = new Date(
          nextEnd.getTime() +
            preferences.breakMinutes * 60 * 1000
        );

        subjectIndex =
          (subjectIndex + 1) % subjects.length;
      }
    }

    // -------------------------------
    // 8. FINAL OUTPUT
    // -------------------------------

    const weekPlan = {
      weekStart,
      weekEnd,
      shifts: intervals.map(i => ({
        title: "Shift",
        start: i.start,
        end: i.end,
        type: "shift"
      })),
      study: studyBlocks,
      freeSlots
    };

    // -------------------------------
    // 9. SAVE (UPSERT)
    // -------------------------------

    const saved = await PlannerCache.findOneAndUpdate(
      { userId, weekStartDate },
      {
        userId,
        weekStartDate,
        weekPlan,
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    );

    // -------------------------------
    // 10. RESPONSE
    // -------------------------------

    return NextResponse.json({
      success: true,
      weekPlan: saved
    });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: "Planner failed",
        details: err.message
      },
      { status: 500 }
    );
  }
}