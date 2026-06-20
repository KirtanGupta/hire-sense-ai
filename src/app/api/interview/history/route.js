import { connectMongo } from "@/lib/mongodb";
import Interview from "@/models/Interview";
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
    const interviews = await Interview.find({ userId: payload.userId }).sort({ interviewDate: -1 }).lean();
    return new Response(JSON.stringify({ success: true, interviews }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, message: "Unable to load history" }), { status: 400 });
  }
}
