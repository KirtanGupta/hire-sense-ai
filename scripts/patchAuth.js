import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const apiDir = path.join(__dirname, "../src/app/api");

function walk(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const stat = fs.statSync(path.join(dir, file));
    if (stat.isDirectory()) {
      walk(path.join(dir, file), fileList);
    } else if (file === "route.js") {
      fileList.push(path.join(dir, file));
    }
  }
  return fileList;
}

const routes = walk(apiDir);

for (const route of routes) {
  let content = fs.readFileSync(route, "utf8");
  
  // Skip auth routes and admin routes (admin routes use adminGuard which we'll patch separately if needed, actually admin routes check role === admin)
  if (route.includes("auth") || route.includes("admin")) continue;

  let changed = false;

  // Add User import if not present
  if (content.includes("verifyToken") && !content.includes("import User from")) {
    content = content.replace(/(import { verifyToken } from "@\/lib\/auth";)/, "$1\nimport User from \"@/models/User\";\nimport { connectMongo } from \"@/lib/mongodb\";");
    // Remove duplicate connectMongo if added
    const matches = content.match(/import { connectMongo }/g);
    if (matches && matches.length > 1) {
      content = content.replace(/\nimport { connectMongo } from "@\/lib\/mongodb";/, ""); // keep first
    }
    changed = true;
  }

  // Replace verifyToken with block check
  const verifyRegex = /const payload = verifyToken\(token\);/g;
  if (verifyRegex.test(content)) {
    const blockCheck = `const payload = verifyToken(token);
    await connectMongo();
    const currentUser = await User.findById(payload.userId).select("isBlocked").lean();
    if (!currentUser || currentUser.isBlocked) {
      return new Response(JSON.stringify({ success: false, message: "Your account has been blocked." }), { status: 403 });
    }`;
    content = content.replace(verifyRegex, blockCheck);
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(route, content, "utf8");
    console.log(`Patched ${route}`);
  }
}

console.log("Done patching API routes.");
