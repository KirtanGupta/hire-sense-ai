import mongoose from "mongoose";

const ResumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    extractedText: {
      type: String,
      default: "",
    },
    extractedSkills: {
      type: [String],
      default: [],
    },
    skillCategories: {
      languages: {
        type: [String],
        default: [],
      },
      frameworks: {
        type: [String],
        default: [],
      },
      databases: {
        type: [String],
        default: [],
      },
      tools: {
        type: [String],
        default: [],
      },
      softSkills: {
        type: [String],
        default: [],
      },
    },
    recommendedRole: {
      type: String,
      default: "",
    },
    analysisScore: {
      type: Number,
      default: 0,
    },
    scoreBreakdown: {
      technicalSkills: {
        score: { type: Number, default: 0 },
        max: { type: Number, default: 40 },
      },
      projects: {
        score: { type: Number, default: 0 },
        max: { type: Number, default: 25 },
      },
      education: {
        score: { type: Number, default: 0 },
        max: { type: Number, default: 15 },
      },
      certifications: {
        score: { type: Number, default: 0 },
        max: { type: Number, default: 10 },
      },
      resumeStructure: {
        score: { type: Number, default: 0 },
        max: { type: Number, default: 10 },
      },
    },
    analysisSummary: {
      strengths: {
        type: [String],
        default: [],
      },
      weaknesses: {
        type: [String],
        default: [],
      },
      suggestions: {
        type: [String],
        default: [],
      },
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Resume = mongoose.models.Resume || mongoose.model("Resume", ResumeSchema);
export default Resume;
