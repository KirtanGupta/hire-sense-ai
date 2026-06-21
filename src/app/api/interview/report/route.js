import { connectMongo } from "@/lib/mongodb";
import InterviewSession from "@/models/InterviewSession";
import { verifyToken } from "@/lib/auth";

function getToken(request) {
  const cookie = request.headers.get("cookie") || "";
  const match = cookie.match(/(?:^|; )token=([^;]+)/);
  return match ? match[1] : null;
}

// GET /api/interview/report?sessionId=xxx
export async function GET(request) {
  const token = getToken(request);
  if (!token) {
    return new Response(
      JSON.stringify({ success: false, message: "Not authenticated" }),
      { status: 401 }
    );
  }

  try {
    const payload = verifyToken(token);
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return new Response(
        JSON.stringify({ success: false, message: "sessionId is required." }),
        { status: 400 }
      );
    }

    await connectMongo();
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

    return new Response(JSON.stringify({ success: true, session }), { status: 200 });
  } catch (error) {
    console.error("report GET error:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Unable to fetch report." }),
      { status: 500 }
    );
  }
}
