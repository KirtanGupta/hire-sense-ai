// GET /api/admin/user/[userId] — Fetch user details, resume, and interviews (admin only)

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

export async function GET(request, { params }) {
  const guard = adminGuard(request);
  if (guard.error) {
    return new Response(JSON.stringify({ success: false, message: guard.error }), { status: guard.status });
  }

  try {
    await connectMongo();
    
    // Await params before using its properties
    const resolvedParams = await params;
    const { userId } = resolvedParams;

    if (!userId) {
      return new Response(JSON.stringify({ success: false, message: "User ID is required" }), { status: 400 });
    }

    const [user, resume, interviews] = await Promise.all([
      User.findById(userId).select("-password").lean(),
      Resume.findOne({ userId }).lean(),
      InterviewSession.find({ userId }).sort({ createdAt: -1 }).lean(),
    ]);

    if (!user) {
      return new Response(JSON.stringify({ success: false, message: "User not found" }), { status: 404 });
    }

    return new Response(
      JSON.stringify({
        success: true,
        user,
        resume,
        interviews,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Fetch user details error:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Failed to fetch user details." }),
      { status: 500 }
    );
  }
}
