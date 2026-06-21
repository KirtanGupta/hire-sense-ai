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

export async function GET(request, { params }) {
  const guard = adminGuard(request);
  if (guard.error) {
    return new Response(JSON.stringify({ success: false, message: guard.error }), { status: guard.status });
  }

  try {
    await connectMongo();
    
    const resolvedParams = await params;
    const { sessionId } = resolvedParams;

    if (!sessionId) {
      return new Response(JSON.stringify({ success: false, message: "Session ID is required" }), { status: 400 });
    }

    const interview = await InterviewSession.findById(sessionId)
      .populate("userId", "fullName email profilePicture")
      .lean();

    if (!interview) {
      return new Response(JSON.stringify({ success: false, message: "Interview not found" }), { status: 404 });
    }

    return new Response(
      JSON.stringify({
        success: true,
        interview,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Admin interview details error:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Failed to fetch interview details." }),
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  const guard = adminGuard(request);
  if (guard.error) {
    return new Response(JSON.stringify({ success: false, message: guard.error }), { status: guard.status });
  }

  try {
    await connectMongo();
    
    const resolvedParams = await params;
    const { sessionId } = resolvedParams;

    if (!sessionId) {
      return new Response(JSON.stringify({ success: false, message: "Session ID is required" }), { status: 400 });
    }

    const deleted = await InterviewSession.findByIdAndDelete(sessionId);

    if (!deleted) {
      return new Response(JSON.stringify({ success: false, message: "Interview not found" }), { status: 404 });
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Interview deleted successfully.",
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Admin delete interview error:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Failed to delete interview." }),
      { status: 500 }
    );
  }
}
