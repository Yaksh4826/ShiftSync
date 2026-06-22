import mongoose from "mongoose";

const SchedulePreferenceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  wakeTime: { type: String },  // "07:00"
  sleepTime: { type: String }, // "23:30"

  maxStudyBlockMinutes: { type: Number, default: 90 },
  breakMinutes: { type: Number, default: 15 },

  preferredStudyHoursPerDay: { type: Number, default: 3 },

  energyPattern: {
    type: String,
    enum: ["morning", "evening", "balanced"],
    default: "balanced"
  }
}, { timestamps: true });

export default mongoose.models.SchedulePreference ||
  mongoose.model("SchedulePreference", SchedulePreferenceSchema);