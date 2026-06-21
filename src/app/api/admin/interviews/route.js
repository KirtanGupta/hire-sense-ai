import { connectMongo } from "@/lib/mongodb";
import { verifyToken } from "@/lib/auth";
import InterviewSession from "@/models/InterviewSession";

export const dynamic = "force-dynamic";

function getToken(req) {
  const cookie = req.headers.get("cookie") || "";
  const match = cookie.match(/(?:^|; )token=([^;]+)/);
  return match ? match[1] : null;
}

function adminGuard(req) {
  const token = getToken(req);
  if (!token) return { error: "Not authenticated", status: 401 };
  try {
    const payload = verifyToken(token);
    if (payload.role !== "admin") return { error: "Admin access required", status: 403 };
    return { payload };
  } catch {
    return { error: "Invalid token", status: 401 };
  }
}

export async function GET(request) {
  const guard = adminGuard(request);
  if (guard.error) {
    return new Response(JSON.stringify({ success: false, message: guard.error }), { status: guard.status });
  }

  try {
    await connectMongo();

    const interviews = await InterviewSession.find({})
      .populate("userId", "fullName email")
      .sort({ createdAt: -1 })
      .lean();

    const total = interviews.length;
    const completed = interviews.filter((i) => i.status === "completed" || i.status === "evaluated").length;
    const evaluated = interviews.filter((i) => i.status === "evaluated");
    
    const avgScore = evaluated.length > 0
      ? Math.round(evaluated.reduce((s, i) => s + (i.overallScore || 0), 0) / evaluated.length)
      : null;

    return new Response(
      JSON.stringify({
        success: true,
        interviews,
        stats: { total, completed, avgScore },
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Admin interviews error:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Failed to fetch interviews." }),
      { status: 500 }
    );
  }
}
