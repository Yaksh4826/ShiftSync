import mongoose from "mongoose";

const PlannerCacheSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  weekStartDate: { type: String, required: true },

  generatedAt: { type: Date, default: Date.now },

  calendarEvents: { type: Array, default: [] },

  invalidated: { type: Boolean, default: false }
}, { timestamps: true });

PlannerCacheSchema.index({ userId: 1, weekStartDate: 1 });

export default mongoose.models.PlannerCache ||
  mongoose.model("PlannerCache", PlannerCacheSchema);