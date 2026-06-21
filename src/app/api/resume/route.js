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

export async function DELETE(request) {
  const token = getToken(request);
  if (!token) {
    return new Response(JSON.stringify({ success: false, message: "Not authenticated" }), { status: 401 });
  }

  try {
    const payload = verifyToken(token);
    const { searchParams } = new URL(request.url);
    const resumeId = searchParams.get("id");

    if (!resumeId) {
      return new Response(JSON.stringify({ success: false, message: "Resume ID is required" }), { status: 400 });
    }

    await connectMongo();
    const resume = await Resume.findOne({ _id: resumeId, userId: payload.userId });
    if (!resume) {
      return new Response(JSON.stringify({ success: false, message: "Resume not found or unauthorized" }), { status: 404 });
    }

    // Clean up local file from disk if it's stored in public/uploads
    if (resume.fileUrl && resume.fileUrl.startsWith("/uploads/")) {
      const fs = require("fs").promises;
      const path = require("path");
      const filePath = path.join(process.cwd(), "public", resume.fileUrl);
      try {
        await fs.unlink(filePath);
      } catch (err) {
        console.error("Failed to delete file from disk:", err);
      }
    }

    await Resume.deleteOne({ _id: resumeId });

    return new Response(JSON.stringify({ success: true, message: "Resume deleted successfully" }), { status: 200 });
  } catch (error) {
    console.error("Error deleting resume:", error);
    return new Response(JSON.stringify({ success: false, message: "Unable to delete resume" }), { status: 400 });
  }
}
