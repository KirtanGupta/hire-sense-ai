"use client";

import { useEffect, useState, useCallback } from "react";
import AdminTopbar from "@/components/admin/AdminTopbar";
import AdminStatCard from "@/components/admin/AdminStatCard";
import UserGrowthChart from "@/components/admin/charts/UserGrowthChart";
import RoleDistributionChart from "@/components/admin/charts/RoleDistributionChart";
import InterviewScoreChart from "@/components/admin/charts/InterviewScoreChart";
import ResumeScoreChart from "@/components/admin/charts/ResumeScoreChart";
import SkillDistributionChart from "@/components/admin/charts/SkillDistributionChart";
import SuccessRateChart from "@/components/admin/charts/SuccessRateChart";

// ─── Reusable chart card wrapper ─────────────────────────────────────────────
function ChartCard({ title, subtitle, children, accent = "#6366f1", style = {} }) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.03)",
        border: `1px solid ${accent}22`,
        borderRadius: "1.25rem",
        padding: "1.5rem 1.75rem",
        position: "relative",
        overflow: "hidden",
        ...style,
      }}
    >
      {/* Top glow */}
      <div
        style={{
          position: "absolute",
          top: -30,
          right: -30,
          width: 120,
          height: 120,
          borderRadius: "50%",
          background: accent,
          opacity: 0.04,
          filter: "blur(40px)",
          pointerEvents: "none",
        }}
      />
      <div style={{ marginBottom: "1.25rem" }}>
        <h3
          style={{
            color: "#f8fafc",
            fontSize: "1rem",
            fontWeight: 700,
            margin: 0,
            letterSpacing: "-0.01em",
          }}
        >
          {title}
        </h3>
        {subtitle && (
          <p style={{ color: "#475569", fontSize: "0.8rem", margin: "0.2rem 0 0" }}>
            {subtitle}
          </p>
        )}
      </div>
      {children}
    </div>
  );
}

// ─── Skeleton loader ──────────────────────────────────────────────────────────
function Skeleton({ h = 220 }) {
  return (
    <div
      style={{
        height: h,
        borderRadius: "0.75rem",
        background: "rgba(148,163,184,0.06)",
        animation: "analyticsSkeletonPulse 1.6s ease-in-out infinite",
      }}
    />
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminAnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/analytics", { credentials: "include" });
      const json = await res.json();
      if (!json.success) throw new Error(json.message || "Failed to load");
      setData(json.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // ── Export to Excel ─────────────────────────────────────────────────────────
  async function handleExport() {
    if (!data) return;
    setExporting(true);
    try {
      const XLSX = await import("xlsx");
      const wb = XLSX.utils.book_new();

      // Sheet 1 — Summary
      XLSX.utils.book_append_sheet(
        wb,
        XLSX.utils.json_to_sheet([data.summary]),
        "Summary"
      );

      // Sheet 2 — User Growth
      if (data.userGrowth?.length)
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data.userGrowth), "User Growth");

      // Sheet 3 — Role Distribution
      if (data.roleDistribution?.length)
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data.roleDistribution), "Role Distribution");

      // Sheet 4 — Score Trend
      if (data.scoreTrend?.length)
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data.scoreTrend.filter((d) => d.score !== null)), "Score Trend");

      // Sheet 5 — Top Skills
      if (data.topSkills?.length)
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data.topSkills), "Top Skills");

      // Sheet 6 — Success Rate
      if (data.successRate?.length)
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data.successRate), "Success Rate");

      // Sheet 7 — Candidate Rankings
      if (data.candidateRankings?.length)
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data.candidateRankings), "Candidate Rankings");

      XLSX.writeFile(wb, "HireSense_Analytics.xlsx");
    } catch (e) {
      console.error("Export error:", e);
    } finally {
      setExporting(false);
    }
  }

  const s = data?.summary;

  return (
    <>
      <style>{`
        @keyframes analyticsSkeletonPulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
        @keyframes analyticsFadeIn {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .analytics-section {
          animation: analyticsFadeIn 0.5s ease forwards;
        }
      `}</style>

      {/* ── Topbar ── */}
      <AdminTopbar
        title="Platform Analytics"
        subtitle="Trends, charts, and insights across the platform"
      />

      {/* ── Error state ── */}
      {error && (
        <div
          style={{
            padding: "1rem 1.5rem",
            background: "rgba(248,113,113,0.08)",
            border: "1px solid rgba(248,113,113,0.25)",
            borderRadius: "1rem",
            color: "#f87171",
            marginBottom: "1.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span>⚠ {error}</span>
          <button
            onClick={fetchAnalytics}
            style={{
              background: "rgba(248,113,113,0.15)",
              border: "1px solid rgba(248,113,113,0.3)",
              color: "#f87171",
              borderRadius: "0.5rem",
              padding: "0.35rem 0.85rem",
              cursor: "pointer",
              fontSize: "0.82rem",
              fontWeight: 600,
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* ── Header row: title + export button ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "1.75rem",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              padding: "0.3rem 0.85rem",
              background: "rgba(99,102,241,0.1)",
              border: "1px solid rgba(99,102,241,0.2)",
              borderRadius: "999px",
              fontSize: "0.76rem",
              fontWeight: 600,
              color: "#a5b4fc",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            📊 Live Data
          </span>
        </div>
        <button
          onClick={handleExport}
          disabled={exporting || loading || !data}
          id="analytics-export-btn"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.6rem 1.25rem",
            background: exporting ? "rgba(16,185,129,0.08)" : "rgba(16,185,129,0.12)",
            border: "1px solid rgba(16,185,129,0.3)",
            borderRadius: "0.75rem",
            color: "#34d399",
            fontSize: "0.88rem",
            fontWeight: 600,
            cursor: exporting || loading || !data ? "not-allowed" : "pointer",
            transition: "all 0.2s ease",
            opacity: loading || !data ? 0.5 : 1,
          }}
          onMouseEnter={(e) => {
            if (!exporting && !loading && data) {
              e.currentTarget.style.background = "rgba(16,185,129,0.2)";
              e.currentTarget.style.borderColor = "rgba(16,185,129,0.5)";
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(16,185,129,0.12)";
            e.currentTarget.style.borderColor = "rgba(16,185,129,0.3)";
          }}
        >
          {exporting ? "⏳ Exporting..." : "⬇ Export Excel"}
        </button>
      </div>

      {/* ── Summary Stat Cards ── */}
      <div
        className="analytics-section"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1rem",
          marginBottom: "1.75rem",
        }}
      >
        <AdminStatCard
          icon="👥"
          title="Total Users"
          value={loading ? "—" : s?.totalUsers ?? 0}
          accent="#6366f1"
          loading={loading}
          description="Registered candidates"
        />
        <AdminStatCard
          icon="🎤"
          title="Total Interviews"
          value={loading ? "—" : s?.totalInterviews ?? 0}
          accent="#8b5cf6"
          loading={loading}
          description="All sessions"
        />
        <AdminStatCard
          icon="📄"
          title="Total Resumes"
          value={loading ? "—" : s?.totalResumes ?? 0}
          accent="#06b6d4"
          loading={loading}
          description="Uploaded & analyzed"
        />
        <AdminStatCard
          icon="🏆"
          title="Avg Interview Score"
          value={loading ? "—" : `${s?.avgScore ?? 0}%`}
          accent="#10b981"
          loading={loading}
          description="Across evaluated sessions"
        />
      </div>

      {/* ── Chart Row 1: User Growth (full width) ── */}
      <div className="analytics-section" style={{ marginBottom: "1.25rem" }}>
        <ChartCard
          title="📈 User Growth"
          subtitle="New registered users over the last 6 months"
          accent="#6366f1"
        >
          {loading ? <Skeleton h={220} /> : <UserGrowthChart data={data?.userGrowth} />}
        </ChartCard>
      </div>

      {/* ── Chart Row 2: Role Distribution + Success Rate ── */}
      <div
        className="analytics-section"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "1.25rem",
          marginBottom: "1.25rem",
        }}
      >
        <ChartCard
          title="🎯 Role Distribution"
          subtitle="Most selected interview roles"
          accent="#8b5cf6"
        >
          {loading ? <Skeleton h={240} /> : <RoleDistributionChart data={data?.roleDistribution} />}
        </ChartCard>

        <ChartCard
          title="✅ Success Rate"
          subtitle="Candidates scoring ≥ 70% pass"
          accent="#4ade80"
        >
          {loading ? <Skeleton h={240} /> : <SuccessRateChart data={data?.successRate} />}
        </ChartCard>
      </div>

      {/* ── Chart Row 3: Interview Score Trend (full width) ── */}
      <div className="analytics-section" style={{ marginBottom: "1.25rem" }}>
        <ChartCard
          title="📉 Interview Score Trends"
          subtitle="Average scores over the last 6 months"
          accent="#8b5cf6"
        >
          {loading ? <Skeleton h={220} /> : <InterviewScoreChart data={data?.scoreTrend} />}
        </ChartCard>
      </div>

      {/* ── Chart Row 4: Resume Scores + Top Skills ── */}
      <div
        className="analytics-section"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "1.25rem",
          marginBottom: "1.75rem",
        }}
      >
        <ChartCard
          title="📊 Resume Score Distribution"
          subtitle="Quality spread across uploaded resumes"
          accent="#06b6d4"
        >
          {loading ? <Skeleton h={220} /> : <ResumeScoreChart data={data?.resumeScoreDistribution} />}
        </ChartCard>

        <ChartCard
          title="🛠 Top Skills"
          subtitle="Most common skills found in resumes"
          accent="#10b981"
        >
          {loading ? <Skeleton h={280} /> : <SkillDistributionChart data={data?.topSkills} />}
        </ChartCard>
      </div>

      {/* ── Bonus Section ── */}
      <div
        className="analytics-section"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "1.25rem",
          marginBottom: "1.75rem",
        }}
      >
        {/* Most Active User */}
        <div
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(245,158,11,0.2)",
            borderRadius: "1.25rem",
            padding: "1.5rem 1.75rem",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: -20,
              right: -20,
              width: 100,
              height: 100,
              borderRadius: "50%",
              background: "#f59e0b",
              opacity: 0.05,
              filter: "blur(30px)",
              pointerEvents: "none",
            }}
          />
          <div style={{ fontSize: "1.75rem", marginBottom: "0.75rem" }}>⚡</div>
          <p style={{ color: "#94a3b8", fontSize: "0.78rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 0.5rem" }}>
            Most Active User
          </p>
          {loading ? (
            <Skeleton h={48} />
          ) : data?.mostActiveUser ? (
            <>
              <p style={{ color: "#f8fafc", fontSize: "1.1rem", fontWeight: 700, margin: "0 0 0.25rem" }}>
                {data.mostActiveUser.name}
              </p>
              <p style={{ color: "#64748b", fontSize: "0.82rem", margin: "0 0 0.5rem" }}>
                {data.mostActiveUser.email}
              </p>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  padding: "0.3rem 0.75rem",
                  background: "rgba(245,158,11,0.1)",
                  border: "1px solid rgba(245,158,11,0.25)",
                  borderRadius: "999px",
                }}
              >
                <span style={{ color: "#fbbf24", fontSize: "0.82rem", fontWeight: 700 }}>
                  {data.mostActiveUser.interviewCount} interviews taken
                </span>
              </div>
            </>
          ) : (
            <p style={{ color: "#475569", fontSize: "0.88rem" }}>No data yet</p>
          )}
        </div>

        {/* Best Role Performance */}
        <div
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(6,182,212,0.2)",
            borderRadius: "1.25rem",
            padding: "1.5rem 1.75rem",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: -20,
              right: -20,
              width: 100,
              height: 100,
              borderRadius: "50%",
              background: "#06b6d4",
              opacity: 0.05,
              filter: "blur(30px)",
              pointerEvents: "none",
            }}
          />
          <div style={{ fontSize: "1.75rem", marginBottom: "0.75rem" }}>🥇</div>
          <p style={{ color: "#94a3b8", fontSize: "0.78rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 0.5rem" }}>
            Best Role Performance
          </p>
          {loading ? (
            <Skeleton h={48} />
          ) : data?.bestRolePerformance ? (
            <>
              <p style={{ color: "#f8fafc", fontSize: "1.1rem", fontWeight: 700, margin: "0 0 0.5rem" }}>
                {data.bestRolePerformance.role}
              </p>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  padding: "0.3rem 0.75rem",
                  background: "rgba(6,182,212,0.1)",
                  border: "1px solid rgba(6,182,212,0.25)",
                  borderRadius: "999px",
                }}
              >
                <span style={{ color: "#67e8f9", fontSize: "0.82rem", fontWeight: 700 }}>
                  Avg Score: {data.bestRolePerformance.avgScore}%
                </span>
              </div>
            </>
          ) : (
            <p style={{ color: "#475569", fontSize: "0.88rem" }}>No evaluated data yet</p>
          )}
        </div>
      </div>

      {/* ── Candidate Rankings Table ── */}
      <div className="analytics-section" style={{ marginBottom: "1.75rem" }}>
        <ChartCard
          title="🏅 Top Candidate Rankings"
          subtitle="Top 10 candidates by average interview score"
          accent="#6366f1"
        >
          {loading ? (
            <Skeleton h={200} />
          ) : !data?.candidateRankings?.length ? (
            <div style={{ textAlign: "center", padding: "2rem", color: "#475569" }}>
              No evaluated interviews yet
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
                <thead>
                  <tr>
                    {["Rank", "Name", "Email", "Avg Score", "Best Score", "Interviews"].map((h) => (
                      <th
                        key={h}
                        style={{
                          textAlign: "left",
                          padding: "0.65rem 0.85rem",
                          color: "#475569",
                          fontWeight: 600,
                          fontSize: "0.76rem",
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                          borderBottom: "1px solid rgba(148,163,184,0.08)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.candidateRankings.map((c) => (
                    <tr
                      key={c.rank}
                      style={{ transition: "background 0.15s" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <td style={{ padding: "0.7rem 0.85rem", borderBottom: "1px solid rgba(148,163,184,0.05)" }}>
                        <div
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 28,
                            height: 28,
                            borderRadius: "50%",
                            background:
                              c.rank === 1
                                ? "rgba(251,191,36,0.15)"
                                : c.rank === 2
                                ? "rgba(148,163,184,0.1)"
                                : c.rank === 3
                                ? "rgba(180,120,80,0.12)"
                                : "rgba(99,102,241,0.08)",
                            color:
                              c.rank === 1 ? "#fbbf24" : c.rank === 2 ? "#94a3b8" : c.rank === 3 ? "#cd7f32" : "#6366f1",
                            fontWeight: 800,
                            fontSize: "0.82rem",
                          }}
                        >
                          {c.rank === 1 ? "🥇" : c.rank === 2 ? "🥈" : c.rank === 3 ? "🥉" : `#${c.rank}`}
                        </div>
                      </td>
                      <td style={{ padding: "0.7rem 0.85rem", color: "#f8fafc", fontWeight: 600, borderBottom: "1px solid rgba(148,163,184,0.05)" }}>
                        {c.name}
                      </td>
                      <td style={{ padding: "0.7rem 0.85rem", color: "#64748b", borderBottom: "1px solid rgba(148,163,184,0.05)" }}>
                        {c.email}
                      </td>
                      <td style={{ padding: "0.7rem 0.85rem", borderBottom: "1px solid rgba(148,163,184,0.05)" }}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            padding: "0.2rem 0.6rem",
                            borderRadius: "999px",
                            background: c.avgScore >= 70 ? "rgba(74,222,128,0.1)" : "rgba(248,113,113,0.1)",
                            color: c.avgScore >= 70 ? "#4ade80" : "#f87171",
                            fontWeight: 700,
                            fontSize: "0.82rem",
                            border: `1px solid ${c.avgScore >= 70 ? "rgba(74,222,128,0.25)" : "rgba(248,113,113,0.25)"}`,
                          }}
                        >
                          {c.avgScore}%
                        </span>
                      </td>
                      <td style={{ padding: "0.7rem 0.85rem", color: "#94a3b8", borderBottom: "1px solid rgba(148,163,184,0.05)" }}>
                        {c.bestScore}%
                      </td>
                      <td style={{ padding: "0.7rem 0.85rem", color: "#64748b", borderBottom: "1px solid rgba(148,163,184,0.05)" }}>
                        {c.totalInterviews}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </ChartCard>
      </div>
    </>
  );
}
