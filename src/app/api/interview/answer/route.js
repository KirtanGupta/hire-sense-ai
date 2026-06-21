import { connectMongo } from "@/lib/mongodb";
import InterviewSession from "@/models/InterviewSession";
import User from "@/models/User";
import { verifyToken } from "@/lib/auth";

function getToken(request) {
  const cookie = request.headers.get("cookie") || "";
  const match = cookie.match(/(?:^|; )token=([^;]+)/);
  return match ? match[1] : null;
}

// POST /api/interview/answer  — save one answer (text or voice)
export async function POST(request) {
  const token = getToken(request);
  if (!token) {
    return new Response(JSON.stringify({ success: false, message: "Not authenticated" }), { status: 401 });
  }

  try {
    const payload = verifyToken(token);
    const body = await request.json();
    const {
      sessionId,
      questionIndex,
      answer,
      // ─── Phase 7 Voice Fields ───────────────────────────────────────────
      answerMode = "text",
      transcript = "",
      speechData = null,
    } = body;

    if (!sessionId || questionIndex === undefined || answer === undefined) {
      return new Response(
        JSON.stringify({ success: false, message: "sessionId, questionIndex, and answer are required." }),
        { status: 400 }
      );
    }

    await connectMongo();

    const user = await User.findById(payload.userId).select("isBlocked").lean();
    if (!user || user.isBlocked) {
      return new Response(JSON.stringify({ success: false, message: "Your account has been blocked." }), { status: 403 });
    }

    const idx = Number(questionIndex);
    const updateFields = {
      [`questions.${idx}.answer`]: String(answer),
      [`questions.${idx}.answerMode`]: answerMode,
      [`questions.${idx}.transcript`]: answerMode === "voice" ? String(transcript) : "",
    };

    // Only write speechData for voice answers
    if (answerMode === "voice" && speechData) {
      updateFields[`questions.${idx}.speechData`] = {
        fillerCount: speechData.fillerCount ?? 0,
        fillerWords: speechData.fillerWords ?? [],
        totalWords: speechData.totalWords ?? 0,
        wpm: speechData.wpm ?? 0,
        speedClassification: speechData.speedClassification ?? "",
        confidenceScore: speechData.confidenceScore ?? 0,
        voiceQualityScore: speechData.voiceQualityScore ?? 0,
        durationSeconds: speechData.durationSeconds ?? 0,
        pauseObservation: speechData.pauseObservation ?? "",
      };
    }

    const session = await InterviewSession.findOneAndUpdate(
      { _id: sessionId, userId: payload.userId, status: "in-progress" },
      { $set: updateFields },
      { new: true }
    );

    if (!session) {
      return new Response(
        JSON.stringify({ success: false, message: "Session not found or already completed." }),
        { status: 404 }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: "Answer saved." }),
      { status: 200 }
    );
  } catch (error) {
    console.error("answer route error:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Unable to save answer." }),
      { status: 500 }
    );
  }
}
