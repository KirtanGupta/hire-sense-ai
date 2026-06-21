import { connectMongo } from "@/lib/mongodb";
import InterviewSession from "@/models/InterviewSession";
import User from "@/models/User";
import { verifyToken } from "@/lib/auth";
import { evaluateSession } from "@/services/evaluationService";

// Allow up to 2 minutes — evaluation makes N LLM calls sequentially
export const maxDuration = 120;

function getToken(request) {
  const cookie = request.headers.get("cookie") || "";
  const match = cookie.match(/(?:^|; )token=([^;]+)/);
  return match ? match[1] : null;
}

export async function POST(request) {
  const token = getToken(request);
  if (!token) {
    return new Response(
      JSON.stringify({ success: false, message: "Not authenticated" }),
      { status: 401 }
    );
  }

  try {
    const payload = verifyToken(token);
    const body = await request.json();
    const { sessionId } = body;

    if (!sessionId) {
      return new Response(
        JSON.stringify({ success: false, message: "sessionId is required." }),
        { status: 400 }
      );
    }

    await connectMongo();

    const user = await User.findById(payload.userId).select("isBlocked").lean();
    if (!user || user.isBlocked) {
      return new Response(JSON.stringify({ success: false, message: "Your account has been blocked." }), { status: 403 });
    }

    const session = await InterviewSession.findOne({
      _id: sessionId,
      userId: payload.userId,
    }).lean();

    if (!session) {
      return new Response(
        JSON.stringify({ success: false, message: "Session not found." }),
        { status: 404 }
      );
    }

    // Already evaluated — return existing data immediately
    if (session.status === "evaluated") {
      return new Response(
        JSON.stringify({ success: true, session, cached: true }),
        { status: 200 }
      );
    }

    if (session.status !== "completed") {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Interview must be completed before evaluation.",
        }),
        { status: 400 }
      );
    }

    // Run the evaluation
    const result = await evaluateSession(session);

    // Persist results to MongoDB
    const updated = await InterviewSession.findByIdAndUpdate(
      sessionId,
      {
        $set: {
          questions: result.evaluatedQuestions,
          overallScore: result.overallScore,
          technicalScore: result.technicalScore,
          communicationScore: result.communicationScore,
          confidenceScore: result.confidenceScore,
          strengths: result.strengths,
          weaknesses: result.weaknesses,
          recommendation: result.recommendation,
          status: "evaluated",
          // ─── Phase 7 Voice Fields ─────────────────────────────────────────
          voiceScore: result.voiceScore ?? null,
          averageWPM: result.averageWPM ?? null,
          averageConfidence: result.averageConfidence ?? null,
          totalFillerWords: result.totalFillerWords ?? 0,
          interviewMode: result.interviewMode ?? "text",
        },
      },
      { new: true }
    ).lean();

    return new Response(
      JSON.stringify({
        success: true,
        session: updated,
        message: "Evaluation complete.",
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("evaluate route error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Evaluation failed. Please try again.",
      }),
      { status: 500 }
    );
  }
}
