import fs from "fs/promises";
import path from "path";
import { connectMongo } from "@/lib/mongodb";
import Resume from "@/models/Resume";
import { verifyToken } from "@/lib/auth";
import {
  extractPDFText,
  extractDOCXText,
  normalizeText,
  isPDFBuffer,
  isDOCXBuffer,
} from "@/services/resumeParser";
import { evaluateResume, evaluateResumeLocally } from "@/services/llmService";

// ─── Helpers ──────────────────────────────────────────────────────────────────

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
  return (
    error?.status === 429 ||
    error?.message?.toLowerCase().includes("quota") ||
    error?.message?.toLowerCase().includes("rate limit")
  );
}

// ─── POST /api/resume/upload ──────────────────────────────────────────────────

export async function POST(request) {
  const token = getToken(request);
  if (!token) {
    return jsonResponse({ success: false, message: "Not authenticated." }, 401);
  }

  try {
    const payload = verifyToken(token);
    const formData = await request.formData();
    const file = formData.get("resume");

    // ── Validate file present ──
    if (!file || typeof file === "string") {
      return jsonResponse({ success: false, message: "Resume file is required." }, 400);
    }

    const fileName = file.name || "resume";
    const lowerName = fileName.toLowerCase();

    // ── Validate extension ──
    const isPDF  = lowerName.endsWith(".pdf");
    const isDOCX = lowerName.endsWith(".docx");

    if (!isPDF && !isDOCX) {
      return jsonResponse(
        {
          success: false,
          message: "Unsupported file type. Please upload a PDF or DOCX file.",
        },
        400
      );
    }

    // ── Read file buffer ──
    const buffer = Buffer.from(await file.arrayBuffer());

    if (buffer.length === 0) {
      return jsonResponse({ success: false, message: "The uploaded file is empty." }, 400);
    }

    // ── Validate magic bytes (actual file type, not just extension) ──
    if (isPDF && !isPDFBuffer(buffer)) {
      return jsonResponse(
        {
          success: false,
          message:
            "The file does not appear to be a valid PDF. Please make sure the file is not corrupted and try again.",
        },
        400
      );
    }

    if (isDOCX && !isDOCXBuffer(buffer)) {
      return jsonResponse(
        {
          success: false,
          message:
            "The file does not appear to be a valid DOCX. Please make sure the file is not corrupted and try again.",
        },
        400
      );
    }

    // ── Save file to disk ──
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadDir, { recursive: true });
    const safeName = `${Date.now()}-${sanitizeFileName(fileName)}`;
    const filePath = path.join(uploadDir, safeName);
    await fs.writeFile(filePath, buffer);

    // ── Extract text ──
    let extractedText = "";
    if (isPDF) {
      extractedText = await extractPDFText(buffer);
    } else {
      extractedText = await extractDOCXText(buffer);
    }

    const normalizedText = normalizeText(extractedText);

    // ── Guard: empty text ──
    if (!normalizedText || normalizedText.length < 30) {
      // Clean up saved file so it doesn't orphan
      await fs.unlink(filePath).catch(() => {});

      const hint = isPDF
        ? "Make sure your PDF contains selectable text (not a scanned image). If it is a scanned resume, please convert it to a text-based PDF or use a DOCX file instead."
        : "The DOCX file appears to contain no readable text. Please check the file and try again.";

      return jsonResponse(
        {
          success: false,
          message: `Could not extract text from your ${isPDF ? "PDF" : "DOCX"}. ${hint}`,
        },
        422
      );
    }

    // ── LLM Analysis ──
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
      skillCategories  = evaluation.skillCategories;
      scoreBreakdown   = evaluation.scoreBreakdown;
      recommendedRole  = evaluation.recommendedRole;
      analysis         = evaluation;
    } catch (llmError) {
      console.error(`[upload] ${getLlmProviderName()} analysis failed:`, llmError?.message);

      if (isLlmQuotaError(llmError)) {
        // Graceful fallback to local evaluator
        const evaluation = evaluateResumeLocally(normalizedText);
        extractedSkills = evaluation.skills;
        skillCategories  = evaluation.skillCategories;
        scoreBreakdown   = evaluation.scoreBreakdown;
        recommendedRole  = evaluation.recommendedRole;
        analysis         = evaluation;
        usedLocalFallback = true;
      } else {
        return jsonResponse({ success: false, message: getLlmErrorMessage(llmError) }, 502);
      }
    }

    if (usedLocalFallback) {
      analysis.suggestions = [
        `${getLlmProviderName()} quota or rate limit was reached, so this result used the built-in resume evaluator.`,
        ...analysis.suggestions,
      ];
    }

    // ── Save to MongoDB ──
    await connectMongo();
    const resume = await Resume.create({
      userId:        payload.userId,
      fileName,
      fileUrl:       `/uploads/${encodeURIComponent(safeName)}`,
      extractedText: normalizedText,
      extractedSkills,
      skillCategories,
      recommendedRole,
      analysisScore:  analysis.score,
      scoreBreakdown,
      analysisSummary: {
        strengths:   analysis.strengths,
        weaknesses:  analysis.weaknesses,
        suggestions: analysis.suggestions,
      },
    });

    return jsonResponse(
      {
        success: true,
        resume,
        message: usedLocalFallback
          ? `Resume analyzed with local fallback because ${getLlmProviderName()} quota or rate limit was reached.`
          : "Resume uploaded and analyzed successfully.",
      },
      201
    );
  } catch (error) {
    console.error("[upload] Unhandled error:", error?.message);
    return jsonResponse(
      { success: false, message: "Resume upload failed. Please try again." },
      500
    );
  }
}

// ─── Utility ──────────────────────────────────────────────────────────────────

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
