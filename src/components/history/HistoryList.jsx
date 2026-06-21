"use client";

/**
 * Phase 9 Polish:
 * - 9.1: Skeleton loading rows
 * - 9.3: Rich empty state
 * - 9.4: Toast on error
 * - 9.5: Responsive card layout on mobile
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import toast from "react-hot-toast";
import EmptyState from "@/components/ui/EmptyState";
import { SkeletonRow } from "@/components/ui/LoadingStates";

const statusColors = {
  evaluated:    { bg: "rgba(34,197,94,0.1)",  border: "rgba(34,197,94,0.3)",  text: "#4ade80", label: "Evaluated" },
  completed:    { bg: "rgba(56,189,248,0.1)", border: "rgba(56,189,248,0.3)", text: "#38bdf8", label: "Completed" },
  "in-progress":{ bg: "rgba(250,204,21,0.1)", border: "rgba(250,204,21,0.3)", text: "#facc15", label: "In Progress" },
};

const difficultyColors = {
  Easy:   "#4ade80",
  Medium: "#facc15",
  Hard:   "#f87171",
};

const modeConfig = {
  voice: { label: "🎤 Voice", color: "#f472b6", bg: "rgba(236,72,153,0.1)",  border: "rgba(236,72,153,0.25)" },
  mixed: { label: "⚡ Mixed", color: "#c084fc", bg: "rgba(139,92,246,0.1)",  border: "rgba(139,92,246,0.25)" },
  text:  { label: "📝 Text",  color: "#a5b4fc", bg: "rgba(99,102,241,0.08)", border: "rgba(99,102,241,0.2)" },
};

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function ScoreBadge({ value, color }) {
  if (value == null) return <span style={{ color: "#475569", fontSize: "0.85rem" }}>—</span>;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      padding: "0.25rem 0.6rem", borderRadius: "999px",
      background: `${color}15`, border: `1px solid ${color}35`,
      color, fontWeight: 700, fontSize: "0.85rem",
    }}>
      {value}%
    </span>
  );
}

// ─── Mobile card view (one session per card) ──────────────────────────────────
function SessionCard({ session, onClick }) {
  const sc = statusColors[session.status] || statusColors["in-progress"];
  const mode = modeConfig[session.interviewMode || "text"] || modeConfig.text;

  return (
    <div
      onClick={onClick}
      style={{
        padding: "1.25rem",
        borderRadius: "1.25rem",
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(148,163,184,0.1)",
        cursor: "pointer",
        transition: "all 0.2s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "rgba(255,255,255,0.07)";
        e.currentTarget.style.borderColor = "rgba(99,102,241,0.3)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "rgba(255,255,255,0.04)";
        e.currentTarget.style.borderColor = "rgba(148,163,184,0.1)";
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem", flexWrap: "wrap", gap: "0.5rem" }}>
        <div>
          <p style={{ color: "#f8fafc", fontWeight: 700, margin: "0 0 0.2rem", fontSize: "1rem" }}>{session.role}</p>
          <p style={{ color: "#64748b", margin: 0, fontSize: "0.8rem" }}>{session.experience} · {formatDate(session.createdAt)}</p>
        </div>
        <span style={{
          padding: "0.3rem 0.85rem", borderRadius: "999px",
          background: sc.bg, border: `1px solid ${sc.border}`,
          color: sc.text, fontSize: "0.78rem", fontWeight: 600, whiteSpace: "nowrap",
        }}>
          {session.status === "in-progress" ? "▶ Resume" : session.status === "completed" ? "↻ Evaluate" : "📊 Report"}
        </span>
      </div>

      <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ color: difficultyColors[session.difficulty] || "#94a3b8", fontWeight: 600, fontSize: "0.85rem" }}>
          {session.difficulty}
        </span>
        <span style={{ color: "#475569" }}>·</span>
        <span style={{
          display: "inline-flex", alignItems: "center",
          padding: "0.2rem 0.6rem", borderRadius: "999px",
          background: mode.bg, border: `1px solid ${mode.border}`,
          color: mode.color, fontSize: "0.75rem", fontWeight: 600,
        }}>{mode.label}</span>
        {session.overallScore != null && (
          <>
            <span style={{ color: "#475569" }}>·</span>
            <ScoreBadge value={session.overallScore} color="#6366f1" />
          </>
        )}
        {session.confidenceScore != null && (
          <ScoreBadge value={session.confidenceScore} color="#f59e0b" />
        )}
      </div>
    </div>
  );
}

export default function HistoryList() {
  const router = useRouter();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get("/api/interview/history");
        if (res.data.success) {
          setSessions(res.data.interviews || []);
        } else {
          toast.error(res.data.message || "Unable to load history.");
        }
      } catch {
        toast.error("Unable to load interview history.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // ── Skeleton loading ──
  if (loading) {
    return (
      <div style={{ display: "grid", gap: "0.75rem" }}>
        {[...Array(5)].map((_, i) => <SkeletonRow key={i} />)}
      </div>
    );
  }

  // ── Empty state ──
  if (sessions.length === 0) {
    return (
      <EmptyState
        icon="🎙️"
        title="No Interviews Yet"
        description="You haven't taken any AI-powered mock interviews yet. Start your first session to track your progress and get personalized feedback."
        actionLabel="Start Your First Interview"
        actionHref="/interview"
        secondaryLabel="Upload Resume First"
        secondaryHref="/resume"
      />
    );
  }

  // ── Desktop table grid columns ──
  const gridCols = "1fr 90px 110px 90px 100px 100px auto";

  return (
    <div>
      {/* ── Desktop Table Layout ── */}
      <div className="history-desktop">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: gridCols,
            gap: "1rem",
            padding: "0.75rem 1.5rem",
            color: "#64748b",
            fontSize: "0.79rem",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          <span>Role</span>
          <span>Difficulty</span>
          <span>Date</span>
          <span>Overall</span>
          <span>Confidence</span>
          <span>Mode</span>
          <span>Status</span>
        </div>

        <div style={{ display: "grid", gap: "0.75rem" }}>
          {sessions.map((session) => {
            const sc = statusColors[session.status] || statusColors["in-progress"];
            const mode = modeConfig[session.interviewMode || "text"] || modeConfig.text;
            return (
              <div
                key={session._id}
                style={{
                  display: "grid",
                  gridTemplateColumns: gridCols,
                  gap: "1rem",
                  padding: "1.1rem 1.5rem",
                  borderRadius: "1.25rem",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(148,163,184,0.1)",
                  alignItems: "center",
                  transition: "border-color 0.2s ease, background 0.2s ease",
                  cursor: "pointer",
                }}
                onClick={() => {
                  if (session.status === "in-progress") {
                    router.push(`/interview/session/${session._id}`);
                  } else {
                    router.push(`/interview/report/${session._id}`);
                  }
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                  e.currentTarget.style.borderColor = "rgba(148,163,184,0.22)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                  e.currentTarget.style.borderColor = "rgba(148,163,184,0.1)";
                }}
              >
                <div>
                  <p style={{ color: "#f8fafc", fontWeight: 600, margin: 0, fontSize: "0.95rem" }}>{session.role}</p>
                  <p style={{ color: "#64748b", margin: "0.2rem 0 0", fontSize: "0.8rem" }}>{session.experience}</p>
                </div>
                <span style={{ color: difficultyColors[session.difficulty] || "#94a3b8", fontWeight: 600, fontSize: "0.88rem" }}>
                  {session.difficulty}
                </span>
                <span style={{ color: "#94a3b8", fontSize: "0.88rem" }}>
                  {formatDate(session.createdAt)}
                </span>
                <ScoreBadge value={session.overallScore} color="#6366f1" />
                <ScoreBadge value={session.confidenceScore} color="#f59e0b" />
                <span style={{
                  display: "inline-flex", alignItems: "center",
                  padding: "0.28rem 0.7rem", borderRadius: "999px",
                  background: mode.bg, border: `1px solid ${mode.border}`,
                  color: mode.color, fontSize: "0.78rem", fontWeight: 600, whiteSpace: "nowrap",
                }}>
                  {mode.label}
                </span>
                <span style={{
                  padding: "0.3rem 0.85rem", borderRadius: "999px",
                  background: sc.bg, border: `1px solid ${sc.border}`,
                  color: sc.text, fontSize: "0.8rem", fontWeight: 600, whiteSpace: "nowrap",
                }}>
                  {session.status === "in-progress" ? "▶ Resume" : session.status === "completed" ? "↻ Evaluate" : "📊 Report"}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Mobile Card Layout ── */}
      <div className="history-mobile" style={{ display: "none", gap: "0.75rem", flexDirection: "column" }}>
        {sessions.map((session) => (
          <SessionCard
            key={session._id}
            session={session}
            onClick={() => {
              if (session.status === "in-progress") {
                router.push(`/interview/session/${session._id}`);
              } else {
                router.push(`/interview/report/${session._id}`);
              }
            }}
          />
        ))}
      </div>

      <div style={{ marginTop: "1.25rem", textAlign: "right" }}>
        <button onClick={() => router.push("/interview")} style={primaryBtnStyle}>
          + New Interview
        </button>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .history-desktop { display: none !important; }
          .history-mobile  { display: flex !important; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

const primaryBtnStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "0.5rem",
  padding: "0.8rem 1.6rem",
  borderRadius: "0.9rem",
  border: "none",
  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
  color: "#fff",
  fontSize: "0.95rem",
  fontWeight: 700,
  cursor: "pointer",
  boxShadow: "0 4px 16px rgba(99,102,241,0.3)",
};
