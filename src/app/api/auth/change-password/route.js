// PUT /api/auth/change-password — Change the logged-in user's password

import { connectMongo } from "@/lib/mongodb";
import User from "@/models/User";
import { verifyToken } from "@/lib/auth";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

function getToken(request) {
  const cookie = request.headers.get("cookie") || "";
  const match = cookie.match(/(?:^|; )token=([^;]+)/);
  return match ? match[1] : null;
}

export async function PUT(request) {
  const token = getToken(request);
  if (!token) {
    return new Response(JSON.stringify({ success: false, message: "Not authenticated" }), { status: 401 });
  }

  try {
    const payload = verifyToken(token);
    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return new Response(JSON.stringify({ success: false, message: "All fields are required." }), { status: 400 });
    }

    if (newPassword.length < 8) {
      return new Response(JSON.stringify({ success: false, message: "New password must be at least 8 characters." }), { status: 400 });
    }

    await connectMongo();
    const user = await User.findById(payload.userId);
    if (!user) {
      return new Response(JSON.stringify({ success: false, message: "User not found." }), { status: 404 });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return new Response(JSON.stringify({ success: false, message: "Current password is incorrect." }), { status: 401 });
    }

    const hashed = await bcrypt.hash(newPassword, 12);
    user.password = hashed;
    await user.save();

    return new Response(JSON.stringify({ success: true, message: "Password changed successfully." }), { status: 200 });
  } catch {
    return new Response(JSON.stringify({ success: false, message: "Failed to change password." }), { status: 500 });
  }
}
