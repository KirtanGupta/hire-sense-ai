// DELETE /api/user/account — Permanently delete the logged-in user's account and all data

import { connectMongo } from "@/lib/mongodb";
import User from "@/models/User";
import InterviewSession from "@/models/InterviewSession";
import Resume from "@/models/Resume";
import { verifyToken } from "@/lib/auth";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

function getToken(request) {
  const cookie = request.headers.get("cookie") || "";
  const match = cookie.match(/(?:^|; )token=([^;]+)/);
  return match ? match[1] : null;
}

export async function DELETE(request) {
  const token = getToken(request);
  if (!token) {
    return new Response(JSON.stringify({ success: false, message: "Not authenticated" }), { status: 401 });
  }

  try {
    const payload = verifyToken(token);
    const { password } = await request.json();

    if (!password) {
      return new Response(JSON.stringify({ success: false, message: "Password is required to delete account." }), { status: 400 });
    }

    await connectMongo();
    const user = await User.findById(payload.userId);
    if (!user) {
      return new Response(JSON.stringify({ success: false, message: "User not found." }), { status: 404 });
    }

    // Admins cannot delete their own account via this route
    if (user.role === "admin") {
      return new Response(JSON.stringify({ success: false, message: "Admin accounts cannot be self-deleted." }), { status: 403 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return new Response(JSON.stringify({ success: false, message: "Incorrect password. Account deletion cancelled." }), { status: 401 });
    }

    // Delete all associated data
    await Resume.deleteMany({ userId: payload.userId });
    await InterviewSession.deleteMany({ userId: payload.userId });
    await User.findByIdAndDelete(payload.userId);

    // Clear the auth cookie
    const response = new Response(
      JSON.stringify({ success: true, message: "Account and all data permanently deleted." }),
      { status: 200 }
    );
    response.headers.set("Set-Cookie", "token=; HttpOnly; Path=/; SameSite=Strict; Secure; Max-Age=0");
    return response;
  } catch {
    return new Response(JSON.stringify({ success: false, message: "Failed to delete account." }), { status: 500 });
  }
}
