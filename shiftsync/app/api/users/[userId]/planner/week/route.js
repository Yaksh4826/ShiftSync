import PlannerCache from "@/models/PlannerCache";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/dbConnect";
import StudyPriorities from "@/models/StudyPriorities";
import SchedulePreferences from "@/models/SchedulePreferences";
import Shifts from "@/models/Shifts";

const MS = 60 * 1000;

// convert HH:mm → minutes from midnight
function timeToMinutes(time) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

// clamp a datetime into wake-sleep window
function clampToDayBounds(date, wakeMin, sleepMin) {
  const d = new Date(date);
  const mins = d.getUTCHours() * 60 + d.getUTCMinutes();

  if (mins < wakeMin) {
    d.setUTCHours(Math.floor(wakeMin / 60), wakeMin % 60, 0, 0);
  }

  if (mins > sleepMin) {
    return null; // outside usable day time
  }

  return d;
}

// check overlap
function isValidBlock(start, end, sleepLimit) {
  return start && end && end <= sleepLimit && start < end;
}

export async function POST(request, { params }) {
  try {
    await connectDB();

    const { userId } = await params;
    const body = await request.json();
    const { weekStartDate } = body;

    if (!userId || !weekStartDate) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const weekStart = new Date(weekStartDate);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    // -------------------------------
    // FETCH DATA
    // -------------------------------
    const shifts = await Shifts.find({ userId });

    const priorities = await StudyPriorities.find({ userId });

    const preferencesDoc = await SchedulePreferences.findOne({ userId });

    if (!preferencesDoc) {
      return NextResponse.json(
        { success: false, error: "Preferences not set" },
        { status: 400 }
      );
    }

    const preferences = {
      wakeTime: preferencesDoc.wakeTime || "08:00",
      sleepTime: preferencesDoc.sleepTime || "22:00",
      maxStudyBlockMinutes: preferencesDoc.maxStudyBlockMinutes || 90,
      breakMinutes: preferencesDoc.breakMinutes || 15,
      maxDailyStudyHours: preferencesDoc.maxDailyStudyHours || 6
    };

    if (!priorities.length) {
      return NextResponse.json(
        { success: false, error: "No priorities found" },
        { status: 400 }
      );
    }

    // -------------------------------
    // PRIORITY SCORING
    // -------------------------------
    const priorityWeight = { high: 3, medium: 2, low: 1 };

    let subjects = priorities.map(p => ({
      subjectName: p.subjectName,
      weight: priorityWeight[p.priority] || 1,
      remaining: (p.estimatedHours || 10) * 60
    }));

    const totalWeight = subjects.reduce((a, s) => a + s.weight, 0);

    // -------------------------------
    // SHIFT PROCESSING
    // -------------------------------
    const intervals = (shifts || [])
      .map(s => ({
        start: new Date(s.startDateTime),
        end: new Date(s.endDateTime)
      }))
      .sort((a, b) => a.start - b.start);

    // -------------------------------
    // FREE SLOT GENERATION
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

      cursor = new Date(Math.max(cursor, block.end));
    }

    if (cursor < weekEnd) {
      freeSlots.push({
        start: new Date(cursor),
        end: new Date(weekEnd)
      });
    }

    // -------------------------------
    // STUDY ALLOCATION (REALISTIC)
    // -------------------------------
    const studyBlocks = [];

    const wakeMin = timeToMinutes(preferences.wakeTime);
    const sleepMin = timeToMinutes(preferences.sleepTime);

    const sleepLimit = new Date(weekStart);
    sleepLimit.setUTCHours(Math.floor(sleepMin / 60), sleepMin % 60, 0, 0);

    const maxDailyMs = preferences.maxDailyStudyHours * 60 * MS * 60;

    const dailyTracker = {};

    function canStudyMore(date) {
      const key = date.toISOString().split("T")[0];
      dailyTracker[key] = dailyTracker[key] || 0;
      return dailyTracker[key] < maxDailyMs;
    }

    function addStudyTime(date, duration) {
      const key = date.toISOString().split("T")[0];
      dailyTracker[key] = (dailyTracker[key] || 0) + duration;
    }

    for (const slot of freeSlots) {
      let pointer = new Date(slot.start);

      while (pointer < slot.end) {
        const clampedStart = clampToDayBounds(pointer, wakeMin, sleepMin);

        if (!clampedStart) break;

        if (!canStudyMore(clampedStart)) {
          pointer = new Date(clampedStart.getTime() + MS * 30);
          continue;
        }

        const subject = subjects
          .sort((a, b) => b.weight - a.weight)[0];

        if (!subject) break;

        const maxBlock = preferences.maxStudyBlockMinutes * MS;

        let nextEnd = new Date(
          Math.min(pointer.getTime() + maxBlock, slot.end.getTime())
        );

        const duration = nextEnd - pointer;

        if (!isValidBlock(pointer, nextEnd, sleepLimit)) {
          break;
        }

        if (subject.remaining <= 0) {
          subjects.shift();
          continue;
        }

        const actualDuration = Math.min(duration, subject.remaining * MS);

        const finalEnd = new Date(pointer.getTime() + actualDuration);

        studyBlocks.push({
          title: subject.subjectName,
          start: new Date(pointer),
          end: finalEnd,
          type: "study"
        });

        subject.remaining -= actualDuration / MS;
        addStudyTime(pointer, actualDuration);

        pointer = new Date(
          finalEnd.getTime() + preferences.breakMinutes * MS
        );
      }
    }

    // -------------------------------
    // OUTPUT
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
    // SAVE
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

    return NextResponse.json({
      success: true,
      saved
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