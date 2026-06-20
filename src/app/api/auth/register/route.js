import { connectMongo } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(request) {
  const body = await request.json();
  const { fullName, email, password } = body;

  if (!fullName || !email || !password) {
    return new Response(JSON.stringify({ success: false, message: "Missing required fields" }), { status: 400 });
  }

  await connectMongo();

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return new Response(JSON.stringify({ success: false, message: "Email already registered" }), { status: 409 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await User.create({
    fullName,
    email,
    password: hashedPassword,
    role: "user",
  });

  return new Response(JSON.stringify({ success: true, message: "User Registered" }), { status: 201 });
}
