import { connectMongo } from "@/lib/mongodb";
import User from "@/models/User";
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
    const user = await User.findById(payload.userId).select("fullName email role profilePicture createdAt");
    if (!user) {
      return new Response(JSON.stringify({ success: false, message: "User not found" }), { status: 404 });
    }

    return new Response(JSON.stringify({ success: true, user }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, message: "Invalid token" }), { status: 401 });
  }
}

export async function PUT(request) {
  const token = getToken(request);
  if (!token) {
    return new Response(JSON.stringify({ success: false, message: "Not authenticated" }), { status: 401 });
  }

  try {
    const payload = verifyToken(token);
    const body = await request.json();
    const { fullName, profilePicture } = body;
    await connectMongo();
    const user = await User.findById(payload.userId);
    if (!user) {
      return new Response(JSON.stringify({ success: false, message: "User not found" }), { status: 404 });
    }

    if (fullName) user.fullName = fullName;
    if (profilePicture !== undefined) user.profilePicture = profilePicture;
    await user.save();

    return new Response(JSON.stringify({ success: true, user }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, message: "Unable to update profile" }), { status: 400 });
  }
}
