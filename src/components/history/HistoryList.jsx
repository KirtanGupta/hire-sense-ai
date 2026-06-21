"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";

const statusColors = {
  evaluated: { bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.3)", text: "#4ade80", label: "Evaluated" },
  completed: { bg: "rgba(56,189,248,0.1)", border: "rgba(56,189,248,0.3)", text: "#38bdf8", label: "Completed" },
  "in-progress": { bg: "rgba(250,204,21,0.1)", border: "rgba(250,204,21,0.3)", text: "#facc15", label: "In Progress" },
};

const difficultyColors = {
  Easy: "#4ade80",
  Medium: "#facc15",
  Hard: "#f87171",
};

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function HistoryList() {
  const router = useRouter();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get("/api/interview/history");
        if (res.data.success) {
          setSessions(res.data.interviews || []);
        } else {
          setError(res.data.message || "Unable to load history.");
        }
      } catch {
        setError("Unable to load history.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "3rem", gap: "1rem" }}>
        <div style={spinnerStyle} />
        <p style={{ color: "#94a3b8" }}>Loading interview history…</p>
      </div>
    );
  }

  if (error) {
    return <p style={{ color: "#f87171", padding: "1rem" }}>{error}</p>;
  }

  if (sessions.length === 0) {
    return (
      <div
        style={{
          padding: "3rem",
          borderRadius: "1.5rem",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(148,163,184,0.12)",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📋</div>
        <h3 style={{ color: "#f8fafc", marginBottom: "0.5rem" }}>No Interviews Yet</h3>
        <p style={{ color: "#94a3b8", marginBottom: "1.5rem" }}>
          Start your first AI-powered mock interview to track your progress here.
        </p>
        <button
          onClick={() => router.push("/interview")}
          style={primaryBtnStyle}
        >
          Start Interview
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: "1.25rem" }}>
      {/* Header row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 90px 110px 110px 80px auto",
          gap: "1rem",
          padding: "0.75rem 1.5rem",
          color: "#64748b",
          fontSize: "0.82rem",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
        }}
      >
        <span>Role</span>
        <span>Difficulty</span>
        <span>Experience</span>
        <span>Date</span>
        <span>Questions</span>
        <span>Status</span>
      </div>

      {sessions.map((session) => {
        const sc = statusColors[session.status] || statusColors["in-progress"];
        return (
          <div
            key={session._id}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 90px 110px 110px 80px auto",
              gap: "1rem",
              padding: "1.25rem 1.5rem",
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
              e.currentTarget.style.borderColor = "rgba(148,163,184,0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.04)";
              e.currentTarget.style.borderColor = "rgba(148,163,184,0.1)";
            }}
          >
            {/* Role */}
            <div>
              <p style={{ color: "#f8fafc", fontWeight: 600, margin: 0 }}>{session.role}</p>
            </div>

            {/* Difficulty */}
            <span style={{ color: difficultyColors[session.difficulty] || "#94a3b8", fontWeight: 600, fontSize: "0.9rem" }}>
              {session.difficulty}
            </span>

            {/* Experience */}
            <span style={{ color: "#94a3b8", fontSize: "0.9rem" }}>{session.experience}</span>

            {/* Date */}
            <span style={{ color: "#94a3b8", fontSize: "0.9rem" }}>
              {formatDate(session.createdAt)}
            </span>

            {/* Questions */}
            <span style={{ color: "#94a3b8", fontSize: "0.9rem" }}>{session.totalQuestions}</span>

            {/* Status badge */}
            <span
              style={{
                padding: "0.3rem 0.85rem",
                borderRadius: "999px",
                background: sc.bg,
                border: `1px solid ${sc.border}`,
                color: sc.text,
                fontSize: "0.8rem",
                fontWeight: 600,
                whiteSpace: "nowrap",
              }}
            >
              {session.status === "in-progress" ? "▶ Resume" : session.status === "completed" ? "↻ Evaluate" : "📊 Report"}
            </span>
          </div>
        );
      })}

      <div style={{ marginTop: "0.5rem", textAlign: "right" }}>
        <button onClick={() => router.push("/interview")} style={primaryBtnStyle}>
          + New Interview
        </button>
      </div>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

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

const spinnerStyle = {
  width: 36,
  height: 36,
  border: "3px solid rgba(99,102,241,0.2)",
  borderTopColor: "#6366f1",
  borderRadius: "50%",
  animation: "spin 0.8s linear infinite",
};
