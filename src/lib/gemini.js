import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";

function requireGeminiKey() {
  if (!GEMINI_API_KEY) {
    throw new Error("Please define GEMINI_API_KEY in .env.local");
  }
  return GEMINI_API_KEY;
}

const genAI = new GoogleGenerativeAI(requireGeminiKey());
export const model = genAI.getGenerativeModel({
  model: GEMINI_MODEL,
});
