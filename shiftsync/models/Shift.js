import mongoose from 'mongoose';

const ShiftSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  jobProfileId: { type: mongoose.Schema.Types.ObjectId, ref: 'JobProfile', required: true },
  date: { type: Date, required: true },       // Midnight UTC (YYYY-MM-DDT00:00:00.000Z)
  startTime: { type: Date, required: true },  // Complete ISO Timestamp
  endTime: { type: Date, required: true },    // Complete ISO Timestamp
  role: { type: String, required: true },     // Snapshot of role at time of shift
  format: { type: String, enum: ['offline', 'hybrid', 'online'], required: true },
  location: { type: String, required: true },  // Exact location string or "Remote"
  isOcrParsed: { type: Boolean, default: false }, // true for A&W scans, false for Centennial manual inputs
  createdAt: { type: Date, default: Date.now }
});

ShiftSchema.index({ userId: 1, date: 1 });

export default mongoose.models.Shift || mongoose.model('Shift', ShiftSchema);