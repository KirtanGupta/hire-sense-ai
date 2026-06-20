import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

function requireJwtSecret() {
  if (!JWT_SECRET) {
    throw new Error("Please define JWT_SECRET in .env.local");
  }

  return JWT_SECRET;
}

export function generateToken(userId, role) {
  return jwt.sign({ userId, role }, requireJwtSecret(), { expiresIn: "7d" });
}

export function verifyToken(token) {
  return jwt.verify(token, requireJwtSecret());
}
