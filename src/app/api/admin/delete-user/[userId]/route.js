// DELETE /api/admin/delete-user/[userId] — Delete user and all associated data

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

export async function DELETE(request, { params }) {
  const guard = adminGuard(request);
  if (guard.error) {
    return new Response(JSON.stringify({ success: false, message: guard.error }), { status: guard.status });
  }

  try {
    await connectMongo();
    
    // Await params
    const resolvedParams = await params;
    const { userId } = resolvedParams;

    if (!userId) {
      return new Response(JSON.stringify({ success: false, message: "User ID is required" }), { status: 400 });
    }

    // Optional: Prevent deleting other admins or yourself
    const userToDelete = await User.findById(userId);
    if (!userToDelete) {
      return new Response(JSON.stringify({ success: false, message: "User not found" }), { status: 404 });
    }

    if (userToDelete.role === "admin") {
      return new Response(JSON.stringify({ success: false, message: "Cannot delete an admin user." }), { status: 403 });
    }

    // Delete related data first
    await Resume.deleteMany({ userId });
    await InterviewSession.deleteMany({ userId });
    
    // Finally, delete the user
    await User.findByIdAndDelete(userId);

    return new Response(
      JSON.stringify({
        success: true,
        message: "User and all associated data deleted successfully.",
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete user error:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Failed to delete user." }),
      { status: 500 }
    );
  }
}
