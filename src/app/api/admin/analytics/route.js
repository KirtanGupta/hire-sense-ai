// GET /api/admin/analytics — Full Analytics Data for Dashboard
// Protected: admin JWT only

// Phase 9.6: Cache analytics for 60 seconds to improve performance
export const revalidate = 60;

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

// Helper: get last N month labels
function getLastNMonths(n) {
  const months = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      year: d.getFullYear(),
      month: d.getMonth() + 1,
      label: d.toLocaleString("en-US", { month: "short" }) + " " + d.getFullYear(),
    });
  }
  return months;
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

    const last6Months = getLastNMonths(6);
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    // ── Run all aggregations in parallel ──────────────────────────────────────
    const [
      totalUsers,
      totalInterviews,
      totalResumes,
      evaluatedSessions,
      userGrowthRaw,
      roleDistributionRaw,
      scoreTrendRaw,
      resumeScoreRaw,
      topSkillsRaw,
      successRateRaw,
      candidateRankingsRaw,
      mostActiveUserRaw,
      bestRoleRaw,
    ] = await Promise.all([
      // Summary counts
      User.countDocuments({ role: "user" }),
      InterviewSession.countDocuments(),
      Resume.countDocuments(),
      InterviewSession.find(
        { status: { $in: ["completed", "evaluated"] }, overallScore: { $ne: null } },
        { overallScore: 1 }
      ).lean(),

      // Chart 1 — User Growth (last 6 months)
      User.aggregate([
        { $match: { role: "user", createdAt: { $gte: sixMonthsAgo } } },
        {
          $group: {
            _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]),

      // Chart 2 — Role Distribution
      InterviewSession.aggregate([
        { $group: { _id: "$role", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 8 },
      ]),

      // Chart 3 — Interview Score Trend (last 6 months)
      InterviewSession.aggregate([
        {
          $match: {
            status: { $in: ["completed", "evaluated"] },
            overallScore: { $ne: null },
            createdAt: { $gte: sixMonthsAgo },
          },
        },
        {
          $group: {
            _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
            avgScore: { $avg: "$overallScore" },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]),

      // Chart 4 — Resume Score Distribution
      Resume.aggregate([
        {
          $bucket: {
            groupBy: "$analysisScore",
            boundaries: [0, 50, 60, 70, 80, 90, 101],
            default: "Other",
            output: { count: { $sum: 1 } },
          },
        },
      ]),

      // Chart 5 — Top Skills from resumes
      Resume.aggregate([
        { $unwind: "$extractedSkills" },
        { $group: { _id: "$extractedSkills", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),

      // Chart 6 — Success Rate (pass >= 70, fail < 70)
      InterviewSession.aggregate([
        {
          $match: {
            status: { $in: ["completed", "evaluated"] },
            overallScore: { $ne: null },
          },
        },
        {
          $group: {
            _id: null,
            passed: { $sum: { $cond: [{ $gte: ["$overallScore", 70] }, 1, 0] } },
            failed: { $sum: { $cond: [{ $lt: ["$overallScore", 70] }, 1, 0] } },
          },
        },
      ]),

      // Bonus — Top 10 candidate rankings
      InterviewSession.aggregate([
        {
          $match: {
            status: { $in: ["completed", "evaluated"] },
            overallScore: { $ne: null },
          },
        },
        {
          $group: {
            _id: "$userId",
            avgScore: { $avg: "$overallScore" },
            totalInterviews: { $sum: 1 },
            bestScore: { $max: "$overallScore" },
          },
        },
        { $sort: { avgScore: -1 } },
        { $limit: 10 },
      ]),

      // Bonus — Most active user
      InterviewSession.aggregate([
        { $group: { _id: "$userId", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 1 },
      ]),

      // Bonus — Best role performance
      InterviewSession.aggregate([
        {
          $match: {
            status: { $in: ["completed", "evaluated"] },
            overallScore: { $ne: null },
          },
        },
        {
          $group: {
            _id: "$role",
            avgScore: { $avg: "$overallScore" },
            count: { $sum: 1 },
          },
        },
        { $match: { count: { $gte: 1 } } },
        { $sort: { avgScore: -1 } },
        { $limit: 1 },
      ]),
    ]);

    // ── Post-process ──────────────────────────────────────────────────────────

    // Summary
    const avgScore =
      evaluatedSessions.length > 0
        ? Math.round(
            evaluatedSessions.reduce((sum, s) => sum + (s.overallScore || 0), 0) /
              evaluatedSessions.length
          )
        : 0;

    // Chart 1 — map to month labels, fill missing months with 0
    const growthMap = {};
    userGrowthRaw.forEach((r) => {
      growthMap[`${r._id.year}-${r._id.month}`] = r.count;
    });
    const userGrowth = last6Months.map((m) => ({
      month: m.label,
      users: growthMap[`${m.year}-${m.month}`] || 0,
    }));

    // Chart 2 — role distribution
    const roleDistribution = roleDistributionRaw.map((r) => ({
      role: r._id || "Unknown",
      count: r.count,
    }));

    // Chart 3 — score trend, fill missing months
    const trendMap = {};
    scoreTrendRaw.forEach((r) => {
      trendMap[`${r._id.year}-${r._id.month}`] = Math.round(r.avgScore);
    });
    const scoreTrend = last6Months.map((m) => ({
      month: m.label,
      score: trendMap[`${m.year}-${m.month}`] || null,
    }));

    // Chart 4 — resume score distribution
    const bucketLabels = { 0: "<50", 50: "50-60", 60: "60-70", 70: "70-80", 80: "80-90", 90: "90-100" };
    const resumeScoreDistribution = resumeScoreRaw
      .filter((r) => r._id !== "Other")
      .map((r) => ({
        range: bucketLabels[r._id] || `${r._id}+`,
        count: r.count,
      }));

    // Chart 5 — top skills
    const topSkills = topSkillsRaw.map((r) => ({
      skill: r._id,
      count: r.count,
    }));

    // Chart 6 — success rate
    const srData = successRateRaw[0] || { passed: 0, failed: 0 };
    const successRate = [
      { name: "Passed", value: srData.passed },
      { name: "Failed", value: srData.failed },
    ];

    // Bonus — Candidate rankings (resolve user names)
    let candidateRankings = [];
    if (candidateRankingsRaw.length > 0) {
      const userIds = candidateRankingsRaw.map((r) => r._id);
      const users = await User.find({ _id: { $in: userIds } })
        .select("fullName email")
        .lean();
      const userMap = {};
      users.forEach((u) => { userMap[u._id.toString()] = u; });
      candidateRankings = candidateRankingsRaw.map((r, i) => {
        const u = userMap[r._id.toString()];
        return {
          rank: i + 1,
          name: u?.fullName || "Unknown",
          email: u?.email || "",
          avgScore: Math.round(r.avgScore),
          bestScore: Math.round(r.bestScore),
          totalInterviews: r.totalInterviews,
        };
      });
    }

    // Bonus — Most active user
    let mostActiveUser = null;
    if (mostActiveUserRaw.length > 0) {
      const u = await User.findById(mostActiveUserRaw[0]._id).select("fullName email").lean();
      if (u) {
        mostActiveUser = {
          name: u.fullName,
          email: u.email,
          interviewCount: mostActiveUserRaw[0].count,
        };
      }
    }

    // Bonus — Best role
    const bestRolePerformance =
      bestRoleRaw.length > 0
        ? { role: bestRoleRaw[0]._id, avgScore: Math.round(bestRoleRaw[0].avgScore) }
        : null;

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          summary: { totalUsers, totalInterviews, totalResumes, avgScore },
          userGrowth,
          roleDistribution,
          scoreTrend,
          resumeScoreDistribution,
          topSkills,
          successRate,
          candidateRankings,
          mostActiveUser,
          bestRolePerformance,
        },
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Analytics API error:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Failed to fetch analytics." }),
      { status: 500 }
    );
  }
}
