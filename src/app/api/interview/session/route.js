import { connectMongo } from "@/lib/mongodb";
import InterviewSession from "@/models/InterviewSession";
import User from "@/models/User";
import { verifyToken } from "@/lib/auth";

function getToken(request) {
  const cookie = request.headers.get("cookie") || "";
  const match = cookie.match(/(?:^|; )token=([^;]+)/);
  return match ? match[1] : null;
}

// GET /api/interview/session?sessionId=xxx  — fetch a session
export async function GET(request) {
  const token = getToken(request);
  if (!token) {
    return new Response(JSON.stringify({ success: false, message: "Not authenticated" }), { status: 401 });
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

    return new Response(JSON.stringify({ success: true, session }), { status: 200 });
  } catch (error) {
    console.error("session GET error:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Unable to fetch session." }),
      { status: 500 }
    );
  }
}
