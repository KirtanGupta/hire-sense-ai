import fs from "fs/promises";
import path from "path";
import { connectMongo } from "@/lib/mongodb";
import Resume from "@/models/Resume";
import { verifyToken } from "@/lib/auth";
import { extractPDFText, extractDOCXText, normalizeText } from "@/services/resumeParser";
import { evaluateResume, evaluateResumeLocally } from "@/services/llmService";

function getToken(request) {
  const cookie = request.headers.get("cookie") || "";
  const match = cookie.match(/(?:^|; )token=([^;]+)/);
  return match ? match[1] : null;
}

function sanitizeFileName(name) {
  return name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
}

function getLlmProviderName() {
  return process.env.LLM_PROVIDER === "gemini" ? "Gemini" : "Groq";
}

function getLlmErrorMessage(error) {
  const provider = getLlmProviderName();

  if (error?.status === 404 || error?.message?.includes("not found")) {
    return `${provider} model was not found. Check your model name in .env.local.`;
  }

  if (error?.status === 429 || error?.message?.includes("quota")) {
    return `${provider} quota or rate limit was reached. Try again later or use another API key/model.`;
  }

  return `Resume text was extracted, but ${provider} analysis failed. Please check your API key/model configuration and try again.`;
}

function isLlmQuotaError(error) {
  return error?.status === 429 || error?.message?.toLowerCase().includes("quota");
}

export async function POST(request) {
  const token = getToken(request);
  if (!token) {
    return new Response(JSON.stringify({ success: false, message: "Not authenticated" }), { status: 401 });
  }

  try {
    const payload = verifyToken(token);
    const formData = await request.formData();
    const file = formData.get("resume");

    if (!file || typeof file === "string") {
      return new Response(JSON.stringify({ success: false, message: "Resume file is required." }), { status: 400 });
    }

    const fileName = file.name;
    const allowedExtensions = [".pdf", ".docx"];
    const hasValidExtension = allowedExtensions.some((ext) => fileName.toLowerCase().endsWith(ext));
    if (!hasValidExtension) {
      return new Response(JSON.stringify({ success: false, message: "Unsupported file type" }), { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadDir, { recursive: true });

    const safeName = `${Date.now()}-${sanitizeFileName(fileName)}`;
    const filePath = path.join(uploadDir, safeName);
    await fs.writeFile(filePath, buffer);

    let extractedText = "";
    if (fileName.toLowerCase().endsWith(".pdf")) {
      extractedText = await extractPDFText(buffer);
    } else {
      extractedText = await extractDOCXText(buffer);
    }

    const normalizedText = normalizeText(extractedText);

    if (!normalizedText) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Could not read text from this resume. Please upload a text-based PDF or DOCX file.",
        }),
        { status: 422 }
      );
    }

    let extractedSkills = [];
    let skillCategories = {
      languages: [],
      frameworks: [],
      databases: [],
      tools: [],
      softSkills: [],
    };
    let analysis = { score: 0, strengths: [], weaknesses: [], suggestions: [] };
    let scoreBreakdown = {
      technicalSkills: { score: 0, max: 40 },
      projects: { score: 0, max: 25 },
      education: { score: 0, max: 15 },
      certifications: { score: 0, max: 10 },
      resumeStructure: { score: 0, max: 10 },
    };
    let recommendedRole = "";
    let usedLocalFallback = false;

    try {
      const evaluation = await evaluateResume(normalizedText);
      extractedSkills = evaluation.skills;
      skillCategories = evaluation.skillCategories;
      scoreBreakdown = evaluation.scoreBreakdown;
      recommendedRole = evaluation.recommendedRole;
      analysis = evaluation;
    } catch (llmError) {
      console.error(`${getLlmProviderName()} analysis failed:`, llmError);

      if (isLlmQuotaError(llmError)) {
        const evaluation = evaluateResumeLocally(normalizedText);
        extractedSkills = evaluation.skills;
        skillCategories = evaluation.skillCategories;
        scoreBreakdown = evaluation.scoreBreakdown;
        recommendedRole = evaluation.recommendedRole;
        analysis = evaluation;
        usedLocalFallback = true;
      } else {
        return new Response(
          JSON.stringify({
            success: false,
            message: getLlmErrorMessage(llmError),
          }),
          { status: 502 }
        );
      }
    }

    if (usedLocalFallback) {
      analysis.suggestions = [
        `${getLlmProviderName()} quota or rate limit was reached, so this result used the built-in resume evaluator.`,
        ...analysis.suggestions,
      ];
    }

    try {
      await connectMongo();
      const resume = await Resume.create({
        userId: payload.userId,
        fileName,
        fileUrl: `/uploads/${encodeURIComponent(safeName)}`,
        extractedText: normalizedText,
        extractedSkills,
        skillCategories,
        recommendedRole,
        analysisScore: analysis.score,
        scoreBreakdown,
        analysisSummary: {
          strengths: analysis.strengths,
          weaknesses: analysis.weaknesses,
          suggestions: analysis.suggestions,
        },
      });

      return new Response(
        JSON.stringify({
          success: true,
          resume,
          message: usedLocalFallback
            ? `Resume analyzed with local fallback because ${getLlmProviderName()} quota or rate limit was reached.`
            : "Resume uploaded and analyzed successfully.",
        }),
        { status: 201 }
      );
    } catch (dbError) {
      throw dbError;
    }
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ success: false, message: "Unable to upload resume." }), { status: 500 });
  }
}
