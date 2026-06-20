function parseJSONSafe(text) {
  try {
    return JSON.parse(text);
  } catch (error) {
    const cleaned = text.replace(/^[^\{\[]+/, "").replace(/[^\}\]]+$/, "");
    try {
      return JSON.parse(cleaned);
    } catch (innerError) {
      return {};
    }
  }
}

const EMPTY_SKILL_CATEGORIES = {
  languages: [],
  frameworks: [],
  databases: [],
  tools: [],
  softSkills: [],
};

const EMPTY_SCORE_BREAKDOWN = {
  technicalSkills: { score: 0, max: 40 },
  projects: { score: 0, max: 25 },
  education: { score: 0, max: 15 },
  certifications: { score: 0, max: 10 },
  resumeStructure: { score: 0, max: 10 },
};

function toCleanStringArray(value) {
  return Array.isArray(value) ? value.map((item) => String(item).trim()).filter(Boolean) : [];
}

function uniqueItems(items) {
  return [...new Set(items.filter(Boolean))];
}

function normalizeSkillCategories(value = {}) {
  return {
    languages: uniqueItems(toCleanStringArray(value.languages)),
    frameworks: uniqueItems(toCleanStringArray(value.frameworks)),
    databases: uniqueItems(toCleanStringArray(value.databases)),
    tools: uniqueItems(toCleanStringArray(value.tools)),
    softSkills: uniqueItems(toCleanStringArray(value.softSkills)),
  };
}

function flattenSkillCategories(skillCategories) {
  return uniqueItems([
    ...skillCategories.languages,
    ...skillCategories.frameworks,
    ...skillCategories.databases,
    ...skillCategories.tools,
    ...skillCategories.softSkills,
  ]);
}

function normalizeBreakdownItem(value, max) {
  return {
    score: clampScore(Number(value?.score) || 0),
    max,
  };
}

function normalizeScoreBreakdown(value = {}) {
  return {
    technicalSkills: normalizeBreakdownItem(value.technicalSkills, 40),
    projects: normalizeBreakdownItem(value.projects, 25),
    education: normalizeBreakdownItem(value.education, 15),
    certifications: normalizeBreakdownItem(value.certifications, 10),
    resumeStructure: normalizeBreakdownItem(value.resumeStructure, 10),
  };
}

function getBreakdownTotal(scoreBreakdown) {
  return Object.values(scoreBreakdown).reduce((total, item) => total + item.score, 0);
}

function normalizeEvaluation(parsed) {
  const skillCategories = normalizeSkillCategories(parsed.skillCategories || parsed.skillsByCategory || {});
  const legacySkills = toCleanStringArray(parsed.skills);
  const scoreBreakdown = normalizeScoreBreakdown(parsed.scoreBreakdown || {});
  const breakdownTotal = getBreakdownTotal(scoreBreakdown);

  return {
    skills: uniqueItems([...flattenSkillCategories(skillCategories), ...legacySkills]),
    skillCategories,
    recommendedRole: String(parsed.recommendedRole || "").trim(),
    score: clampScore(Number(parsed.score) || breakdownTotal),
    scoreBreakdown,
    strengths: toCleanStringArray(parsed.strengths),
    weaknesses: toCleanStringArray(parsed.weaknesses),
    suggestions: toCleanStringArray(parsed.suggestions),
  };
}

function getEvaluationPrompt(resumeText) {
  return `You are an ATS resume reviewer. Extract technical skills and evaluate this resume.
Return only JSON in this exact shape:
{
  "recommendedRole": "MERN Stack Developer",
  "skillCategories": {
    "languages": ["JavaScript", "Python"],
    "frameworks": ["React", "Express"],
    "databases": ["MongoDB", "MySQL"],
    "tools": ["Git", "GitHub", "VS Code"],
    "softSkills": ["Communication", "Problem Solving"]
  },
  "score": 0,
  "scoreBreakdown": {
    "technicalSkills": { "score": 0, "max": 40 },
    "projects": { "score": 0, "max": 25 },
    "education": { "score": 0, "max": 15 },
    "certifications": { "score": 0, "max": 10 },
    "resumeStructure": { "score": 0, "max": 10 }
  },
  "strengths": ["..."],
  "weaknesses": ["..."],
  "suggestions": ["..."]
}
Use scoreBreakdown scores that add up to the total score out of 100. Separate technical skills from soft skills. Recommend the single best-fit role. Resume: ${resumeText}`;
}

async function evaluateWithGemini(resumeText) {
  const { model } = await import("@/lib/gemini");
  const response = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [{ text: getEvaluationPrompt(resumeText) }],
      },
    ],
    generationConfig: {
      responseMimeType: "application/json",
      maxOutputTokens: 700,
      temperature: 0.25,
    },
  });

  return normalizeEvaluation(parseJSONSafe(response.response.text()));
}

async function evaluateWithGroq(resumeText) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("Please define GROQ_API_KEY in .env.local");
  }

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.GROQ_MODEL || "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: "You are a strict ATS resume evaluator. Return valid JSON only.",
        },
        {
          role: "user",
          content: getEvaluationPrompt(resumeText),
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.25,
      max_completion_tokens: 700,
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data?.error?.message || data?.message || `Groq request failed with status ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    error.provider = "groq";
    throw error;
  }

  return normalizeEvaluation(parseJSONSafe(data?.choices?.[0]?.message?.content || "{}"));
}

const SKILL_CATALOG = {
  languages: ["JavaScript", "TypeScript", "Python", "Java", "C++", "C", "HTML", "CSS", "SQL"],
  frameworks: ["React", "React.js", "Next.js", "Node.js", "Express", "Express.js", "Tailwind", "Bootstrap"],
  databases: ["MongoDB", "MySQL", "PostgreSQL", "Firebase"],
  tools: ["Git", "GitHub", "VS Code", "Docker", "AWS", "REST API", "GraphQL"],
  softSkills: ["Communication", "Problem Solving", "Analytical Thinking", "Team Collaboration", "Leadership"],
};

function hasAny(text, patterns) {
  return patterns.some((pattern) => pattern.test(text));
}

function clampScore(score) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function evaluateResumeLocally(resumeText) {
  const lowerText = resumeText.toLowerCase();
  const words = resumeText.split(/\s+/).filter(Boolean);
  const skillCategories = Object.fromEntries(
    Object.entries(SKILL_CATALOG).map(([category, skills]) => [
      category,
      skills.filter((skill) => lowerText.includes(skill.toLowerCase())),
    ])
  );
  const skills = flattenSkillCategories(skillCategories);
  const strengths = [];
  const weaknesses = [];
  const suggestions = [];
  const scoreBreakdown = structuredClone(EMPTY_SCORE_BREAKDOWN);

  const checks = [
    {
      passed: hasAny(resumeText, [/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i, /\+?\d[\d\s-]{8,}\d/]),
      breakdownKey: "resumeStructure",
      points: 3,
      strength: "Contact details are present and easy to identify.",
      weakness: "Contact details are missing or hard to identify.",
      suggestion: "Add a clear phone number and professional email at the top of the resume.",
    },
    {
      passed: hasAny(lowerText, [/linkedin/, /github/, /portfolio/]),
      breakdownKey: "resumeStructure",
      points: 2,
      strength: "Professional links such as LinkedIn, GitHub, or portfolio are included.",
      weakness: "Professional profile links are limited.",
      suggestion: "Include LinkedIn, GitHub, and portfolio links so recruiters can verify your work quickly.",
    },
    {
      passed: hasAny(lowerText, [/skills?/, /technologies/, /technical skills/]) && skills.length >= 4,
      breakdownKey: "technicalSkills",
      points: Math.min(40, 15 + skills.length * 3),
      strength: "Technical skills are listed clearly.",
      weakness: "The skills section could be stronger or more specific.",
      suggestion: "Group skills by category, such as frontend, backend, database, tools, and languages.",
    },
    {
      passed: hasAny(lowerText, [/projects?/, /experience/, /internship/, /work history/]),
      breakdownKey: "projects",
      points: 20,
      strength: "The resume includes project or experience details.",
      weakness: "Project or experience details are not prominent enough.",
      suggestion: "Add 2-3 strong projects with tech stack, responsibilities, and outcomes.",
    },
    {
      passed: hasAny(resumeText, [/\b\d+%/, /\b\d+\+/, /\b\d{2,}\b.*\b(users|requests|records|students|clients|projects)\b/i]),
      breakdownKey: "projects",
      points: 5,
      strength: "Some achievements include measurable impact.",
      weakness: "Achievements are not quantified enough.",
      suggestion: "Use numbers where possible, for example performance improvement, users served, or project scale.",
    },
    {
      passed: hasAny(lowerText, [/education/, /degree/, /bachelor/, /master/, /mca/, /bca/, /university/, /college/]),
      breakdownKey: "education",
      points: 15,
      strength: "Education information is included.",
      weakness: "Education details are missing or unclear.",
      suggestion: "Add degree, college/university, graduation year, and relevant coursework if useful.",
    },
  ];

  checks.forEach((check) => {
    if (check.passed) {
      scoreBreakdown[check.breakdownKey].score = Math.min(
        scoreBreakdown[check.breakdownKey].max,
        scoreBreakdown[check.breakdownKey].score + check.points
      );
      strengths.push(check.strength);
    } else {
      weaknesses.push(check.weakness);
      suggestions.push(check.suggestion);
    }
  });

  if (words.length < 250) {
    scoreBreakdown.resumeStructure.score = Math.max(0, scoreBreakdown.resumeStructure.score - 3);
    weaknesses.push("The resume appears too short for a complete candidate profile.");
    suggestions.push("Add more detail to projects, responsibilities, tools used, and achievements.");
  } else if (words.length > 900) {
    scoreBreakdown.resumeStructure.score = Math.max(0, scoreBreakdown.resumeStructure.score - 2);
    weaknesses.push("The resume may be too long and could be harder to scan.");
    suggestions.push("Keep the resume concise and prioritize the most relevant experience.");
  } else {
    scoreBreakdown.resumeStructure.score = Math.min(10, scoreBreakdown.resumeStructure.score + 5);
    strengths.push("Resume length looks reasonable for recruiter screening.");
  }

  if (hasAny(lowerText, [/certifications?/, /certificate/, /certified/])) {
    scoreBreakdown.certifications.score = 5;
    strengths.push("Certifications or credentials are mentioned.");
  } else {
    suggestions.push("Add relevant certifications or course credentials if you have them.");
  }

  const recommendedRole =
    skillCategories.frameworks.some((skill) => ["React", "React.js", "Node.js", "Express", "Express.js"].includes(skill)) &&
    skillCategories.databases.includes("MongoDB")
      ? "MERN Stack Developer"
      : skillCategories.frameworks.some((skill) => ["React", "React.js", "Next.js"].includes(skill))
      ? "Frontend Developer"
      : skillCategories.languages.includes("Python")
      ? "Python Developer"
      : "Software Developer";

  return {
    skills,
    skillCategories,
    recommendedRole,
    score: clampScore(getBreakdownTotal(scoreBreakdown)),
    scoreBreakdown,
    strengths: strengths.slice(0, 5),
    weaknesses: weaknesses.slice(0, 5),
    suggestions: suggestions.slice(0, 6),
  };
}

export async function evaluateResume(resumeText) {
  if (process.env.LLM_PROVIDER === "gemini") {
    return evaluateWithGemini(resumeText);
  }

  return evaluateWithGroq(resumeText);
}
