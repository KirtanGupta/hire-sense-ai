import { promises as fs } from "fs";
import path from "path";
import { connectMongo } from "@/lib/mongodb";
import User from "@/models/User";
import { verifyToken } from "@/lib/auth";

function getToken(request) {
  const cookie = request.headers.get("cookie") || "";
  const match = cookie.match(/(?:^|; )token=([^;]+)/);
  return match ? match[1] : null;
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(request) {
  const token = getToken(request);
  if (!token) {
    return jsonResponse({ success: false, message: "Not authenticated" }, 401);
  }

  try {
    const payload = verifyToken(token);
    const formData = await request.formData();
    const file = formData.get("avatar");

    if (!file || typeof file === "string") {
      return jsonResponse({ success: false, message: "No image file provided" }, 400);
    }

    // Validate MIME type
    if (!file.type.startsWith("image/")) {
      return jsonResponse({ success: false, message: "Only image files are allowed" }, 400);
    }

    // Validate size (max 5MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return jsonResponse({ success: false, message: "Image size cannot exceed 5MB" }, 400);
    }

    // Read file buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save under public/uploads/avatars
    const uploadDir = path.join(process.cwd(), "public", "uploads", "avatars");
    try {
      await fs.mkdir(uploadDir, { recursive: true });
    } catch {
      // silent
    }

    // Generate unique name
    const fileExt = path.extname(file.name) || ".png";
    const filename = `${payload.userId}-${Date.now()}${fileExt}`;
    const filePath = path.join(uploadDir, filename);

    // Write file to disk
    await fs.writeFile(filePath, buffer);

    const relativeUrl = `/uploads/avatars/${filename}`;

    // Update user record and clean up old custom avatar file if it exists
    await connectMongo();
    const user = await User.findById(payload.userId);
    if (!user) {
      // Clean up newly created file if user not found
      try {
        await fs.unlink(filePath);
      } catch {
        // silent
      }
      return jsonResponse({ success: false, message: "User not found" }, 404);
    }

    const oldAvatar = user.profilePicture;
    user.profilePicture = relativeUrl;
    await user.save();

    // If old avatar was also uploaded locally, delete it to save disk space
    if (oldAvatar && oldAvatar.startsWith("/uploads/avatars/")) {
      const oldPath = path.join(process.cwd(), "public", oldAvatar);
      try {
        await fs.unlink(oldPath);
      } catch (err) {
        console.error("Failed to delete old avatar file:", err);
      }
    }

    return jsonResponse({
      success: true,
      message: "Avatar uploaded successfully",
      profilePicture: relativeUrl,
    });
  } catch (error) {
    console.error("Avatar upload error:", error);
    return jsonResponse({ success: false, message: "Internal server error during upload" }, 500);
  }
}
