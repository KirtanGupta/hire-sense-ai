import { connectMongo } from "@/lib/mongodb";
import { verifyToken } from "@/lib/auth";
import Resume from "@/models/Resume";

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

    const resumes = await Resume.find({})
      .populate("userId", "fullName email")
      .sort({ uploadedAt: -1 })
      .lean();

    const total = resumes.length;
    let avgScore = null;
    let highestScore = null;
    let lowestScore = null;

    if (total > 0) {
      const scores = resumes.map(r => r.analysisScore || 0);
      avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / total);
      highestScore = Math.max(...scores);
      lowestScore = Math.min(...scores);
    }

    return new Response(
      JSON.stringify({
        success: true,
        resumes,
        stats: { total, avgScore, highestScore, lowestScore },
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Admin resumes error:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Failed to fetch resumes." }),
      { status: 500 }
    );
  }
}
