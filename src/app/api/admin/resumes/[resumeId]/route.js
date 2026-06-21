import { connectMongo } from "@/lib/mongodb";
import { verifyToken } from "@/lib/auth";
import Resume from "@/models/Resume";
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

export async function GET(request, { params }) {
  const guard = adminGuard(request);
  if (guard.error) {
    return new Response(JSON.stringify({ success: false, message: guard.error }), { status: guard.status });
  }

  try {
    await connectMongo();
    
    const resolvedParams = await params;
    const { resumeId } = resolvedParams;

    if (!resumeId) {
      return new Response(JSON.stringify({ success: false, message: "Resume ID is required" }), { status: 400 });
    }

    const resume = await Resume.findById(resumeId)
      .populate("userId", "fullName email profilePicture")
      .lean();

    if (!resume) {
      return new Response(JSON.stringify({ success: false, message: "Resume not found" }), { status: 404 });
    }

    // Fetch interviews for performance tracking
    const interviews = await InterviewSession.find({ userId: resume.userId._id, status: { $in: ["completed", "evaluated"] } }).lean();
    
    let avgInterviewScore = null;
    if (interviews.length > 0) {
      avgInterviewScore = Math.round(interviews.reduce((s, i) => s + (i.overallScore || 0), 0) / interviews.length);
    }

    return new Response(
      JSON.stringify({
        success: true,
        resume,
        performance: {
          avgInterviewScore,
          gap: avgInterviewScore !== null ? avgInterviewScore - (resume.analysisScore || 0) : null
        }
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Admin resume details error:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Failed to fetch resume details." }),
      { status: 500 }
    );
  }
}
