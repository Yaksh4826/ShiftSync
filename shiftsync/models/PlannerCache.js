import mongoose from "mongoose";

const PlannerCacheSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    weekStartDate: {
      type: Date,
      required: true,
      index: true
    },

    weekEndDate: {
      type: Date,
      required: true
    },

    // 🔥 FULL GENERATED OUTPUT
    weekPlan: {
      weekStart: { type: Date, required: true },
      weekEnd: { type: Date, required: true },

      shifts: [
        {
          title: String,
          start: Date,
          end: Date,
          type: {
            type: String,
            default: "shift"
          }
        }
      ],

      study: [
        {
          title: String,
          start: Date,
          end: Date,
          type: {
            type: String,
            default: "study"
          }
        }
      ],

      freeSlots: [
        {
          start: Date,
          end: Date
        }
      ]
    },

    // 🔥 META CONTROL (VERY IMPORTANT)
    generatedAt: {
      type: Date,
      default: Date.now
    },

    invalidated: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  { timestamps: true }
);

// 🔥 fast lookup for planner fetch
PlannerCacheSchema.index({ userId: 1, weekStartDate: 1 });

export default mongoose.models.PlannerCache ||
  mongoose.model("PlannerCache", PlannerCacheSchema);