// POST /api/admin/user/[userId]/block — Toggle block status of a user

import { connectMongo } from "@/lib/mongodb";
import { verifyToken } from "@/lib/auth";
import User from "@/models/User";

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

export async function POST(request, { params }) {
  const guard = adminGuard(request);
  if (guard.error) {
    return new Response(JSON.stringify({ success: false, message: guard.error }), { status: guard.status });
  }

  try {
    await connectMongo();
    
    const resolvedParams = await params;
    const { userId } = resolvedParams;

    if (!userId) {
      return new Response(JSON.stringify({ success: false, message: "User ID is required" }), { status: 400 });
    }

    const body = await request.json();
    const { isBlocked } = body;

    const user = await User.findById(userId);
    if (!user) {
      return new Response(JSON.stringify({ success: false, message: "User not found" }), { status: 404 });
    }

    if (user.role === "admin") {
      return new Response(JSON.stringify({ success: false, message: "Cannot block an admin user." }), { status: 403 });
    }

    // Use findByIdAndUpdate with strict: false to bypass Next.js schema caching in dev mode
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { isBlocked } },
      { new: true, strict: false }
    );

    return new Response(
      JSON.stringify({
        success: true,
        message: `User successfully ${isBlocked ? "blocked" : "unblocked"}.`,
        isBlocked: updatedUser.isBlocked,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Block user error:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Failed to update user status." }),
      { status: 500 }
    );
  }
}
