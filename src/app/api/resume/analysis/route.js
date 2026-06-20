import { connectMongo } from "@/lib/mongodb";
import Resume from "@/models/Resume";
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
    const resume = await Resume.findOne({ userId: payload.userId }).sort({ uploadedAt: -1 }).lean();
    return new Response(
      JSON.stringify({
        success: true,
        analysis: {
          score: resume?.analysisScore || 0,
          scoreBreakdown: resume?.scoreBreakdown || {
            technicalSkills: { score: 0, max: 40 },
            projects: { score: 0, max: 25 },
            education: { score: 0, max: 15 },
            certifications: { score: 0, max: 10 },
            resumeStructure: { score: 0, max: 10 },
          },
          recommendedRole: resume?.recommendedRole || "",
          strengths: resume?.analysisSummary?.strengths || [],
          weaknesses: resume?.analysisSummary?.weaknesses || [],
          suggestions: resume?.analysisSummary?.suggestions || [],
        },
      }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(JSON.stringify({ success: false, message: "Unable to fetch analysis" }), { status: 400 });
  }
}
