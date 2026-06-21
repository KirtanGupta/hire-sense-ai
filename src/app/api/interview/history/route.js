import { connectMongo } from "@/lib/mongodb";
import InterviewSession from "@/models/InterviewSession";
import User from "@/models/User";
import { verifyToken } from "@/lib/auth";

function getToken(request) {
  const cookie = request.headers.get("cookie") || "";
  const match = cookie.match(/(?:^|; )token=([^;]+)/);
  return match ? match[1] : null;
}

export async function GET(request) {
  const token = getToken(request);
  if (!token) {
    return new Response(JSON.stringify({ success: false, message: "Not authenticated" }), { status: 401 });
  }

  try {
    const payload = verifyToken(token);
    await connectMongo();

    const user = await User.findById(payload.userId).select("isBlocked").lean();
    if (!user || user.isBlocked) {
      return new Response(JSON.stringify({ success: false, message: "Your account has been blocked." }), { status: 403 });
    }
    const sessions = await InterviewSession.find({ userId: payload.userId })
      .sort({ createdAt: -1 })
      .select("role difficulty experience status totalQuestions createdAt overallScore technicalScore confidenceScore interviewMode voiceScore")
      .lean();

    return new Response(JSON.stringify({ success: true, interviews: sessions }), { status: 200 });
  } catch (error) {
    console.error("history route error:", error);
    return new Response(JSON.stringify({ success: false, message: "Unable to load history" }), { status: 400 });
  }
}
