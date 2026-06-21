"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";
import useAuthStore from "@/store/authStore";
import DashboardShell from "@/components/dashboard/DashboardShell";
import RecentInterviews from "@/components/dashboard/RecentInterviews";

// ─── Stat Card Component ──────────────────────────────────────────────────────
function StatCard({ title, value, description, accent, icon, loading }) {
  return (
    <div
      style={{
        padding: "1.5rem",
        borderRadius: "1.25rem",
        background: "rgba(255,255,255,0.04)",
        border: `1px solid ${accent ? `${accent}25` : "rgba(148,163,184,0.12)"}`,
        minWidth: 190,
        transition: "border-color 0.2s ease, transform 0.2s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.borderColor = accent ? `${accent}45` : "rgba(148,163,184,0.25)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.borderColor = accent ? `${accent}25` : "rgba(148,163,184,0.12)";
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
        {icon && <span style={{ fontSize: "1.1rem" }}>{icon}</span>}
        <p style={{ color: "#94a3b8", fontSize: "0.88rem", fontWeight: 500, margin: 0 }}>{title}</p>
      </div>
      {loading ? (
        <div style={{
          width: "60%", height: "1.75rem", borderRadius: "0.5rem",
          background: "rgba(148,163,184,0.08)", animation: "pulse 1.5s ease-in-out infinite",
        }} />
      ) : (
        <h2 style={{ color: accent || "#fff", fontSize: "1.75rem", margin: 0, fontWeight: 800 }}>
          {value}
        </h2>
      )}
      <p style={{ color: "#64748b", marginTop: "0.5rem", fontSize: "0.83rem", margin: "0.5rem 0 0" }}>
        {description}
      </p>
    </div>
  );
}

// ─── Dashboard Page ───────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await api.get("/api/interview/history");
        if (res.data.success) {
          const interviews = res.data.interviews || [];
          const evaluated = interviews.filter((i) => i.status === "evaluated");
          const voiceInterviews = interviews.filter(
            (i) => i.interviewMode === "voice" || i.interviewMode === "mixed"
          );

          const avgTechnical = evaluated.length > 0
            ? Math.round(evaluated.reduce((s, i) => s + (i.technicalScore || 0), 0) / evaluated.length)
            : 0;
          const avgConfidence = evaluated.length > 0
            ? Math.round(evaluated.reduce((s, i) => s + (i.confidenceScore || 0), 0) / evaluated.length)
            : 0;
          const avgOverall = evaluated.length > 0
            ? Math.round(evaluated.reduce((s, i) => s + (i.overallScore || 0), 0) / evaluated.length)
            : 0;
          const avgVoice = voiceInterviews.filter((i) => i.voiceScore).length > 0
            ? Math.round(
                voiceInterviews
                  .filter((i) => i.voiceScore)
                  .reduce((s, i) => s + (i.voiceScore || 0), 0) /
                  voiceInterviews.filter((i) => i.voiceScore).length
              )
            : null;

          setStats({
            total: interviews.length,
            evaluated: evaluated.length,
            voiceCount: voiceInterviews.length,
            avgTechnical,
            avgConfidence,
            avgOverall,
            avgVoice,
          });
        }
      } catch {
        // Silent fail — stats are secondary
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  return (
    <DashboardShell title="Dashboard" subtitle="Your activity and interview progress at a glance.">
      {/* ── Block Warning Banner ── */}
      {user?.isBlocked && (
        <div style={{
          backgroundColor: "rgba(239,68,68,0.1)",
          border: "1px solid rgba(239,68,68,0.4)",
          color: "#f87171",
          padding: "1rem 1.5rem",
          borderRadius: "0.75rem",
          marginBottom: "2rem",
          display: "flex",
          alignItems: "center",
          gap: "1rem"
        }}>
          <span style={{ fontSize: "1.5rem" }}>🚫</span>
          <div>
            <h3 style={{ margin: "0 0 0.25rem", color: "#fca5a5" }}>Account Blocked</h3>
            <p style={{ margin: 0, fontSize: "0.9rem" }}>
              Your account has been blocked by the admin. You can view your past interviews, but you cannot generate or take new interviews. Please contact support.
            </p>
          </div>
        </div>
      )}

      {/* ── Stat Cards Row ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        <StatCard
          icon="📋"
          title="Total Interviews"
          value={loading ? "—" : stats?.total ?? 0}
          description="All interviews taken"
          accent="#6366f1"
          loading={loading}
        />
        <StatCard
          icon="✅"
          title="Evaluated"
          value={loading ? "—" : stats?.evaluated ?? 0}
          description="Fully evaluated sessions"
          accent="#22c55e"
          loading={loading}
        />
        <StatCard
          icon="🎤"
          title="Voice Interviews"
          value={loading ? "—" : stats?.voiceCount ?? 0}
          description="Voice or mixed mode sessions"
          accent="#ec4899"
          loading={loading}
        />
        <StatCard
          icon="⚙️"
          title="Avg Technical"
          value={loading ? "—" : stats?.avgTechnical ? `${stats.avgTechnical}%` : "—"}
          description="Average technical score"
          accent="#06b6d4"
          loading={loading}
        />
        <StatCard
          icon="🧠"
          title="Avg Confidence"
          value={loading ? "—" : stats?.avgConfidence ? `${stats.avgConfidence}%` : "—"}
          description="NLP confidence score average"
          accent="#f59e0b"
          loading={loading}
        />
        {stats?.avgVoice != null && (
          <StatCard
            icon="🎙️"
            title="Avg Voice Quality"
            value={`${stats.avgVoice}%`}
            description="Voice interview quality avg"
            accent="#f472b6"
            loading={loading}
          />
        )}
      </div>

      {/* ── Recent Interviews ── */}
      <RecentInterviews />

      {/* Pulse keyframe */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
      `}</style>
    </DashboardShell>
  );
}
