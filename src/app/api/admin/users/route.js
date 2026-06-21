// GET /api/admin/users — Fetch all users (admin only)

export const dynamic = "force-dynamic";

import { connectMongo } from "@/lib/mongodb";
import { verifyToken } from "@/lib/auth";
import User from "@/models/User";
import InterviewSession from "@/models/InterviewSession";
import Resume from "@/models/Resume";

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

    const users = await User.find({})
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();

    // Attach interview + resume counts per user in one pass
    const userIds = users.map((u) => u._id);

    const [interviewCounts, resumeCounts] = await Promise.all([
      InterviewSession.aggregate([
        { $match: { userId: { $in: userIds } } },
        { $group: { _id: "$userId", count: { $sum: 1 }, avgScore: { $avg: "$overallScore" } } },
      ]),
      Resume.aggregate([
        { $match: { userId: { $in: userIds } } },
        { $group: { _id: "$userId", count: { $sum: 1 } } },
      ]),
    ]);

    const interviewMap = {};
    interviewCounts.forEach((r) => { interviewMap[r._id.toString()] = r; });
    const resumeMap = {};
    resumeCounts.forEach((r) => { resumeMap[r._id.toString()] = r; });

    const enriched = users.map((u) => {
      const id = u._id.toString();
      return {
        ...u,
        _id: id,
        interviewCount: interviewMap[id]?.count || 0,
        avgScore: interviewMap[id]?.avgScore
          ? Math.round(interviewMap[id].avgScore)
          : null,
        resumeCount: resumeMap[id]?.count || 0,
      };
    });

    // Summary stats
    const totalUsers = users.filter((u) => u.role === "user").length;
    const totalAdmins = users.filter((u) => u.role === "admin").length;
    const totalBlocked = users.filter((u) => u.isBlocked).length;
    const totalActive = totalUsers - totalBlocked;

    return new Response(
      JSON.stringify({
        success: true,
        users: enriched,
        stats: { totalUsers, totalAdmins, totalBlocked, totalActive },
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Admin users error:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Failed to fetch users." }),
      { status: 500 }
    );
  }
}
