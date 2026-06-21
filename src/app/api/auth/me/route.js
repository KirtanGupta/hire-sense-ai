import { connectMongo } from "@/lib/mongodb";
import User from "@/models/User";
import { verifyToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

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
    const user = await User.findById(payload.userId).select("fullName email role isBlocked profilePicture");
    if (!user) {
      return new Response(JSON.stringify({ success: false, message: "User not found" }), { status: 404 });
    }

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: user._id.toString(),
          fullName: user.fullName,
          name: user.fullName,
          email: user.email,
          role: user.role,
          isBlocked: !!user.isBlocked,
          profilePicture: user.profilePicture || "",
        },
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    return new Response(JSON.stringify({ success: false, message: "Invalid token" }), { status: 401 });
  }
}
