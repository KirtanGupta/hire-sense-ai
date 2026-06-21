import { connectMongo } from "../src/lib/mongodb.js";
import User from "../src/models/User.js";
import mongoose from "mongoose";
import { resolve } from "path";
import { config } from "dotenv";

config({ path: resolve(process.cwd(), ".env.local") });

async function check() {
  await connectMongo();
  const users = await User.find().lean();
  console.log("All users:");
  users.forEach(u => {
    console.log(`- ${u.email}: isBlocked=${u.isBlocked}`);
  });
  process.exit(0);
}
check();
