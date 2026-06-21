// ─── Evaluation Service — Phase 6 + 7 ────────────────────────────────────────
// Evaluates interview answers using Groq/Gemini and generates a final report.
// Phase 7 adds: voiceScore, averageWPM, interviewMode to the session result.

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

// ─── NLP Confidence Score (text-based fallback) ───────────────────────────────
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

// ─── Phase 7: Voice Analytics Aggregation ────────────────────────────────────
function aggregateVoiceAnalytics(questions) {
  const voiceQuestions = questions.filter(
    (q) => q.answerMode === "voice" && q.speechData
  );

  if (voiceQuestions.length === 0) {
    return {
      voiceScore: null,
      averageWPM: null,
      averageConfidence: null,
      totalFillerWords: 0,
      interviewMode: "text",
    };
  }

  const textCount = questions.filter((q) => !q.answerMode || q.answerMode === "text").length;
  const voiceCount = voiceQuestions.length;

  let interviewMode = "voice";
  if (textCount > 0 && voiceCount > 0) interviewMode = "mixed";
  else if (textCount === questions.length) interviewMode = "text";

  const totalFillerWords = voiceQuestions.reduce(
    (sum, q) => sum + (q.speechData?.fillerCount || 0), 0
  );

  const avgWPM = Math.round(
    voiceQuestions.reduce((sum, q) => sum + (q.speechData?.wpm || 0), 0) / voiceCount
  );

  const avgConfidence = Math.round(
    voiceQuestions.reduce((sum, q) => sum + (q.speechData?.confidenceScore || 0), 0) / voiceCount
  );

  const avgVoiceQuality = Math.round(
    voiceQuestions.reduce((sum, q) => sum + (q.speechData?.voiceQualityScore || 0), 0) / voiceCount
  );

  return {
    voiceScore: avgVoiceQuality,
    averageWPM: avgWPM,
    averageConfidence: avgConfidence,
    totalFillerWords,
    interviewMode,
  };
}

// ─── Phase 7: Final Overall Score Formula ─────────────────────────────────────
// Technical: 50%, Communication: 20%, Confidence: 15%, Voice: 15%
function computeOverallScore({ technicalScore, communicationScore, confidenceScore, voiceScore }) {
  const voice = voiceScore ?? 90; // default to 90 for text-only (no voice penalties)
  return Math.round(
    technicalScore * 0.5 +
    communicationScore * 0.2 +
    confidenceScore * 0.15 +
    voice * 0.15
  );
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

  // 2. Compute aggregate LLM scores
  const scores = questionEvaluations.map((e) => e.score);
  const avgTechnical = Math.round(
    (questionEvaluations.reduce((a, e) => a + e.technicalScore, 0) / questionEvaluations.length) * 10
  );
  const avgCommunication = Math.round(
    (questionEvaluations.reduce((a, e) => a + e.communication, 0) / questionEvaluations.length) * 10
  );

  // 3. NLP Confidence Score (text-based)
  const allAnswers = questions.map((q) => q.answer || "");
  const confidenceScore = calculateConfidenceScore(allAnswers);

  // 4. Phase 7 — Voice analytics aggregation
  const voiceAnalytics = aggregateVoiceAnalytics(questions);

  // 5. Phase 7 — Final score: Technical 50% + Communication 20% + Confidence 15% + Voice 15%
  const overallScore = computeOverallScore({
    technicalScore: avgTechnical,
    communicationScore: avgCommunication,
    confidenceScore,
    voiceScore: voiceAnalytics.voiceScore,
  });

  // 6. Collect all strengths/weaknesses for the final report
  const allStrengths = questionEvaluations.flatMap((e) => e.strengths).filter(Boolean);
  const allWeaknesses = questionEvaluations.flatMap((e) => e.weaknesses).filter(Boolean);

  // 7. Generate final summary report
  const finalReport = await generateFinalReport({
    role, difficulty, experience, avgScore: overallScore,
    topStrengths: [...new Set(allStrengths)],
    topWeaknesses: [...new Set(allWeaknesses)],
  });

  // 8. Build evaluated questions array
  const evaluatedQuestions = questions.map((q, i) => ({
    question: q.question,
    answer: q.answer || "",
    type: q.type || "technical",
    evaluation: questionEvaluations[i],
    // Preserve Phase 7 voice fields
    answerMode: q.answerMode || "text",
    transcript: q.transcript || "",
    speechData: q.speechData || null,
  }));

  console.log(`[Evaluation] Complete. Overall score: ${overallScore}% | Mode: ${voiceAnalytics.interviewMode}`);

  return {
    evaluatedQuestions,
    overallScore,
    technicalScore: avgTechnical,
    communicationScore: avgCommunication,
    confidenceScore,
    strengths: finalReport.strengths,
    weaknesses: finalReport.weaknesses,
    recommendation: finalReport.recommendation,
    // Phase 7 voice fields
    voiceScore: voiceAnalytics.voiceScore,
    averageWPM: voiceAnalytics.averageWPM,
    averageConfidence: voiceAnalytics.averageConfidence,
    totalFillerWords: voiceAnalytics.totalFillerWords,
    interviewMode: voiceAnalytics.interviewMode,
  };
}
