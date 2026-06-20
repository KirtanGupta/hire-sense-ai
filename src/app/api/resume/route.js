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
    const resumes = await Resume.find({ userId: payload.userId }).sort({ uploadedAt: -1 }).lean();
    return new Response(JSON.stringify({ success: true, resumes }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, message: "Unable to fetch resumes" }), { status: 400 });
  }
}
