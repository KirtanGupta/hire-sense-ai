import { connectMongo } from "@/lib/mongodb";
import Resume from "@/models/Resume";
import InterviewSession from "@/models/InterviewSession";
import { verifyToken } from "@/lib/auth";
import { generateInterviewQuestions } from "@/services/llmService";

function getToken(request) {
  const cookie = request.headers.get("cookie") || "";
  const match = cookie.match(/(?:^|; )token=([^;]+)/);
  return match ? match[1] : null;
}

export async function POST(request) {
  const token = getToken(request);
  if (!token) {
    return new Response(JSON.stringify({ success: false, message: "Not authenticated" }), { status: 401 });
  }

  try {
    const payload = verifyToken(token);
    const body = await request.json();
    const { role, difficulty, experience, questionCount = 5 } = body;

    if (!role || !difficulty || !experience) {
      return new Response(
        JSON.stringify({ success: false, message: "role, difficulty, and experience are required." }),
        { status: 400 }
      );
    }

    const validDifficulties = ["Easy", "Medium", "Hard"];
    if (!validDifficulties.includes(difficulty)) {
      return new Response(
        JSON.stringify({ success: false, message: "difficulty must be Easy, Medium, or Hard." }),
        { status: 400 }
      );
    }

    const count = Math.min(Math.max(Number(questionCount) || 5, 1), 15);

    // Fetch candidate skills from latest resume
    await connectMongo();
    const resume = await Resume.findOne({ userId: payload.userId })
      .sort({ uploadedAt: -1 })
      .lean();

    const skills = resume?.extractedSkills || [];

    // Generate questions via LLM (falls back to static bank on failure)
    const questionTexts = await generateInterviewQuestions({
      role,
      difficulty,
      experience,
      skills,
      questionCount: count,
    });

    const questions = questionTexts.map((q) => ({
      question: String(q).trim(),
      answer: "",
      type: "technical",
    }));

    // Save session to MongoDB
    const session = await InterviewSession.create({
      userId: payload.userId,
      role,
      difficulty,
      experience,
      skills,
      questions,
      status: "in-progress",
      totalQuestions: questions.length,
    });

    return new Response(
      JSON.stringify({
        success: true,
        sessionId: session._id.toString(),
        totalQuestions: session.totalQuestions,
        message: "Interview session created successfully.",
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error("generate route error:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Unable to generate interview. Please try again." }),
      { status: 500 }
    );
  }
}
