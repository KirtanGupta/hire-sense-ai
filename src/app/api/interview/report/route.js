import { connectMongo } from "@/lib/mongodb";
import InterviewSession from "@/models/InterviewSession";
import User from "@/models/User";
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

    const user = await User.findById(payload.userId).select("isBlocked role").lean();
    if (!user || user.isBlocked) {
      return new Response(JSON.stringify({ success: false, message: "Your account has been blocked." }), { status: 403 });
    }

    // Admins can view any session; regular users can only view their own
    const query = { _id: sessionId };
    if (user.role !== "admin") {
      query.userId = payload.userId;
    }

    const session = await InterviewSession.findOne(query).lean();

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
