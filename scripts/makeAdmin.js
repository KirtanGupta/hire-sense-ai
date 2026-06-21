// ─── makeAdmin.js — Promote a user to admin role ─────────────────────────────
// Usage:  node scripts/makeAdmin.js <email>
// Example: node scripts/makeAdmin.js k@kgmail.com
//
// No external dependencies — uses only Node.js built-ins + mongoose from project

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── Manually parse .env.local (no dotenv needed) ─────────────────────────────
function loadEnv() {
  const envPath = path.join(__dirname, "../.env.local");
  if (!fs.existsSync(envPath)) {
    console.error("❌ .env.local file not found at:", envPath);
    process.exit(1);
  }
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

// ── Read email from CLI args ──────────────────────────────────────────────────
const email = process.argv[2];
if (!email) {
  console.error("❌ Usage: node scripts/makeAdmin.js <email>");
  console.error("   Example: node scripts/makeAdmin.js k@kgmail.com");
  process.exit(1);
}

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI not found in .env.local");
  process.exit(1);
}

// ── Inline User schema (no @/lib alias in plain node scripts) ────────────────
const UserSchema = new mongoose.Schema({
  fullName: String,
  email: { type: String, lowercase: true },
  password: String,
  role: { type: String, default: "user" },
  createdAt: Date,
});
const User = mongoose.model("User", UserSchema);

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log("🔌 Connecting to MongoDB…");
  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected\n");

  const target = email.toLowerCase().trim();
  const user = await User.findOneAndUpdate(
    { email: target },
    { $set: { role: "admin" } },
    { new: true }
  );

  if (!user) {
    console.error(`❌ No user found with email: ${target}`);
    console.error("   Make sure the user has registered first.");
  } else {
    console.log("┌─────────────────────────────────────┐");
    console.log("│  ✅  Admin role granted successfully  │");
    console.log("└─────────────────────────────────────┘");
    console.log(`   Name  : ${user.fullName}`);
    console.log(`   Email : ${user.email}`);
    console.log(`   Role  : ${user.role}`);
    console.log("\n👉 You can now login and visit /admin/dashboard");
  }

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});
