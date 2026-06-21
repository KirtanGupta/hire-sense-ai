// ─── Evaluation Service — Phase 6 ────────────────────────────────────────────
// Evaluates interview answers using Groq/Gemini and generates a final report.

function parseJSONSafe(text) {
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    let cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "");
    cleaned = cleaned.replace(/^[^\{\[]+/, "").replace(/[^\}\]]+$/, "");
    try {
      return JSON.parse(cleaned);
    } catch {
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        try { return JSON.parse(match[0]); } catch { return {}; }
      }
      return {};
    }
  }
}

function clamp(v, min = 0, max = 10) {
  return Math.max(min, Math.min(max, Math.round(Number(v) || 0)));
}

// ─── NLP Confidence Score ─────────────────────────────────────────────────────
export function calculateConfidenceScore(answers) {
  const fillerPatterns = [
    /\bum\b/gi, /\buh\b/gi, /\blike\b/gi, /\bbasically\b/gi,
    /\bactually\b/gi, /\byou know\b/gi, /\bkind of\b/gi,
    /\bsort of\b/gi, /\bi guess\b/gi, /\bi think\b/gi,
    /\bi mean\b/gi, /\bright\?/gi, /\bso yeah\b/gi,
  ];

  const combined = answers.filter(Boolean).join(" ").trim();
  const words = combined.split(/\s+/).filter(Boolean);
  const totalWords = words.length;

  if (totalWords < 20) return 75; // insufficient data — neutral score

  let fillerCount = 0;
  fillerPatterns.forEach((pattern) => {
    const matches = combined.match(pattern);
    if (matches) fillerCount += matches.length;
  });

  // fillerRate: 0% → 100 score, 15%+ → 40 score
  const fillerRate = fillerCount / totalWords;
  const score = Math.max(40, Math.min(100, Math.round(100 - fillerRate * 400)));
  return score;
}

// ─── LLM Caller Helpers ───────────────────────────────────────────────────────
async function callGroq(systemPrompt, userPrompt, maxTokens = 700) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY not set");

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.GROQ_MODEL || "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
      max_completion_tokens: maxTokens,
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const err = new Error(data?.error?.message || `Groq error ${response.status}`);
    err.status = response.status;
    throw err;
  }
  return parseJSONSafe(data?.choices?.[0]?.message?.content || "{}");
}

async function callGemini(prompt, maxTokens = 700) {
  const { model } = await import("@/lib/gemini");
  const response = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: "application/json",
      maxOutputTokens: maxTokens,
      temperature: 0.2,
    },
  });
  return parseJSONSafe(response.response.text());
}

async function callLLM(systemPrompt, userPrompt, maxTokens = 700) {
  if (process.env.LLM_PROVIDER === "gemini") {
    return callGemini(`${systemPrompt}\n\n${userPrompt}`, maxTokens);
  }
  return callGroq(systemPrompt, userPrompt, maxTokens);
}

// ─── Per-Answer Evaluation ────────────────────────────────────────────────────
function getAnswerEvalPrompt(role, difficulty, question, answer) {
  const ans = answer?.trim() || "";
  return `You are evaluating a technical interview answer.

Role: ${role} | Difficulty: ${difficulty}
Question: ${question}
Candidate Answer: ${ans || "[No answer provided]"}

${!ans ? "All scores must be 0 since no answer was provided." : "Score honestly based on the actual answer content."}

Return ONLY this JSON (no markdown):
{
  "technicalScore": <0-10>,
  "completeness": <0-10>,
  "communication": <0-10>,
  "strengths": ["<strength 1>", "<strength 2>"],
  "weaknesses": ["<weakness 1>"],
  "feedback": "<one concise sentence>"
}`;
}

async function evaluateOneAnswer({ role, difficulty, question, answer }) {
  // No answer → instant zero without LLM call
  if (!answer?.trim()) {
    return {
      score: 0, technicalScore: 0, completeness: 0, communication: 0,
      strengths: [], weaknesses: ["No answer was provided."],
      feedback: "Question was skipped.",
    };
  }

  try {
    const raw = await callLLM(
      "You are a strict technical interviewer. Return ONLY valid JSON. No markdown.",
      getAnswerEvalPrompt(role, difficulty, question, answer),
      600
    );
    const ts = clamp(raw.technicalScore);
    const comp = clamp(raw.completeness);
    const comm = clamp(raw.communication);
    const score = Math.round(((ts + comp + comm) / 3) * 10); // 0-100
    return {
      score,
      technicalScore: ts,
      completeness: comp,
      communication: comm,
      strengths: Array.isArray(raw.strengths) ? raw.strengths.slice(0, 3).map(String) : [],
      weaknesses: Array.isArray(raw.weaknesses) ? raw.weaknesses.slice(0, 3).map(String) : [],
      feedback: String(raw.feedback || "").slice(0, 400),
    };
  } catch (error) {
    console.error("Answer evaluation error:", error.message);
    // Graceful fallback — don't block the whole evaluation
    return {
      score: 50, technicalScore: 5, completeness: 5, communication: 5,
      strengths: [], weaknesses: ["Could not evaluate this answer."],
      feedback: "Evaluation unavailable for this question.",
    };
  }
}

// ─── Final Report Generation ──────────────────────────────────────────────────
function getFinalReportPrompt({ role, difficulty, experience, avgScore, topStrengths, topWeaknesses }) {
  return `Generate a final interview evaluation report. Return ONLY valid JSON.

Candidate: ${experience} → ${role} (${difficulty} difficulty)
Overall Score: ${avgScore}%
Key Strengths observed: ${topStrengths.slice(0, 5).join("; ") || "none noted"}
Key Weaknesses observed: ${topWeaknesses.slice(0, 5).join("; ") || "none noted"}

{
  "strengths": ["<top strength 1>", "<top strength 2>", "<top strength 3>"],
  "weaknesses": ["<area to improve 1>", "<area to improve 2>", "<area to improve 3>"],
  "recommendation": "<one concise sentence about role suitability>"
}`;
}

async function generateFinalReport(params) {
  try {
    const raw = await callLLM(
      "You are a senior technical interviewer writing a performance summary. Return ONLY valid JSON.",
      getFinalReportPrompt(params),
      700
    );
    return {
      strengths: Array.isArray(raw.strengths) ? raw.strengths.slice(0, 5).map(String) : params.topStrengths.slice(0, 5),
      weaknesses: Array.isArray(raw.weaknesses) ? raw.weaknesses.slice(0, 5).map(String) : params.topWeaknesses.slice(0, 5),
      recommendation: String(raw.recommendation || `Candidate scored ${params.avgScore}% for ${params.role} at ${params.difficulty} level.`).slice(0, 500),
    };
  } catch (error) {
    console.error("Final report error:", error.message);
    return {
      strengths: params.topStrengths.slice(0, 5),
      weaknesses: params.topWeaknesses.slice(0, 5),
      recommendation: `Based on the evaluation, the candidate demonstrated ${params.avgScore}% proficiency for the ${params.role} role.`,
    };
  }
}

// ─── Main Orchestrator ────────────────────────────────────────────────────────
export async function evaluateSession(session) {
  const { role, difficulty, experience, questions } = session;

  console.log(`[Evaluation] Starting evaluation for session: ${session._id} (${questions.length} questions)`);

  // 1. Evaluate each question sequentially to avoid rate limits
  const questionEvaluations = [];
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    console.log(`[Evaluation] Evaluating Q${i + 1}/${questions.length}`);
    const evalResult = await evaluateOneAnswer({
      role, difficulty,
      question: q.question,
      answer: q.answer,
    });
    questionEvaluations.push(evalResult);
    // 250ms pause between LLM calls to avoid rate limits
    if (i < questions.length - 1) {
      await new Promise((r) => setTimeout(r, 250));
    }
  }

  // 2. Compute aggregate scores
  const scores = questionEvaluations.map((e) => e.score);
  const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);

  const avgTechnical = Math.round(
    (questionEvaluations.reduce((a, e) => a + e.technicalScore, 0) / questionEvaluations.length) * 10
  );
  const avgCommunication = Math.round(
    (questionEvaluations.reduce((a, e) => a + e.communication, 0) / questionEvaluations.length) * 10
  );

  // 3. NLP Confidence Score
  const allAnswers = questions.map((q) => q.answer || "");
  const confidenceScore = calculateConfidenceScore(allAnswers);

  // 4. Collect all strengths/weaknesses for the final report
  const allStrengths = questionEvaluations.flatMap((e) => e.strengths).filter(Boolean);
  const allWeaknesses = questionEvaluations.flatMap((e) => e.weaknesses).filter(Boolean);

  // 5. Generate final summary report
  const finalReport = await generateFinalReport({
    role, difficulty, experience, avgScore,
    topStrengths: [...new Set(allStrengths)],
    topWeaknesses: [...new Set(allWeaknesses)],
  });

  // 6. Build evaluated questions array
  const evaluatedQuestions = questions.map((q, i) => ({
    question: q.question,
    answer: q.answer || "",
    type: q.type || "technical",
    evaluation: questionEvaluations[i],
  }));

  console.log(`[Evaluation] Complete. Overall score: ${avgScore}%`);

  return {
    evaluatedQuestions,
    overallScore: avgScore,
    technicalScore: avgTechnical,
    communicationScore: avgCommunication,
    confidenceScore,
    strengths: finalReport.strengths,
    weaknesses: finalReport.weaknesses,
    recommendation: finalReport.recommendation,
  };
}
