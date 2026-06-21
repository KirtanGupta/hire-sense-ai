import mongoose from "mongoose";

const EvaluationSchema = new mongoose.Schema(
  {
    score: { type: Number, default: 0 },          // 0-100 (derived)
    technicalScore: { type: Number, default: 0 }, // 0-10 (raw from LLM)
    completeness: { type: Number, default: 0 },   // 0-10
    communication: { type: Number, default: 0 },  // 0-10
    strengths: { type: [String], default: [] },
    weaknesses: { type: [String], default: [] },
    feedback: { type: String, default: "" },
  },
  { _id: false }
);

const QuestionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    answer: { type: String, default: "" },
    type: { type: String, default: "technical" },
    evaluation: { type: EvaluationSchema, default: null },
  },
  { _id: false }
);

const InterviewSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: { type: String, required: true },
    difficulty: { type: String, required: true, enum: ["Easy", "Medium", "Hard"] },
    experience: { type: String, required: true },
    skills: { type: [String], default: [] },
    questions: { type: [QuestionSchema], default: [] },
    status: {
      type: String,
      default: "in-progress",
      enum: ["in-progress", "completed", "evaluated"],
    },
    totalQuestions: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },

    // ─── Phase 6 Evaluation Fields ─────────────────────────────────────────
    overallScore: { type: Number, default: null },
    technicalScore: { type: Number, default: null },
    communicationScore: { type: Number, default: null },
    confidenceScore: { type: Number, default: null },
    strengths: { type: [String], default: [] },
    weaknesses: { type: [String], default: [] },
    recommendation: { type: String, default: "" },
  },
  { timestamps: true }
);

// Clear model cache so schema updates take effect in development
if (mongoose.models.InterviewSession) {
  delete mongoose.models.InterviewSession;
}

const InterviewSession = mongoose.model("InterviewSession", InterviewSessionSchema);
export default InterviewSession;
