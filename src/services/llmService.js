function parseJSONSafe(text) {
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch (error) {
    // Strip markdown code fences (```json ... ``` or ``` ... ```)
    let cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "");
    // Strip any leading/trailing non-JSON characters
    cleaned = cleaned.replace(/^[^\{\[]+/, "").replace(/[^\}\]]+$/, "");
    try {
      return JSON.parse(cleaned);
    } catch (innerError) {
      // Try extracting the first JSON object from the text
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          return JSON.parse(match[0]);
        } catch {
          return {};
        }
      }
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
  return `You are an expert ATS resume reviewer. Carefully read the resume below and return a JSON evaluation.

RULES:
- Extract ALL technical skills (languages, frameworks, databases, tools) and ALL soft skills found in the resume.
- Score the resume honestly out of 100 based on actual content. Do NOT return zeros unless the section is completely absent.
- scoreBreakdown scores MUST add up exactly to the total score.
- Return ONLY valid JSON, no markdown, no explanation.

JSON shape to follow (use real values, not these examples):
{
  "recommendedRole": "MERN Stack Developer",
  "skillCategories": {
    "languages": ["JavaScript", "Python"],
    "frameworks": ["React", "Express"],
    "databases": ["MongoDB", "MySQL"],
    "tools": ["Git", "GitHub", "VS Code"],
    "softSkills": ["Communication", "Problem Solving", "Team Collaboration"]
  },
  "score": 72,
  "scoreBreakdown": {
    "technicalSkills": { "score": 28, "max": 40 },
    "projects": { "score": 20, "max": 25 },
    "education": { "score": 12, "max": 15 },
    "certifications": { "score": 5, "max": 10 },
    "resumeStructure": { "score": 7, "max": 10 }
  },
  "strengths": ["Strong technical stack", "Good project experience"],
  "weaknesses": ["No certifications listed", "Could improve structure"],
  "suggestions": ["Add certifications", "Quantify achievements with numbers"]
}

Resume to evaluate:
${resumeText}`;
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
      maxOutputTokens: 1500,
      temperature: 0.2,
    },
  });

  const rawText = response.response.text();
  const parsed = parseJSONSafe(rawText);
  if (!parsed || Object.keys(parsed).length === 0) {
    throw new Error("Gemini returned an empty or unparseable response");
  }
  return normalizeEvaluation(parsed);
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
          content: "You are an expert ATS resume evaluator. You MUST return valid JSON only — no markdown, no explanation. Fill in real scores based on the resume content. Never return zero scores unless a section is completely missing.",
        },
        {
          role: "user",
          content: getEvaluationPrompt(resumeText),
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
      max_completion_tokens: 1500,
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

  const content = data?.choices?.[0]?.message?.content || "{}";
  const parsed = parseJSONSafe(content);
  if (!parsed || Object.keys(parsed).length === 0) {
    throw new Error("Groq returned an empty or unparseable response");
  }
  return normalizeEvaluation(parsed);
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

// ─── Interview Question Generation ────────────────────────────────────────────

function getQuestionPrompt({ role, difficulty, experience, skills, questionCount }) {
  const skillList = skills.length > 0 ? skills.join(", ") : "General software development";
  return `You are a senior technical interviewer. Generate exactly ${questionCount} interview questions.

Role: ${role}
Difficulty: ${difficulty}
Experience Level: ${experience}
Candidate Skills: ${skillList}

Rules:
1. Questions MUST be technical and relevant to the role and skills listed.
2. Match difficulty: Easy = conceptual, Medium = applied, Hard = architecture/advanced.
3. Mix question types: definitions, scenario-based, comparison, best-practice.
4. Each question should be standalone and specific (not vague).
5. Return ONLY valid JSON, no markdown, no explanation.

Return this exact JSON shape:
{
  "questions": [
    "What is the Virtual DOM and why does React use it?",
    "Explain the difference between useEffect and useLayoutEffect."
  ]
}`;
}

const FALLBACK_QUESTIONS = {
  "MERN Developer": [
    "What is the Virtual DOM and how does React use it?",
    "Explain the difference between useState and useReducer in React.",
    "How does Express.js handle middleware?",
    "What are Mongoose schemas and models?",
    "Explain the event loop in Node.js.",
    "What is JWT and how is it used for authentication?",
    "How does MongoDB differ from a relational database like MySQL?",
    "What is CORS and how do you handle it in Express?",
    "Explain React's component lifecycle.",
    "What are environment variables and why should you use them?",
    "What is REST API and what are its constraints?",
    "How do you handle asynchronous operations in JavaScript?",
    "Explain the concept of promises and async/await.",
    "What are React hooks? Name and describe five common ones.",
    "How does MongoDB indexing improve query performance?",
  ],
  "Frontend Developer": [
    "What is the difference between CSS Flexbox and CSS Grid?",
    "How does the browser render a webpage?",
    "What is the difference between var, let, and const in JavaScript?",
    "Explain how event delegation works in JavaScript.",
    "What are Web APIs and give three examples.",
    "What is responsive design and how do you implement it?",
    "Explain the box model in CSS.",
    "What is a closure in JavaScript?",
    "How does React's reconciliation algorithm work?",
    "What is lazy loading and why is it useful?",
    "Explain the difference between synchronous and asynchronous JavaScript.",
    "What are CSS custom properties (variables)?",
    "How do you optimize a web page for performance?",
    "What is the purpose of semantic HTML?",
    "Explain cross-browser compatibility issues and how to solve them.",
  ],
  "Backend Developer": [
    "What is RESTful API design and its key principles?",
    "Explain database normalization and its forms.",
    "What is the difference between SQL and NoSQL databases?",
    "How do you handle database transactions?",
    "What is caching and how do you implement it?",
    "Explain microservices architecture.",
    "What is an ORM and why use one?",
    "How does authentication differ from authorization?",
    "What are HTTP status codes and name five important ones?",
    "Explain database indexing and when to use it.",
    "What is a message queue and when would you use one?",
    "How do you secure an API endpoint?",
    "What is connection pooling?",
    "Explain the SOLID principles.",
    "What is Docker and why is it useful for backend development?",
  ],
  "Python Developer": [
    "What are Python decorators and how do they work?",
    "Explain the difference between lists and tuples in Python.",
    "What is a generator in Python?",
    "How does Python's garbage collection work?",
    "What is the GIL (Global Interpreter Lock)?",
    "Explain list comprehensions vs generator expressions.",
    "What is the difference between deepcopy and shallowcopy?",
    "How do you handle exceptions in Python?",
    "What is the purpose of __init__ and __str__ methods?",
    "Explain Python's context managers (with statement).",
    "What is the difference between *args and **kwargs?",
    "How does Python manage memory?",
    "What are Python virtual environments and why use them?",
    "Explain the difference between == and is in Python.",
    "What is duck typing in Python?",
  ],
  default: [
    "Explain object-oriented programming and its four pillars.",
    "What is the difference between a stack and a queue?",
    "How does version control work and why is it important?",
    "What is an algorithm and how do you evaluate its efficiency?",
    "Explain the concept of recursion with an example.",
    "What is the difference between compiled and interpreted languages?",
    "How does HTTP work at a high level?",
    "What are design patterns and name three common ones?",
    "Explain the concept of concurrency vs parallelism.",
    "What is a database index and when should you use one?",
    "What is the MVC (Model-View-Controller) pattern?",
    "How do you approach debugging a complex bug?",
    "Explain what an API is and how it's used.",
    "What is the difference between synchronous and asynchronous programming?",
    "How do you ensure code quality in a team environment?",
  ],
};

function getFallbackQuestions(role, questionCount) {
  const bank =
    FALLBACK_QUESTIONS[role] ||
    FALLBACK_QUESTIONS["MERN Developer"] ||
    FALLBACK_QUESTIONS.default;
  // Shuffle for variety
  const shuffled = [...bank].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(questionCount, shuffled.length));
}

async function generateQuestionsWithGroq(params) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY is not defined in .env.local");

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
          content:
            "You are a senior technical interviewer. Return ONLY valid JSON with a 'questions' array of strings. No markdown, no explanation.",
        },
        { role: "user", content: getQuestionPrompt(params) },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_completion_tokens: 1200,
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const msg = data?.error?.message || `Groq request failed with status ${response.status}`;
    const err = new Error(msg);
    err.status = response.status;
    throw err;
  }

  const content = data?.choices?.[0]?.message?.content || "{}";
  const parsed = parseJSONSafe(content);
  const questions = Array.isArray(parsed?.questions) ? parsed.questions.map(String).filter(Boolean) : [];
  if (questions.length === 0) throw new Error("Groq returned no questions");
  return questions.slice(0, params.questionCount);
}

async function generateQuestionsWithGemini(params) {
  const { model } = await import("@/lib/gemini");
  const response = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: getQuestionPrompt(params) }] }],
    generationConfig: {
      responseMimeType: "application/json",
      maxOutputTokens: 1200,
      temperature: 0.7,
    },
  });

  const parsed = parseJSONSafe(response.response.text());
  const questions = Array.isArray(parsed?.questions) ? parsed.questions.map(String).filter(Boolean) : [];
  if (questions.length === 0) throw new Error("Gemini returned no questions");
  return questions.slice(0, params.questionCount);
}

export async function generateInterviewQuestions(params) {
  try {
    if (process.env.LLM_PROVIDER === "gemini") {
      return await generateQuestionsWithGemini(params);
    }
    return await generateQuestionsWithGroq(params);
  } catch (error) {
    console.error("LLM question generation failed, using fallback:", error.message);
    return getFallbackQuestions(params.role, params.questionCount);
  }
}
