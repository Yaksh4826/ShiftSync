import mongoose from 'mongoose';

const StudyProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  institutionName: { type: String, default: "Centennial College", trim: true },
  courseCode: { type: String, required: true, trim: true },   // e.g., "COMP-308" or "AI-SYSTEMS"
  courseName: { type: String, required: true, trim: true },   // e.g., "Emerging AI Technologies"
  professorName: { type: String, trim: true },
  semester: { type: String, default: "Summer 2026", trim: true },
  colorTheme: { type: String, default: "#1d4ed8" },          // Hex code for blue calendar academic blocks
  createdAt: { type: Date, default: Date.now }
});

// Avoid duplicate courses within the same semester for a user
StudyProfileSchema.index({ userId: 1, courseCode: 1, semester: 1 }, { unique: true });

export default mongoose.modes.StudyProfile || mongoose.model('StudyProfile', StudyProfileSchema);