"use client";

import { useEffect, useState } from "react";
import AdminTopbar from "@/components/admin/AdminTopbar";
import AdminStatCard from "@/components/admin/AdminStatCard";
import Link from "next/link";

// ─── Recent Users Mini Table ──────────────────────────────────────────────────
function RecentUsersTable({ users, loading }) {
  if (loading) {
    return (
      <div style={{ display: "grid", gap: "0.65rem" }}>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              height: 52,
              borderRadius: "0.85rem",
              background: "rgba(148,163,184,0.05)",
              animation: "adminPulse 1.5s ease-in-out infinite",
            }}
          />
        ))}
      </div>
    );
  }

  if (!users || users.length === 0) {
    return <p style={{ color: "#475569", fontSize: "0.9rem" }}>No users yet.</p>;
  }

  return (
    <div style={{ display: "grid", gap: "0.5rem" }}>
      {users.map((u, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.85rem",
            padding: "0.75rem 1rem",
            borderRadius: "0.85rem",
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(148,163,184,0.08)",
            transition: "background 0.15s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
        >
          {/* Avatar */}
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              background: `linear-gradient(135deg, hsl(${(i * 60 + 220) % 360}, 70%, 55%), hsl(${(i * 60 + 260) % 360}, 70%, 45%))`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: 700,
              fontSize: "0.85rem",
              flexShrink: 0,
            }}
          >
            {u.fullName?.charAt(0)?.toUpperCase() || "?"}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ color: "#f1f5f9", fontWeight: 600, fontSize: "0.88rem", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {u.fullName}
            </p>
            <p style={{ color: "#475569", fontSize: "0.77rem", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {u.email}
            </p>
          </div>
          <span style={{ color: "#334155", fontSize: "0.75rem", flexShrink: 0 }}>
            {new Date(u.joinedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── System Status Card ───────────────────────────────────────────────────────
function SystemStatus() {
  const items = [
    { label: "Database", status: "Online", color: "#4ade80" },
    { label: "AI Engine (Groq)", status: "Active", color: "#4ade80" },
    { label: "Voice API", status: "Browser-side", color: "#a5b4fc" },
    { label: "PDF Generation", status: "Active", color: "#4ade80" },
  ];
  return (
    <div style={{ display: "grid", gap: "0.5rem" }}>
      {items.map(({ label, status, color }) => (
        <div
          key={label}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0.65rem 1rem",
            borderRadius: "0.75rem",
            background: "rgba(255,255,255,0.025)",
          }}
        >
          <span style={{ color: "#94a3b8", fontSize: "0.85rem" }}>{label}</span>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              color,
              fontSize: "0.8rem",
              fontWeight: 600,
            }}
          >
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: color, display: "inline-block", boxShadow: `0 0 5px ${color}` }} />
            {status}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Main Dashboard Page ──────────────────────────────────────────────────────
export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch(`/api/admin/stats?t=${Date.now()}`, { credentials: "include", cache: "no-store" });
        const data = await res.json();
        if (data.success) {
          setStats(data.stats);
        } else {
          setError(data.message || "Failed to load stats.");
        }
      } catch {
        setError("Could not connect to server.");
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const statCards = [
    {
      icon: "👥",
      title: "Total Users",
      value: stats?.totalUsers ?? 0,
      description: "Registered candidates",
      accent: "#6366f1",
    },
    {
      icon: "🎤",
      title: "Total Interviews",
      value: stats?.totalInterviews ?? 0,
      description: "All sessions created",
      accent: "#8b5cf6",
    },
    {
      icon: "📄",
      title: "Total Resumes",
      value: stats?.totalResumes ?? 0,
      description: "Uploaded & analyzed",
      accent: "#06b6d4",
    },
    {
      icon: "✅",
      title: "Evaluated",
      value: stats?.totalEvaluated ?? 0,
      description: "AI-evaluated sessions",
      accent: "#22c55e",
    },
    {
      icon: "📊",
      title: "Average Score",
      value: stats?.averageScore ? `${stats.averageScore}%` : "—",
      description: "Across all evaluated sessions",
      accent: "#f59e0b",
    },
    {
      icon: "🏆",
      title: "Top Candidate",
      value: stats?.topCandidate?.name || "N/A",
      description: stats?.topCandidate?.score ? `${stats.topCandidate.score}% avg score` : "Highest avg interview score",
      accent: "#10b981",
    },
    {
      icon: "🎯",
      title: "Top Role",
      value: stats?.mostSelectedRole || "N/A",
      description: "Most interviewed role",
      accent: "#f43f5e",
    },
    {
      icon: "📄",
      title: "Avg Resume Score",
      value: stats?.avgResumeScore ? `${stats.avgResumeScore}%` : "—",
      description: "Across all resumes",
      accent: "#3b82f6",
    },
  ];

  return (
    <>
      <AdminTopbar
        title="Admin Dashboard"
        subtitle="Platform overview — live data from MongoDB"
      />

      {/* Error banner */}
      {error && (
        <div
          style={{
            padding: "0.85rem 1.25rem",
            borderRadius: "0.85rem",
            background: "rgba(248,113,113,0.08)",
            border: "1px solid rgba(248,113,113,0.25)",
            color: "#f87171",
            fontSize: "0.9rem",
            marginBottom: "1.5rem",
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {/* ── Stat Cards Grid ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "1.25rem",
          marginBottom: "2rem",
        }}
      >
        {statCards.map((card) => (
          <AdminStatCard key={card.title} {...card} loading={loading} />
        ))}
      </div>

      {/* ── Bottom Row: Recent Users + System Status ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 340px",
          gap: "1.5rem",
          alignItems: "start",
        }}
      >
        {/* Recent Users */}
        <div
          style={{
            padding: "1.5rem",
            borderRadius: "1.25rem",
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(148,163,184,0.1)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1.25rem",
            }}
          >
            <h3
              style={{ color: "#f8fafc", fontSize: "1rem", fontWeight: 700, margin: 0 }}
            >
              👥 Recent Users
            </h3>
            <Link
              href="/admin/users"
              style={{
                color: "#6366f1",
                fontSize: "0.82rem",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              View All →
            </Link>
          </div>
          <RecentUsersTable users={stats?.recentUsers} loading={loading} />
        </div>

        {/* System Status */}
        <div
          style={{
            padding: "1.5rem",
            borderRadius: "1.25rem",
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(148,163,184,0.1)",
          }}
        >
          <h3
            style={{
              color: "#f8fafc",
              fontSize: "1rem",
              fontWeight: 700,
              margin: "0 0 1.25rem",
            }}
          >
            🛰️ System Status
          </h3>
          <SystemStatus />

          {/* Quick links */}
          <div style={{ marginTop: "1.25rem", paddingTop: "1rem", borderTop: "1px solid rgba(148,163,184,0.08)" }}>
            <p style={{ color: "#475569", fontSize: "0.77rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.65rem" }}>
              Quick Actions
            </p>
            <div style={{ display: "grid", gap: "0.4rem" }}>
              {[
                { label: "📋 View All Interviews", href: "/admin/interviews" },
                { label: "📄 View All Resumes", href: "/admin/resumes" },
                { label: "📈 Analytics", href: "/admin/analytics" },
              ].map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  style={{
                    display: "block",
                    padding: "0.55rem 0.85rem",
                    borderRadius: "0.65rem",
                    color: "#64748b",
                    fontSize: "0.83rem",
                    fontWeight: 500,
                    textDecoration: "none",
                    transition: "background 0.15s, color 0.15s",
                    background: "transparent",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(99,102,241,0.08)";
                    e.currentTarget.style.color = "#a5b4fc";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "#64748b";
                  }}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes adminPulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.75; }
        }
      `}</style>
    </>
  );
}
