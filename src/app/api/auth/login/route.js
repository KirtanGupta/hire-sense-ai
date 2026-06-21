import { connectMongo } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { generateToken } from "@/lib/auth";

export async function POST(request) {
  const body = await request.json();
  const { email, password } = body;

  if (!email || !password) {
    return new Response(JSON.stringify({ success: false, message: "Missing credentials" }), { status: 400 });
  }

  await connectMongo();

  const user = await User.findOne({ email });
  if (!user) {
    return new Response(JSON.stringify({ success: false, message: "Invalid credentials" }), { status: 401 });
  }

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    return new Response(JSON.stringify({ success: false, message: "Invalid credentials" }), { status: 401 });
  }


  const token = generateToken(user._id.toString(), user.role);
  const response = new Response(JSON.stringify({ success: true, role: user.role }), { status: 200 });

  response.headers.set(
    "Set-Cookie",
    `token=${token}; HttpOnly; Path=/; SameSite=Strict; Secure; Max-Age=${60 * 60 * 24 * 7}`
  );

  return response;
}
