import { connectMongo } from "@/lib/mongodb";
import InterviewSession from "@/models/InterviewSession";
import { verifyToken } from "@/lib/auth";

function getToken(request) {
  const cookie = request.headers.get("cookie") || "";
  const match = cookie.match(/(?:^|; )token=([^;]+)/);
  return match ? match[1] : null;
}

// POST /api/interview/answer  — save one answer
export async function POST(request) {
  const token = getToken(request);
  if (!token) {
    return new Response(JSON.stringify({ success: false, message: "Not authenticated" }), { status: 401 });
  }

  try {
    const payload = verifyToken(token);
    const body = await request.json();
    const { sessionId, questionIndex, answer } = body;

    if (!sessionId || questionIndex === undefined || answer === undefined) {
      return new Response(
        JSON.stringify({ success: false, message: "sessionId, questionIndex, and answer are required." }),
        { status: 400 }
      );
    }

    await connectMongo();

    const updateKey = `questions.${Number(questionIndex)}.answer`;
    const session = await InterviewSession.findOneAndUpdate(
      { _id: sessionId, userId: payload.userId, status: "in-progress" },
      { $set: { [updateKey]: String(answer) } },
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
