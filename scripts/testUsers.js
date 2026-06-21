import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function loadEnv() {
  const envPath = path.join(__dirname, "../.env.local");
  const lines = fs.readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnv();

const UserSchema = new mongoose.Schema({
  fullName: String,
  email: { type: String, lowercase: true },
  role: { type: String, default: "user" },
  isBlocked: { type: Boolean, default: false },
});

const User = mongoose.models.User || mongoose.model("User", UserSchema);

async function test() {
  await mongoose.connect(process.env.MONGODB_URI);
  const users = await User.find({}).lean();
  console.log("USERS IN DB:");
  users.forEach(u => {
    console.log(`- ${u.fullName} (${u.email}) | Role: ${u.role} | isBlocked: ${u.isBlocked}`);
  });
  
  const totalBlocked = users.filter((u) => u.isBlocked).length;
  console.log(`\nTotal Blocked Count Calculation: ${totalBlocked}`);
  
  process.exit(0);
}

test();
