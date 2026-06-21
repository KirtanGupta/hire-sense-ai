"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/store/authStore";
import toast from "react-hot-toast";
import { GeneratingLoader } from "@/components/ui/LoadingStates";

const BASE_ROLES = [
  "MERN Developer",
  "Frontend Developer",
  "Backend Developer",
  "Java Developer",
  "Python Developer",
  "Data Analyst",
  "AI Engineer",
];

const DIFFICULTIES = ["Easy", "Medium", "Hard"];
const EXPERIENCES = ["Fresher", "1-2 Years", "3-5 Years"];
const QUESTION_COUNTS = [5, 10, 15];

const difficultyColors = {
  Easy: { bg: "rgba(34,197,94,0.12)", border: "rgba(34,197,94,0.35)", text: "#4ade80" },
  Medium: { bg: "rgba(250,204,21,0.12)", border: "rgba(250,204,21,0.35)", text: "#facc15" },
  Hard: { bg: "rgba(248,113,113,0.12)", border: "rgba(248,113,113,0.35)", text: "#f87171" },
};

export default function InterviewSetup() {
  const router = useRouter();
  const [role, setRole] = useState("");
  const [difficulty, setDifficulty] = useState("Medium");
  const [experience, setExperience] = useState("Fresher");
  const [questionCount, setQuestionCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const user = useAuthStore((state) => state.user);

  // Resume-detected data
  const [resumeRole, setResumeRole] = useState("");
  const [resumeSkills, setResumeSkills] = useState([]);
  const [resumeLoading, setResumeLoading] = useState(true);
  const [roles, setRoles] = useState(BASE_ROLES);

  // ── Auto-detect role from resume on mount ─────────────────────────────────
  useEffect(() => {
    async function fetchResumeData() {
      try {
        const res = await fetch("/api/resume/skills", { credentials: "include" });
        const data = await res.json();
        if (data.success) {
          const detected = (data.recommendedRole || "").trim();
          const skills = data.skills || [];
          setResumeSkills(skills);
          if (detected) {
            setResumeRole(detected);
            setRole(detected); // auto-select
            // If not in the list, prepend it
            setRoles((prev) =>
              prev.includes(detected) ? prev : [detected, ...prev]
            );
          }
        }
      } catch {
        // Silent — user can still pick manually
      } finally {
        setResumeLoading(false);
      }
    }
    fetchResumeData();
  }, []);

  async function handleGenerate() {
    if (!role) {
      toast.error("Please select a role to continue.");
      setError("Please select a role to continue.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/interview/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ role, difficulty, experience, questionCount }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("✅ Interview generated! Starting session...");
        router.push(`/interview/session/${data.sessionId}`);
      } else {
        const msg = data.message || "Your account has been blocked. You cannot start interviews.";
        setError(msg);
        toast.error(`❌ ${msg}`);
      }
    } catch {
      const msg = "Network error. Please try again.";
      setError(msg);
      toast.error(`❌ ${msg}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 780, margin: "0 auto", display: "grid", gap: "1.5rem" }}>
      {/* ── Block Warning Banner ── */}
      {user?.isBlocked && (
        <div style={{
          backgroundColor: "rgba(239,68,68,0.1)",
          border: "1px solid rgba(239,68,68,0.4)",
          color: "#f87171",
          padding: "1rem 1.5rem",
          borderRadius: "0.75rem",
          display: "flex",
          alignItems: "center",
          gap: "1rem"
        }}>
          <span style={{ fontSize: "1.5rem" }}>🚫</span>
          <div>
            <h3 style={{ margin: "0 0 0.25rem", color: "#fca5a5" }}>Account Blocked</h3>
            <p style={{ margin: 0, fontSize: "0.9rem" }}>
              Your account is blocked. You cannot generate new interviews.
            </p>
          </div>
        </div>
      )}

      {/* Resume context banner */}
      {!resumeLoading && (resumeRole || resumeSkills.length > 0) && (
        <div
          style={{
            padding: "1rem 1.5rem",
            borderRadius: "1.25rem",
            background: "rgba(6,182,212,0.07)",
            border: "1px solid rgba(6,182,212,0.25)",
            display: "flex",
            alignItems: "flex-start",
            gap: "0.75rem",
          }}
        >
          <span style={{ fontSize: "1.25rem", flexShrink: 0 }}>📄</span>
          <div>
            <p style={{ color: "#22d3ee", fontWeight: 600, margin: "0 0 0.25rem", fontSize: "0.9rem" }}>
              Resume Detected
            </p>
            <p style={{ color: "#94a3b8", fontSize: "0.85rem", margin: 0, lineHeight: 1.6 }}>
              {resumeRole && (
                <>Recommended role: <strong style={{ color: "#f8fafc" }}>{resumeRole}</strong>.</>
              )}{" "}
              {resumeSkills.length > 0 && (
                <>Questions will be tailored to your skills: <strong style={{ color: "#f8fafc" }}>{resumeSkills.slice(0, 5).join(", ")}{resumeSkills.length > 5 ? ` +${resumeSkills.length - 5} more` : ""}</strong>.</>
              )}
            </p>
          </div>
        </div>
      )}

      {!resumeLoading && !resumeRole && resumeSkills.length === 0 && (
        <div
          style={{
            padding: "0.9rem 1.25rem",
            borderRadius: "1rem",
            background: "rgba(250,204,21,0.07)",
            border: "1px solid rgba(250,204,21,0.2)",
            display: "flex",
            gap: "0.65rem",
            alignItems: "center",
          }}
        >
          <span>⚠️</span>
          <p style={{ color: "#fbbf24", fontSize: "0.85rem", margin: 0 }}>
            No resume found. Upload your resume first so questions are tailored to your skills. You can still start an interview manually.
          </p>
        </div>
      )}

      {/* Role Selection */}
      <div style={cardStyle}>
        <div style={sectionHeaderStyle}>
          <span style={badgeStyle}>Step 1</span>
          <h3 style={sectionTitleStyle}>Select Role</h3>
          <p style={sectionSubStyle}>
            {resumeLoading
              ? "Checking your resume…"
              : resumeRole
              ? "Pre-selected from your resume. You can change it."
              : "Choose the job role you want to practice for."}
          </p>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))",
            gap: "0.75rem",
          }}
        >
          {roles.map((r) => {
            const isSelected = role === r;
            const isRecommended = r === resumeRole;
            return (
              <button
                key={r}
                onClick={() => setRole(r)}
                style={{
                  ...optionBtnStyle,
                  ...(isSelected ? selectedOptStyle : {}),
                  position: "relative",
                }}
              >
                <span style={{ fontSize: "1.1rem" }}>{roleIcon(r)}</span>
                {r}
                {isRecommended && (
                  <span
                    style={{
                      position: "absolute",
                      top: -9,
                      right: 6,
                      padding: "0.15rem 0.55rem",
                      borderRadius: "999px",
                      background: "rgba(6,182,212,0.18)",
                      border: "1px solid rgba(6,182,212,0.45)",
                      color: "#22d3ee",
                      fontSize: "0.62rem",
                      fontWeight: 700,
                      letterSpacing: "0.04em",
                      whiteSpace: "nowrap",
                    }}
                  >
                    ✦ Your Resume
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        {/* Difficulty */}
        <div style={cardStyle}>
          <div style={sectionHeaderStyle}>
            <span style={badgeStyle}>Step 2</span>
            <h3 style={sectionTitleStyle}>Difficulty</h3>
          </div>
          <div style={{ display: "grid", gap: "0.65rem" }}>
            {DIFFICULTIES.map((d) => {
              const c = difficultyColors[d];
              const selected = difficulty === d;
              return (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  style={{
                    padding: "0.85rem 1.1rem",
                    borderRadius: "0.9rem",
                    border: `1px solid ${selected ? c.border : "rgba(148,163,184,0.15)"}`,
                    background: selected ? c.bg : "rgba(148,163,184,0.04)",
                    color: selected ? c.text : "#cbd5e1",
                    cursor: "pointer",
                    textAlign: "left",
                    fontWeight: selected ? 600 : 400,
                    fontSize: "0.95rem",
                    transition: "all 0.18s ease",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.65rem",
                  }}
                >
                  <span>{difficultyEmoji(d)}</span>
                  {d}
                  {selected && (
                    <span style={{ marginLeft: "auto", fontSize: "0.8rem" }}>✓ Selected</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Experience + Question Count */}
        <div style={{ display: "grid", gap: "1.5rem", alignContent: "start" }}>
          <div style={cardStyle}>
            <div style={sectionHeaderStyle}>
              <span style={badgeStyle}>Step 3</span>
              <h3 style={sectionTitleStyle}>Experience</h3>
            </div>
            <div style={{ display: "grid", gap: "0.65rem" }}>
              {EXPERIENCES.map((e) => (
                <button
                  key={e}
                  onClick={() => setExperience(e)}
                  style={{
                    ...optionBtnStyle,
                    ...(experience === e ? selectedOptStyle : {}),
                  }}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div style={cardStyle}>
            <div style={sectionHeaderStyle}>
              <span style={badgeStyle}>Step 4</span>
              <h3 style={sectionTitleStyle}>Questions</h3>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "0.65rem",
              }}
            >
              {QUESTION_COUNTS.map((n) => (
                <button
                  key={n}
                  onClick={() => setQuestionCount(n)}
                  style={{
                    ...optionBtnStyle,
                    ...(questionCount === n ? selectedOptStyle : {}),
                    textAlign: "center",
                    justifyContent: "center",
                    fontSize: "1.05rem",
                    fontWeight: 700,
                  }}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Summary + Generate button */}
      {role && (
        <div
          style={{
            padding: "1.5rem 2rem",
            borderRadius: "1.25rem",
            background: "rgba(99,102,241,0.08)",
            border: "1px solid rgba(99,102,241,0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <div>
            <p style={{ color: "#94a3b8", fontSize: "0.85rem", marginBottom: "0.4rem" }}>
              Interview Summary
            </p>
            <p style={{ color: "#f8fafc", fontWeight: 600, fontSize: "1.05rem" }}>
              {role} · {difficulty} · {experience} · {questionCount} Questions
            </p>
          </div>
          <button onClick={handleGenerate} disabled={loading || user?.isBlocked} style={generateBtnStyle(loading || user?.isBlocked)}>
            {loading ? (
              <>
                <span style={spinnerStyle} />
                Generating…
              </>
            ) : (
              <>⚡ Generate Interview</>
            )}
          </button>
        </div>
      )}

      {!role && (
        <button
          disabled
          style={{ ...generateBtnStyle(false), opacity: 0.4, cursor: "not-allowed" }}
        >
          ⚡ Generate Interview
        </button>
      )}

      {/* ── Generating Loader (shows while AI generates questions) ── */}
      {loading && (
        <div style={{ animation: "fadeIn 0.3s ease" }}>
          <GeneratingLoader stage="generate" />
        </div>
      )}

      {error && (
        <p
          style={{
            color: "#f87171",
            padding: "0.75rem 1rem",
            background: "rgba(248,113,113,0.08)",
            borderRadius: "0.75rem",
            border: "1px solid rgba(248,113,113,0.2)",
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function roleIcon(role) {
  const map = {
    "MERN Developer": "🌿",
    "Frontend Developer": "🎨",
    "Backend Developer": "⚙️",
    "Java Developer": "☕",
    "Python Developer": "🐍",
    "Data Analyst": "📊",
    "AI Engineer": "🤖",
  };
  return map[role] || "💼";
}

function difficultyEmoji(d) {
  return d === "Easy" ? "🟢" : d === "Medium" ? "🟡" : "🔴";
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const cardStyle = {
  padding: "1.75rem",
  borderRadius: "1.5rem",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(148,163,184,0.12)",
};

const sectionHeaderStyle = { marginBottom: "1.25rem" };

const badgeStyle = {
  display: "inline-block",
  padding: "0.2rem 0.65rem",
  borderRadius: "999px",
  background: "rgba(99,102,241,0.18)",
  color: "#a5b4fc",
  fontSize: "0.75rem",
  fontWeight: 600,
  marginBottom: "0.5rem",
};

const sectionTitleStyle = {
  color: "#f8fafc",
  fontSize: "1.05rem",
  fontWeight: 600,
  margin: "0 0 0.25rem",
};

const sectionSubStyle = {
  color: "#94a3b8",
  fontSize: "0.88rem",
  margin: 0,
};

const optionBtnStyle = {
  padding: "0.85rem 1.1rem",
  borderRadius: "0.9rem",
  border: "1px solid rgba(148,163,184,0.15)",
  background: "rgba(148,163,184,0.04)",
  color: "#cbd5e1",
  cursor: "pointer",
  textAlign: "left",
  fontSize: "0.95rem",
  transition: "all 0.18s ease",
  display: "flex",
  alignItems: "center",
  gap: "0.6rem",
};

const selectedOptStyle = {
  border: "1px solid rgba(99,102,241,0.55)",
  background: "rgba(99,102,241,0.14)",
  color: "#e0e7ff",
  fontWeight: 600,
};

function generateBtnStyle(loading) {
  return {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.6rem",
    padding: "0.95rem 2.2rem",
    borderRadius: "1rem",
    border: "none",
    background: loading
      ? "rgba(99,102,241,0.5)"
      : "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
    color: "#fff",
    fontSize: "1rem",
    fontWeight: 700,
    cursor: loading ? "not-allowed" : "pointer",
    transition: "all 0.2s ease",
    boxShadow: loading ? "none" : "0 4px 20px rgba(99,102,241,0.35)",
  };
}

const spinnerStyle = {
  display: "inline-block",
  width: 16,
  height: 16,
  border: "2px solid rgba(255,255,255,0.3)",
  borderTopColor: "#fff",
  borderRadius: "50%",
  animation: "spin 0.7s linear infinite",
};
