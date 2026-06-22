import mongoose from "mongoose";

const StudyPrioritySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  subjectName: { type: String, required: true },

  priority: {
    type: String,
    enum: ["high", "medium", "low"],
    default: "medium"
  },

  color: { type: String }
}, { timestamps: true });

StudyPrioritySchema.index({ userId: 1 });

export default mongoose.models.StudyPriority ||
  mongoose.model("StudyPriority", StudyPrioritySchema);