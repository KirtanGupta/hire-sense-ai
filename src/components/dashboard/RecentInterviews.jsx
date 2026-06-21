"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import { SkeletonBlock } from "@/components/ui/LoadingStates";

const modeLabels = {
  voice: { icon: "🎤", color: "#f472b6" },
  mixed: { icon: "⚡", color: "#c084fc" },
  text: { icon: "📝", color: "#a5b4fc" },
};

export default function RecentInterviews() {
  const router = useRouter();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInterviews() {
      try {
        const res = await api.get("/api/interview/history");
        if (res.data.success) {
          setInterviews(res.data.interviews.slice(0, 4));
        }
      } catch (err) {
        console.error("Failed to load recent interviews", err);
      } finally {
        setLoading(false);
      }
    }
    fetchInterviews();
  }, []);

  const getStatusColor = (status) => {
    if (status === "in-progress") return "#facc15";
    if (status === "completed") return "#38bdf8";
    if (status === "evaluated") return "#22c55e";
    return "#94a3b8";
  };

  const getStatusLabel = (status) => {
    if (status === "in-progress") return "▶ Resume";
    if (status === "completed") return "↻ Evaluate";
    if (status === "evaluated") return "📊 Report";
    return status;
  };

  return (
    <div style={{ marginTop: "2rem", padding: "1.5rem", borderRadius: "1.25rem", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(148,163,184,0.12)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
        <h3 style={{ color: "#fff", margin: 0 }}>Recent Interviews</h3>
        <button onClick={() => router.push("/history")} style={{ background: "none", border: "none", color: "#6366f1", cursor: "pointer", fontSize: "0.9rem", fontWeight: 600 }}>
          View All →
        </button>
      </div>

      {loading ? (
        <div style={{ display: "grid", gap: "0.75rem" }}>
          {[...Array(3)].map((_, i) => (
            <div key={i} style={{ padding: "1rem 1.25rem", borderRadius: "1rem", background: "rgba(148,163,184,0.06)", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              <SkeletonBlock width="55%" height={14} delay={i * 0.1} />
              <SkeletonBlock width="35%" height={11} delay={i * 0.1 + 0.08} />
            </div>
          ))}
        </div>
      ) : interviews.length === 0 ? (
        <div style={{ textAlign: "center", padding: "2rem 1rem" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>🎙️</div>
          <p style={{ color: "#94a3b8", fontWeight: 500, margin: "0 0 0.5rem" }}>No Interviews Yet</p>
          <p style={{ color: "#64748b", fontSize: "0.85rem", margin: "0 0 1.25rem" }}>Start your first AI mock interview to see it here.</p>
          <button
            onClick={() => router.push("/interview")}
            style={{ padding: "0.7rem 1.5rem", borderRadius: "0.75rem", border: "none", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: "0.9rem" }}
          >
            🚀 Start Interview
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "0.75rem" }}>
          {interviews.map((item) => {
            const mode = modeLabels[item.interviewMode || "text"] || modeLabels.text;
            return (
              <div
                key={item._id}
                onClick={() => {
                  if (item.status === "in-progress") {
                    router.push(`/interview/session/${item._id}`);
                  } else {
                    router.push(`/interview/report/${item._id}`);
                  }
                }}
                style={{
                  padding: "1rem 1.25rem",
                  borderRadius: "1rem",
                  background: "rgba(148,163,184,0.06)",
                  cursor: "pointer",
                  transition: "background 0.2s, transform 0.15s",
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  alignItems: "center",
                  gap: "1rem",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(148,163,184,0.1)";
                  e.currentTarget.style.transform = "translateX(2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(148,163,184,0.06)";
                  e.currentTarget.style.transform = "translateX(0)";
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                    <h4 style={{ color: "#f8fafc", margin: 0, fontSize: "0.97rem" }}>{item.role}</h4>
                    {/* Mode icon */}
                    <span style={{ fontSize: "0.85rem" }} title={`${item.interviewMode || "text"} mode`}>
                      {mode.icon}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: "0.65rem", alignItems: "center" }}>
                    <p style={{ color: "#64748b", margin: 0, fontSize: "0.82rem" }}>
                      {new Date(item.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                    </p>
                    {item.overallScore != null && (
                      <span style={{ color: "#a5b4fc", fontSize: "0.82rem", fontWeight: 600 }}>
                        {item.overallScore}%
                      </span>
                    )}
                    {item.confidenceScore != null && (
                      <span style={{ color: "#fbbf24", fontSize: "0.82rem" }}>
                        🧠 {item.confidenceScore}%
                      </span>
                    )}
                  </div>
                </div>
                <span style={{
                  color: getStatusColor(item.status),
                  fontWeight: 600,
                  fontSize: "0.83rem",
                  background: "rgba(255,255,255,0.05)",
                  padding: "0.25rem 0.65rem",
                  borderRadius: "0.5rem",
                  whiteSpace: "nowrap",
                }}>
                  {getStatusLabel(item.status)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
