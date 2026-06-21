"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts";

// ─── Circular Score SVG ───────────────────────────────────────────────────────
function CircularScore({ score, size = 150, label, color }) {
  const safeScore = score ?? 0;
  const radius = (size - 18) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (safeScore / 100) * circumference;
  const strokeColor = color ||
    (safeScore >= 80 ? "#22c55e" : safeScore >= 60 ? "#f59e0b" : safeScore >= 40 ? "#f97316" : "#ef4444");

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          <defs>
            <linearGradient id={`grad-${label}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={strokeColor} stopOpacity="1" />
              <stop offset="100%" stopColor={strokeColor} stopOpacity="0.6" />
            </linearGradient>
          </defs>
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke="rgba(148,163,184,0.12)" strokeWidth={12}
          />
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none"
            stroke={`url(#grad-${label})`}
            strokeWidth={12}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1.2s ease" }}
          />
        </svg>
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
        }}>
          <span style={{ fontSize: size / 4.2, fontWeight: 800, color: "#f8fafc", lineHeight: 1 }}>
            {safeScore}%
          </span>
          <span style={{ fontSize: size / 12, color: "#94a3b8", marginTop: "0.2rem" }}>
            {scoreLabel(safeScore)}
          </span>
        </div>
      </div>
      {label && (
        <p style={{ color: "#cbd5e1", fontSize: "0.88rem", fontWeight: 600, textAlign: "center", margin: 0 }}>
          {label}
        </p>
      )}
    </div>
  );
}

function scoreLabel(score) {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Good";
  if (score >= 55) return "Average";
  if (score >= 40) return "Below Avg";
  return "Poor";
}

function barColor(score) {
  if (score >= 80) return "#22c55e";
  if (score >= 65) return "#6366f1";
  if (score >= 50) return "#f59e0b";
  return "#ef4444";
}

// ─── Custom Tooltip for recharts ─────────────────────────────────────────────
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      padding: "0.65rem 1rem", borderRadius: "0.75rem",
      background: "#0f172a", border: "1px solid rgba(99,102,241,0.3)",
      color: "#f8fafc", fontSize: "0.88rem",
    }}>
      <p style={{ margin: 0, fontWeight: 600 }}>{label}</p>
      <p style={{ margin: "0.2rem 0 0", color: "#a5b4fc" }}>{payload[0].value}%</p>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function InterviewReport({ sessionId }) {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | evaluating | ready | error | not-completed
  const [fakeProgress, setFakeProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [pdfLoading, setPdfLoading] = useState(false);
  const [expandedQ, setExpandedQ] = useState(null);

  // ── Load or trigger evaluation ────────────────────────────────────────────
  const triggerEvaluation = useCallback(async (sess) => {
    setStatus("evaluating");
    setFakeProgress(0);

    // Animate fake progress while waiting
    const totalQ = sess?.totalQuestions || 5;
    const estimatedMs = totalQ * 3000; // ~3s per question
    const interval = setInterval(() => {
      setFakeProgress((p) => Math.min(p + (100 / (estimatedMs / 400)), 88));
    }, 400);

    try {
      const res = await fetch("/api/interview/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ sessionId }),
      });
      const data = await res.json();
      clearInterval(interval);
      setFakeProgress(100);

      if (data.success) {
        setTimeout(() => {
          setSession(data.session);
          setStatus("ready");
        }, 400);
      } else {
        setErrorMsg(data.message || "Evaluation failed.");
        setStatus("error");
      }
    } catch {
      clearInterval(interval);
      setErrorMsg("Evaluation request failed. Please try again.");
      setStatus("error");
    }
  }, [sessionId]);

  useEffect(() => {
    async function init() {
      try {
        const res = await fetch(`/api/interview/report?sessionId=${sessionId}`, {
          credentials: "include",
        });
        const data = await res.json();
        if (!data.success) {
          setErrorMsg(data.message || "Session not found.");
          setStatus("error");
          return;
        }
        const s = data.session;
        if (s.status === "evaluated") {
          setSession(s);
          setStatus("ready");
        } else if (s.status === "completed") {
          // Auto-trigger evaluation
          await triggerEvaluation(s);
        } else {
          setStatus("not-completed");
        }
      } catch {
        setErrorMsg("Failed to load session.");
        setStatus("error");
      }
    }
    init();
  }, [sessionId, triggerEvaluation]);

  // ── PDF Download ──────────────────────────────────────────────────────────
  async function handleDownloadPDF() {
    setPdfLoading(true);
    try {
      const { generatePDFReport } = await import("@/services/reportService");
      await generatePDFReport(session);
    } catch (e) {
      console.error("PDF error:", e);
      alert("PDF generation failed. Please try again.");
    } finally {
      setPdfLoading(false);
    }
  }

  // ─── RENDER STATES ─────────────────────────────────────────────────────────

  if (status === "loading") {
    return (
      <div style={centerStyle}>
        <div style={bigSpinnerStyle} />
        <p style={{ color: "#94a3b8", marginTop: "1rem" }}>Loading report…</p>
      </div>
    );
  }

  if (status === "evaluating") {
    const totalQ = session?.totalQuestions || 5;
    return (
      <div style={{ maxWidth: 560, margin: "0 auto", textAlign: "center" }}>
        <div style={{ fontSize: "3.5rem", marginBottom: "1.25rem" }}>🤖</div>
        <h2 style={{ color: "#f8fafc", fontSize: "1.75rem", marginBottom: "0.75rem" }}>
          AI Evaluation in Progress
        </h2>
        <p style={{ color: "#94a3b8", marginBottom: "2rem", lineHeight: 1.7 }}>
          Analyzing {totalQ} questions with Groq AI. Evaluating technical accuracy, completeness,
          communication, and running NLP confidence analysis…
        </p>
        {/* Progress bar */}
        <div style={{ marginBottom: "0.75rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ color: "#94a3b8", fontSize: "0.85rem" }}>Processing…</span>
          <span style={{ color: "#a5b4fc", fontWeight: 700, fontSize: "0.9rem" }}>
            {Math.round(fakeProgress)}%
          </span>
        </div>
        <div style={{ height: 8, borderRadius: 999, background: "rgba(148,163,184,0.12)", overflow: "hidden" }}>
          <div style={{
            height: "100%", borderRadius: 999,
            width: `${fakeProgress}%`,
            background: "linear-gradient(90deg, #6366f1, #8b5cf6, #06b6d4)",
            transition: "width 0.5s ease",
          }} />
        </div>
        <p style={{ color: "#64748b", fontSize: "0.82rem", marginTop: "1rem" }}>
          This may take 30–90 seconds depending on number of questions.
        </p>
      </div>
    );
  }

  if (status === "not-completed") {
    return (
      <div style={centerStyle}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⚠️</div>
        <p style={{ color: "#fbbf24", fontSize: "1.1rem", marginBottom: "1rem" }}>
          Complete the interview first before viewing the report.
        </p>
        <button onClick={() => router.push(`/interview/session/${sessionId}`)} style={primaryBtnStyle}>
          Resume Interview
        </button>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div style={centerStyle}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>❌</div>
        <p style={{ color: "#f87171", fontSize: "1.1rem", marginBottom: "1.5rem" }}>{errorMsg}</p>
        <div style={{ display: "flex", gap: "1rem" }}>
          <button onClick={() => router.push("/history")} style={secondaryBtnStyle}>← History</button>
          <button onClick={() => window.location.reload()} style={primaryBtnStyle}>Retry</button>
        </div>
      </div>
    );
  }

  if (!session) return null;

  // ─── FULL REPORT ──────────────────────────────────────────────────────────
  const chartData = (session.questions || []).map((q, i) => ({
    name: `Q${i + 1}`,
    score: q.evaluation?.score ?? 0,
  }));

  const skillData = [
    { skill: "Technical", score: session.technicalScore ?? 0 },
    { skill: "Communication", score: session.communicationScore ?? 0 },
    { skill: "Confidence", score: session.confidenceScore ?? 0 },
  ];

  const date = new Date(session.createdAt).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });

  return (
    <div style={{ maxWidth: 920, margin: "0 auto", display: "grid", gap: "1.75rem" }}>

      {/* ── Header Card ── */}
      <div style={{
        padding: "1.75rem 2rem",
        borderRadius: "1.5rem",
        background: "rgba(99,102,241,0.07)",
        border: "1px solid rgba(99,102,241,0.2)",
        display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem",
      }}>
        <div>
          <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>
            {[session.role, session.difficulty, session.experience, date].map((t) => (
              <span key={t} style={tagStyle}>{t}</span>
            ))}
            <span style={{ ...tagStyle, background: "rgba(34,197,94,0.1)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.25)" }}>
              ✓ Evaluated
            </span>
          </div>
          <h2 style={{ color: "#f8fafc", fontSize: "1.4rem", fontWeight: 700, margin: 0 }}>
            Interview Performance Report
          </h2>
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button
            onClick={handleDownloadPDF}
            disabled={pdfLoading}
            style={{ ...secondaryBtnStyle, gap: "0.5rem" }}
          >
            {pdfLoading ? <><span style={smallSpinnerStyle} /> Generating…</> : "📄 Download PDF"}
          </button>
          <button onClick={() => router.push("/interview")} style={primaryBtnStyle}>
            + New Interview
          </button>
        </div>
      </div>

      {/* ── Score Overview (3 circles) ── */}
      <div style={cardStyle}>
        <h3 style={sectionTitle}>Overall Scores</h3>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "2rem", placeItems: "center", padding: "1rem 0",
        }}>
          <CircularScore score={session.overallScore} size={170} label="Overall Score" color="#6366f1" />
          <CircularScore score={session.technicalScore} size={150} label="Technical Score" color="#06b6d4" />
          <CircularScore score={session.communicationScore} size={150} label="Communication" color="#8b5cf6" />
          <CircularScore score={session.confidenceScore} size={150} label="Confidence (NLP)" color="#f59e0b" />
        </div>
      </div>

      {/* ── Question Performance Chart ── */}
      <div style={cardStyle}>
        <h3 style={sectionTitle}>Question Performance</h3>
        <p style={{ color: "#64748b", fontSize: "0.85rem", marginBottom: "1.25rem" }}>
          Score per question (0–100%)
        </p>
        <div style={{ width: "100%", height: 220 }}>
          <ResponsiveContainer>
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={barColor(entry.score)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Skill Breakdown ── */}
      <div style={cardStyle}>
        <h3 style={sectionTitle}>Skill Analysis</h3>
        <div style={{ display: "grid", gap: "1rem" }}>
          {skillData.map(({ skill, score }) => (
            <div key={skill}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.35rem" }}>
                <span style={{ color: "#cbd5e1", fontSize: "0.92rem", fontWeight: 500 }}>{skill}</span>
                <span style={{ color: "#a5b4fc", fontWeight: 700, fontSize: "0.92rem" }}>{score}%</span>
              </div>
              <div style={{ height: 8, borderRadius: 999, background: "rgba(148,163,184,0.12)" }}>
                <div style={{
                  height: "100%", borderRadius: 999,
                  width: `${score}%`,
                  background: barColor(score),
                  transition: "width 1s ease",
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Strengths & Weaknesses ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        <div style={cardStyle}>
          <h3 style={{ ...sectionTitle, color: "#4ade80" }}>✓ Strengths</h3>
          <div style={{ display: "grid", gap: "0.65rem" }}>
            {(session.strengths || []).length === 0 ? (
              <p style={{ color: "#64748b", fontSize: "0.9rem" }}>No strengths identified.</p>
            ) : (
              (session.strengths || []).map((s, i) => (
                <div key={i} style={{
                  display: "flex", gap: "0.65rem", alignItems: "flex-start",
                  padding: "0.75rem 1rem", borderRadius: "0.9rem",
                  background: "rgba(34,197,94,0.07)", border: "1px solid rgba(34,197,94,0.18)",
                }}>
                  <span style={{ color: "#4ade80", flexShrink: 0, marginTop: "0.1rem" }}>✓</span>
                  <p style={{ color: "#d1fae5", fontSize: "0.9rem", margin: 0, lineHeight: 1.55 }}>{s}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <div style={cardStyle}>
          <h3 style={{ ...sectionTitle, color: "#f87171" }}>✗ Areas to Improve</h3>
          <div style={{ display: "grid", gap: "0.65rem" }}>
            {(session.weaknesses || []).length === 0 ? (
              <p style={{ color: "#64748b", fontSize: "0.9rem" }}>No weaknesses identified.</p>
            ) : (
              (session.weaknesses || []).map((w, i) => (
                <div key={i} style={{
                  display: "flex", gap: "0.65rem", alignItems: "flex-start",
                  padding: "0.75rem 1rem", borderRadius: "0.9rem",
                  background: "rgba(248,113,113,0.07)", border: "1px solid rgba(248,113,113,0.18)",
                }}>
                  <span style={{ color: "#f87171", flexShrink: 0, marginTop: "0.1rem" }}>✗</span>
                  <p style={{ color: "#fee2e2", fontSize: "0.9rem", margin: 0, lineHeight: 1.55 }}>{w}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── Confidence NLP Analysis ── */}
      <div style={{
        ...cardStyle,
        background: "rgba(245,158,11,0.07)",
        border: "1px solid rgba(245,158,11,0.2)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
          <span style={{ fontSize: "2rem" }}>🧠</span>
          <div style={{ flex: 1 }}>
            <h3 style={{ color: "#f8fafc", fontSize: "1rem", fontWeight: 700, margin: "0 0 0.3rem" }}>
              Confidence Score — NLP Analysis
            </h3>
            <p style={{ color: "#94a3b8", fontSize: "0.85rem", margin: 0 }}>
              Analyzed filler words (um, uh, basically, actually, like, you know…) in your answers.
              Fewer fillers = higher confidence score.
            </p>
          </div>
          <div style={{
            padding: "0.65rem 1.5rem", borderRadius: "999px",
            background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.35)",
            color: "#fbbf24", fontWeight: 800, fontSize: "1.2rem",
          }}>
            {session.confidenceScore ?? 0}%
          </div>
        </div>
      </div>

      {/* ── Recommendation ── */}
      <div style={{
        ...cardStyle,
        background: "rgba(99,102,241,0.07)",
        border: "1px solid rgba(99,102,241,0.25)",
      }}>
        <h3 style={sectionTitle}>🎯 Recommendation</h3>
        <p style={{ color: "#cbd5e1", fontSize: "1rem", lineHeight: 1.75, margin: 0 }}>
          {session.recommendation || "No recommendation available."}
        </p>
      </div>

      {/* ── Question-by-Question ── */}
      <div style={cardStyle}>
        <h3 style={sectionTitle}>Question-by-Question Breakdown</h3>
        <div style={{ display: "grid", gap: "0.85rem" }}>
          {(session.questions || []).map((q, i) => {
            const ev = q.evaluation;
            const isOpen = expandedQ === i;
            const qScore = ev?.score ?? 0;
            return (
              <div key={i} style={{
                borderRadius: "1.1rem",
                border: `1px solid ${isOpen ? "rgba(99,102,241,0.35)" : "rgba(148,163,184,0.12)"}`,
                background: isOpen ? "rgba(99,102,241,0.06)" : "rgba(255,255,255,0.025)",
                overflow: "hidden",
                transition: "all 0.2s ease",
              }}>
                {/* Question header row */}
                <button
                  onClick={() => setExpandedQ(isOpen ? null : i)}
                  style={{
                    width: "100%", padding: "1.1rem 1.4rem",
                    display: "flex", alignItems: "center", gap: "1rem",
                    background: "transparent", border: "none", cursor: "pointer", textAlign: "left",
                  }}
                >
                  <span style={{
                    flexShrink: 0, width: 30, height: 30, borderRadius: "50%",
                    background: "rgba(99,102,241,0.15)", color: "#a5b4fc",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "0.82rem", fontWeight: 700,
                  }}>
                    {i + 1}
                  </span>
                  <p style={{ flex: 1, color: "#f1f5f9", fontSize: "0.95rem", margin: 0, lineHeight: 1.5 }}>
                    {q.question}
                  </p>
                  <span style={{
                    flexShrink: 0, padding: "0.25rem 0.75rem", borderRadius: "999px",
                    background: `${barColor(qScore)}22`,
                    border: `1px solid ${barColor(qScore)}55`,
                    color: barColor(qScore), fontWeight: 700, fontSize: "0.85rem",
                  }}>
                    {qScore}%
                  </span>
                  <span style={{ color: "#64748b", fontSize: "0.85rem" }}>{isOpen ? "▲" : "▼"}</span>
                </button>

                {/* Expanded details */}
                {isOpen && (
                  <div style={{ padding: "0 1.4rem 1.4rem", borderTop: "1px solid rgba(148,163,184,0.1)" }}>
                    <div style={{ paddingTop: "1rem", display: "grid", gap: "1rem" }}>
                      {/* Score breakdown */}
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.65rem" }}>
                        {[
                          { label: "Technical", val: ev?.technicalScore ?? 0 },
                          { label: "Completeness", val: ev?.completeness ?? 0 },
                          { label: "Communication", val: ev?.communication ?? 0 },
                        ].map(({ label, val }) => (
                          <div key={label} style={{
                            padding: "0.65rem", borderRadius: "0.75rem",
                            background: "rgba(148,163,184,0.06)", textAlign: "center",
                          }}>
                            <p style={{ color: "#64748b", fontSize: "0.75rem", margin: "0 0 0.25rem" }}>{label}</p>
                            <p style={{ color: "#f8fafc", fontWeight: 700, fontSize: "1.05rem", margin: 0 }}>
                              {val}/10
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Your answer */}
                      {q.answer?.trim() && (
                        <div>
                          <p style={{ color: "#64748b", fontSize: "0.8rem", marginBottom: "0.4rem" }}>Your Answer</p>
                          <p style={{
                            color: "#94a3b8", fontSize: "0.88rem", lineHeight: 1.65,
                            padding: "0.75rem 1rem", borderRadius: "0.75rem",
                            background: "rgba(148,163,184,0.06)", margin: 0,
                          }}>
                            {q.answer}
                          </p>
                        </div>
                      )}
                      {!q.answer?.trim() && (
                        <p style={{
                          color: "#f87171", fontSize: "0.85rem",
                          padding: "0.65rem 1rem", borderRadius: "0.75rem",
                          background: "rgba(248,113,113,0.08)", margin: 0,
                        }}>
                          ✗ No answer provided
                        </p>
                      )}

                      {/* Feedback */}
                      {ev?.feedback && (
                        <div style={{
                          padding: "0.75rem 1rem", borderRadius: "0.75rem",
                          background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.18)",
                        }}>
                          <p style={{ color: "#64748b", fontSize: "0.75rem", marginBottom: "0.3rem" }}>AI Feedback</p>
                          <p style={{ color: "#c7d2fe", fontSize: "0.9rem", lineHeight: 1.6, margin: 0 }}>
                            {ev.feedback}
                          </p>
                        </div>
                      )}

                      {/* Strengths & Weaknesses */}
                      {(ev?.strengths?.length > 0 || ev?.weaknesses?.length > 0) && (
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.65rem" }}>
                          <div>
                            {ev.strengths?.map((s, j) => (
                              <p key={j} style={{ color: "#4ade80", fontSize: "0.83rem", margin: "0 0 0.3rem", display: "flex", gap: "0.4rem" }}>
                                <span>✓</span>{s}
                              </p>
                            ))}
                          </div>
                          <div>
                            {ev.weaknesses?.map((w, j) => (
                              <p key={j} style={{ color: "#f87171", fontSize: "0.83rem", margin: "0 0 0.3rem", display: "flex", gap: "0.4rem" }}>
                                <span>✗</span>{w}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Bottom actions ── */}
      <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap", paddingBottom: "2rem" }}>
        <button onClick={handleDownloadPDF} disabled={pdfLoading} style={primaryBtnStyle}>
          {pdfLoading ? <><span style={smallSpinnerStyle} /> Generating PDF…</> : "📄 Download PDF Report"}
        </button>
        <button onClick={() => router.push("/history")} style={secondaryBtnStyle}>View History</button>
        <button onClick={() => router.push("/interview")} style={secondaryBtnStyle}>New Interview</button>
      </div>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const cardStyle = {
  padding: "1.75rem",
  borderRadius: "1.5rem",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(148,163,184,0.12)",
};

const sectionTitle = {
  color: "#f8fafc",
  fontSize: "1.05rem",
  fontWeight: 700,
  marginBottom: "1.25rem",
};

const tagStyle = {
  padding: "0.28rem 0.8rem",
  borderRadius: "999px",
  background: "rgba(148,163,184,0.08)",
  border: "1px solid rgba(148,163,184,0.18)",
  color: "#94a3b8",
  fontSize: "0.82rem",
  fontWeight: 500,
};

const centerStyle = {
  display: "flex", flexDirection: "column",
  alignItems: "center", justifyContent: "center",
  minHeight: 400, gap: "1rem", textAlign: "center",
};

const primaryBtnStyle = {
  display: "inline-flex", alignItems: "center", gap: "0.5rem",
  padding: "0.85rem 1.75rem", borderRadius: "0.9rem", border: "none",
  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
  color: "#fff", fontSize: "0.97rem", fontWeight: 700, cursor: "pointer",
  boxShadow: "0 4px 16px rgba(99,102,241,0.3)",
};

const secondaryBtnStyle = {
  display: "inline-flex", alignItems: "center", gap: "0.5rem",
  padding: "0.85rem 1.5rem", borderRadius: "0.9rem",
  border: "1px solid rgba(148,163,184,0.2)",
  background: "rgba(148,163,184,0.06)",
  color: "#cbd5e1", fontSize: "0.97rem", fontWeight: 600, cursor: "pointer",
};

const bigSpinnerStyle = {
  width: 48, height: 48,
  border: "3px solid rgba(99,102,241,0.2)",
  borderTopColor: "#6366f1", borderRadius: "50%",
  animation: "spin 0.8s linear infinite",
};

const smallSpinnerStyle = {
  display: "inline-block", width: 14, height: 14,
  border: "2px solid rgba(255,255,255,0.3)",
  borderTopColor: "#fff", borderRadius: "50%",
  animation: "spin 0.7s linear infinite",
};
