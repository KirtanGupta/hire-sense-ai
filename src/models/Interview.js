import mongoose from "mongoose";

const InterviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      required: true,
    },
    score: {
      type: Number,
      default: 0,
    },
    feedback: {
      type: String,
      default: "",
    },
    interviewDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Interview = mongoose.models.Interview || mongoose.model("Interview", InterviewSchema);
export default Interview;
