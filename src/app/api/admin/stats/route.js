// GET /api/admin/stats — Admin Dashboard Statistics
// Protected: only accessible with admin JWT token

export const dynamic = "force-dynamic";

import { connectMongo } from "@/lib/mongodb";
import { verifyToken } from "@/lib/auth";
import User from "@/models/User";
import InterviewSession from "@/models/InterviewSession";
import Resume from "@/models/Resume";

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
    if (payload.role !== "admin") {
      return new Response(JSON.stringify({ success: false, message: "Admin access required" }), { status: 403 });
    }

    await connectMongo();

    // Run all counts in parallel
    const [
      totalUsers,
      totalInterviews,
      totalResumes,
      evaluatedSessions,
      voiceInterviews,
      recentUsers,
      roleStats,
      resumeStats,
      userScores,
    ] = await Promise.all([
      User.countDocuments({ role: "user" }),
      InterviewSession.countDocuments(),
      Resume.countDocuments(),
      InterviewSession.find({ status: { $in: ["completed", "evaluated"] } }, { overallScore: 1 }).lean(),
      InterviewSession.countDocuments({ interviewMode: { $in: ["voice", "mixed"] } }),
      User.find({ role: "user" })
        .sort({ createdAt: -1 })
        .limit(5)
        .select("fullName email createdAt")
        .lean(),
      InterviewSession.aggregate([
        { $group: { _id: "$role", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 1 }
      ]),
      Resume.aggregate([
        { $group: { _id: null, avg: { $avg: "$analysisScore" } } }
      ]),
      InterviewSession.aggregate([
        { $match: { status: { $in: ["completed", "evaluated"] }, overallScore: { $ne: null } } },
        { $group: { _id: "$userId", avgScore: { $avg: "$overallScore" } } },
        { $sort: { avgScore: -1 } },
        { $limit: 1 }
      ])
    ]);

    let topCandidateName = "N/A";
    let topCandidateScore = null;
    if (userScores.length > 0) {
      const topUser = await User.findById(userScores[0]._id).select("fullName").lean();
      if (topUser) {
        topCandidateName = topUser.fullName;
        topCandidateScore = Math.round(userScores[0].avgScore);
      }
    }

    // Compute average overall score
    const avgScore =
      evaluatedSessions.length > 0
        ? Math.round(
            evaluatedSessions.reduce((sum, s) => sum + (s.overallScore || 0), 0) /
              evaluatedSessions.length
          )
        : 0;

    return new Response(
      JSON.stringify({
        success: true,
        stats: {
          totalUsers,
          totalInterviews,
          totalResumes,
          totalEvaluated: evaluatedSessions.length,
          voiceInterviews,
          averageScore: avgScore,
          avgResumeScore: resumeStats.length > 0 && resumeStats[0].avg ? Math.round(resumeStats[0].avg) : null,
          mostSelectedRole: roleStats.length > 0 ? roleStats[0]._id : "N/A",
          topCandidate: {
            name: topCandidateName,
            score: topCandidateScore
          },
          recentUsers: recentUsers.map((u) => ({
            id: u._id,
            fullName: u.fullName,
            email: u.email,
            joinedAt: u.createdAt,
          })),
        },
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Admin stats error:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Failed to fetch stats." }),
      { status: 500 }
    );
  }
}
