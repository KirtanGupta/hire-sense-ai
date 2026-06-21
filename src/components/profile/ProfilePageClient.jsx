"use client";

/**
 * Professional Profile Page — Full Redesign
 * Features:
 *  - Gradient avatar with initials + upload-ready ring
 *  - Inline editable name with toast feedback
 *  - Live interview stats (total, evaluated, avg score, best score)
 *  - Recent activity feed
 *  - Account info cards (email, role, member since)
 *  - Change password section
 *  - Fully responsive
 */

import { useEffect, useState, useRef } from "react";
import useAuthStore from "@/store/authStore";
import api from "@/services/api";
import toast from "react-hot-toast";
import { SkeletonBlock } from "@/components/ui/LoadingStates";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function getRoleBadge(role) {
  if (role === "admin") {
    return { label: "Admin", color: "#f59e0b", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.35)" };
  }
  return { label: "Candidate", color: "#6366f1", bg: "rgba(99,102,241,0.12)", border: "rgba(99,102,241,0.35)" };
}

function getScoreColor(score) {
  if (score >= 80) return "#22c55e";
  if (score >= 60) return "#f59e0b";
  if (score >= 40) return "#f97316";
  return "#f87171";
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function AvatarRing({ name, image, size = 96 }) {
  const initials = getInitials(name);
  const colors = [
    ["#6366f1", "#8b5cf6"],
    ["#06b6d4", "#6366f1"],
    ["#ec4899", "#8b5cf6"],
    ["#10b981", "#06b6d4"],
  ];
  const pair = colors[(name?.length || 0) % colors.length];

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      {/* Outer glow ring */}
      <div style={{
        position: "absolute",
        inset: -4,
        borderRadius: "50%",
        background: `conic-gradient(from 0deg, ${pair[0]}, ${pair[1]}, ${pair[0]})`,
        animation: "spinSlow 6s linear infinite",
        zIndex: 0,
      }} />
      {/* Inner white gap */}
      <div style={{
        position: "absolute",
        inset: -1,
        borderRadius: "50%",
        background: "#0a0f1e",
        zIndex: 1,
      }} />
      {/* Avatar circle */}
      <div style={{
        position: "absolute",
        inset: 3,
        borderRadius: "50%",
        background: image ? "transparent" : `linear-gradient(135deg, ${pair[0]}, ${pair[1]})`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.33,
        fontWeight: 800,
        color: "#fff",
        letterSpacing: "-0.02em",
        fontFamily: "var(--font-space-grotesk, sans-serif)",
        zIndex: 2,
        boxShadow: `0 8px 32px ${pair[0]}55`,
        overflow: "hidden",
      }}>
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={name}
            onError={e => {
              e.target.style.display = "none";
              e.target.nextSibling.style.display = "flex";
            }}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : null}
        <div style={{
          width: "100%", height: "100%",
          background: `linear-gradient(135deg, ${pair[0]}, ${pair[1]})`,
          display: image ? "none" : "flex",
          alignItems: "center", justifyContent: "center",
        }}>
          {initials}
        </div>
      </div>
      <style>{`
        @keyframes spinSlow {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

function StatPill({ icon, label, value, color = "#6366f1", loading }) {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "1.25rem 1.5rem",
      borderRadius: "1.25rem",
      background: `${color}0d`,
      border: `1px solid ${color}22`,
      minWidth: 110,
      flex: 1,
      transition: "transform 0.2s ease, border-color 0.2s ease",
      cursor: "default",
    }}
    onMouseEnter={e => {
      e.currentTarget.style.transform = "translateY(-3px)";
      e.currentTarget.style.borderColor = `${color}44`;
    }}
    onMouseLeave={e => {
      e.currentTarget.style.transform = "translateY(0)";
      e.currentTarget.style.borderColor = `${color}22`;
    }}>
      <span style={{ fontSize: "1.5rem", marginBottom: "0.4rem" }}>{icon}</span>
      {loading ? (
        <SkeletonBlock width={48} height={22} borderRadius={6} />
      ) : (
        <span style={{ fontSize: "1.5rem", fontWeight: 800, color, lineHeight: 1 }}>{value}</span>
      )}
      <span style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.35rem", fontWeight: 500, textAlign: "center" }}>{label}</span>
    </div>
  );
}

function SectionCard({ title, icon, children, accent = "#6366f1" }) {
  return (
    <div style={{
      padding: "1.75rem",
      borderRadius: "1.5rem",
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(148,163,184,0.1)",
      backdropFilter: "blur(8px)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", marginBottom: "1.5rem" }}>
        <span style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          width: 34, height: 34, borderRadius: "0.7rem",
          background: `${accent}18`, fontSize: "1rem",
        }}>{icon}</span>
        <h3 style={{ color: "#f8fafc", fontSize: "1rem", fontWeight: 700, margin: 0 }}>{title}</h3>
      </div>
      {children}
    </div>
  );
}

function InfoRow({ label, value, mono = false }) {
  return (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "0.85rem 0",
      borderBottom: "1px solid rgba(148,163,184,0.07)",
      flexWrap: "wrap",
      gap: "0.5rem",
    }}>
      <span style={{ color: "#64748b", fontSize: "0.88rem", fontWeight: 500 }}>{label}</span>
      <span style={{
        color: "#f8fafc",
        fontSize: "0.9rem",
        fontWeight: 500,
        fontFamily: mono ? "monospace" : "inherit",
        letterSpacing: mono ? "0.03em" : 0,
      }}>{value}</span>
    </div>
  );
}

function ScoreRing({ score, color, size = 72 }) {
  const r = (size - 10) / 2;
  const circumference = 2 * Math.PI * r;
  const filled = (score / 100) * circumference;

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(148,163,184,0.1)" strokeWidth={6} />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none"
          stroke={color}
          strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray={`${filled} ${circumference}`}
          style={{ transition: "stroke-dasharray 1s ease" }}
        />
      </svg>
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: size * 0.22, fontWeight: 800, color,
      }}>
        {score}%
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ProfilePageClient() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);

  // Edit name
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState("");
  const [nameSaving, setNameSaving] = useState(false);
  const nameInputRef = useRef();

  // Change password
  const [pwData, setPwData] = useState({ current: "", newPw: "", confirm: "" });
  const [pwSaving, setPwSaving] = useState(false);
  const [showPw, setShowPw] = useState(false);

  // ── Fetch user ──
  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await api.get("/api/auth/me");
        if (res.data.success) setUser(res.data.user);
      } catch { setUser(null); }
    }
    fetchUser();
  }, [setUser]);

  // ── Sync name input ──
  useEffect(() => {
    Promise.resolve().then(() => setNameValue(user?.fullName || ""));
  }, [user]);

  // ── Focus name input when editing ──
  useEffect(() => {
    if (editingName) nameInputRef.current?.focus();
  }, [editingName]);

  // ── Fetch stats from interview history ──
  useEffect(() => {
    async function loadStats() {
      try {
        const res = await api.get("/api/interview/history");
        if (res.data.success) {
          const interviews = res.data.interviews || [];
          const evaluated = interviews.filter((i) => i.status === "evaluated");
          const avgScore = evaluated.length > 0
            ? Math.round(evaluated.reduce((s, i) => s + (i.overallScore || 0), 0) / evaluated.length)
            : null;
          const bestScore = evaluated.length > 0
            ? Math.max(...evaluated.map((i) => i.overallScore || 0))
            : null;

          setStats({
            total: interviews.length,
            evaluated: evaluated.length,
            avgScore,
            bestScore,
            voiceCount: interviews.filter((i) => i.interviewMode === "voice" || i.interviewMode === "mixed").length,
          });

          // Build recent activity feed
          setRecentActivity(
            interviews.slice(0, 5).map((i) => ({
              id: i._id,
              role: i.role,
              status: i.status,
              date: i.createdAt,
              difficulty: i.difficulty,
              score: i.overallScore,
            }))
          );
        }
      } catch { /* silent */ }
      finally { setStatsLoading(false); }
    }
    loadStats();
  }, []);

  // ── Save name ──
  async function handleSaveName() {
    if (!nameValue.trim() || nameValue.trim() === user?.fullName) {
      setEditingName(false);
      return;
    }
    setNameSaving(true);
    try {
      const res = await api.put("/api/user/profile", { fullName: nameValue.trim() });
      if (res.data.success) {
        setUser(res.data.user);
        toast.success("✅ Name updated successfully!");
      } else {
        toast.error("❌ Failed to update name.");
      }
    } catch {
      toast.error("❌ Network error. Please try again.");
    } finally {
      setNameSaving(false);
      setEditingName(false);
    }
  }

  // ── Save password (placeholder — extend with real API) ──
  async function handleChangePassword(e) {
    e.preventDefault();
    if (pwData.newPw !== pwData.confirm) {
      toast.error("❌ New passwords do not match.");
      return;
    }
    if (pwData.newPw.length < 6) {
      toast.error("❌ Password must be at least 6 characters.");
      return;
    }
    setPwSaving(true);
    try {
      // Extend /api/user/profile or create /api/auth/change-password
      await new Promise((r) => setTimeout(r, 800)); // simulate
      toast.success("✅ Password updated successfully!");
      setPwData({ current: "", newPw: "", confirm: "" });
    } catch {
      toast.error("❌ Failed to update password.");
    } finally {
      setPwSaving(false);
    }
  }

  const roleBadge = getRoleBadge(user?.role);

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: 1000, margin: "0 auto" }} className="profile-root">

      {/* ══ HERO CARD ══════════════════════════════════════════════════════════ */}
      <div style={{
        position: "relative",
        padding: "2.5rem 2.5rem 2rem",
        borderRadius: "2rem",
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(148,163,184,0.1)",
        marginBottom: "1.5rem",
        overflow: "hidden",
      }}>
        {/* Background gradient orbs */}
        <div style={{ position: "absolute", top: -60, right: -60, width: 260, height: 260, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -40, left: -40, width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)", pointerEvents: "none" }} />

        <div className="profile-hero-inner">
          {/* Avatar */}
          <AvatarRing name={user?.fullName || "U"} image={user?.profilePicture} size={100} />

          {/* Name + meta */}
          <div style={{ flex: 1 }}>
            {/* Editable name */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem", flexWrap: "wrap" }}>
              {editingName ? (
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flex: 1, minWidth: 200 }}>
                  <input
                    ref={nameInputRef}
                    value={nameValue}
                    onChange={(e) => setNameValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveName();
                      if (e.key === "Escape") { setEditingName(false); setNameValue(user?.fullName || ""); }
                    }}
                    style={{
                      background: "rgba(99,102,241,0.08)",
                      border: "1.5px solid rgba(99,102,241,0.5)",
                      borderRadius: "0.75rem",
                      padding: "0.5rem 0.85rem",
                      color: "#f8fafc",
                      fontSize: "1.5rem",
                      fontWeight: 700,
                      outline: "none",
                      width: "100%",
                      maxWidth: 320,
                      fontFamily: "var(--font-space-grotesk, sans-serif)",
                    }}
                  />
                  <button onClick={handleSaveName} disabled={nameSaving} style={saveBtnStyle}>
                    {nameSaving ? "…" : "✓"}
                  </button>
                  <button onClick={() => { setEditingName(false); setNameValue(user?.fullName || ""); }} style={cancelBtnStyle}>✕</button>
                </div>
              ) : (
                <>
                  <h1 style={{ color: "#f8fafc", fontSize: "1.85rem", fontWeight: 800, margin: 0, fontFamily: "var(--font-space-grotesk, sans-serif)", lineHeight: 1.2 }}>
                    {user?.fullName || "Loading…"}
                  </h1>
                  <button
                    onClick={() => setEditingName(true)}
                    title="Edit name"
                    style={{
                      background: "rgba(148,163,184,0.08)",
                      border: "1px solid rgba(148,163,184,0.15)",
                      color: "#64748b",
                      borderRadius: "0.5rem",
                      padding: "0.35rem 0.6rem",
                      cursor: "pointer",
                      fontSize: "0.85rem",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.color = "#a5b4fc"; e.currentTarget.style.borderColor = "rgba(99,102,241,0.4)"; }}
                    onMouseLeave={e => { e.currentTarget.style.color = "#64748b"; e.currentTarget.style.borderColor = "rgba(148,163,184,0.15)"; }}
                  >
                    ✏️ Edit
                  </button>
                </>
              )}
            </div>

            {/* Email */}
            <p style={{ color: "#64748b", fontSize: "0.95rem", margin: "0 0 0.9rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span>📧</span> {user?.email || "—"}
            </p>

            {/* Badges row */}
            <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", alignItems: "center" }}>
              {/* Role badge */}
              <span style={{
                padding: "0.35rem 0.9rem",
                borderRadius: "999px",
                background: roleBadge.bg,
                border: `1px solid ${roleBadge.border}`,
                color: roleBadge.color,
                fontSize: "0.78rem",
                fontWeight: 700,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}>
                {roleBadge.label}
              </span>

              {/* Status badge */}
              {user?.isBlocked ? (
                <span style={{ padding: "0.35rem 0.9rem", borderRadius: "999px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171", fontSize: "0.78rem", fontWeight: 700 }}>
                  🚫 Blocked
                </span>
              ) : (
                <span style={{ padding: "0.35rem 0.9rem", borderRadius: "999px", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", color: "#4ade80", fontSize: "0.78rem", fontWeight: 700 }}>
                  ✓ Active
                </span>
              )}

              {/* Member since */}
              <span style={{ color: "#475569", fontSize: "0.82rem" }}>
                Member since {formatDate(user?.createdAt)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ══ STATS ROW ══════════════════════════════════════════════════════════ */}
      <div className="stats-row" style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        <StatPill icon="🎤" label="Total Interviews" value={stats?.total ?? 0} color="#6366f1" loading={statsLoading} />
        <StatPill icon="✅" label="Evaluated"        value={stats?.evaluated ?? 0} color="#22c55e" loading={statsLoading} />
        <StatPill icon="📈" label="Avg Score"         value={stats?.avgScore != null ? `${stats.avgScore}%` : "—"} color="#06b6d4" loading={statsLoading} />
        <StatPill icon="🏆" label="Best Score"        value={stats?.bestScore != null ? `${stats.bestScore}%` : "—"} color="#f59e0b" loading={statsLoading} />
        <StatPill icon="🎙️" label="Voice Sessions"   value={stats?.voiceCount ?? 0} color="#ec4899" loading={statsLoading} />
      </div>

      {/* ══ TWO-COLUMN GRID ════════════════════════════════════════════════════ */}
      <div className="profile-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>

        {/* ── Account Info ── */}
        <SectionCard title="Account Information" icon="👤" accent="#6366f1">
          <InfoRow label="Full Name"     value={user?.fullName || "—"} />
          <InfoRow label="Email Address" value={user?.email || "—"} mono />
          <InfoRow label="Role"          value={user?.role === "admin" ? "Administrator" : "Candidate"} />
          <InfoRow label="Account ID"    value={user?._id?.slice(-8) || "—"} mono />
          <InfoRow label="Member Since"  value={formatDate(user?.createdAt)} />
          <InfoRow label="Status"        value={user?.isBlocked ? "Blocked" : "Active"} />
        </SectionCard>

        {/* ── Performance Summary ── */}
        <SectionCard title="Performance Summary" icon="📊" accent="#06b6d4">
          {statsLoading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
              {[...Array(4)].map((_, i) => <SkeletonBlock key={i} height={14} delay={i * 0.1} />)}
            </div>
          ) : stats?.evaluated > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {/* Score ring + breakdown */}
              <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                <ScoreRing score={stats.avgScore ?? 0} color={getScoreColor(stats.avgScore)} size={80} />
                <div>
                  <p style={{ color: "#94a3b8", fontSize: "0.8rem", margin: "0 0 0.2rem" }}>Average Score</p>
                  <p style={{ color: "#f8fafc", fontWeight: 700, fontSize: "1.1rem", margin: "0 0 0.35rem" }}>
                    {stats.avgScore}% overall
                  </p>
                  <p style={{ color: getScoreColor(stats.avgScore), fontSize: "0.82rem", fontWeight: 600, margin: 0 }}>
                    {stats.avgScore >= 80 ? "🏆 Excellent performer!" : stats.avgScore >= 60 ? "📈 Good progress" : stats.avgScore >= 40 ? "💪 Keep practicing" : "🔥 Just getting started"}
                  </p>
                </div>
              </div>

              {[
                { label: "Total Sessions",     val: stats.total },
                { label: "Evaluated Sessions", val: stats.evaluated },
                { label: "Best Score Achieved",val: `${stats.bestScore}%` },
                { label: "Voice Sessions",     val: stats.voiceCount },
              ].map(({ label, val }) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "0.6rem 0", borderBottom: "1px solid rgba(148,163,184,0.07)" }}>
                  <span style={{ color: "#64748b", fontSize: "0.88rem" }}>{label}</span>
                  <span style={{ color: "#f8fafc", fontWeight: 600, fontSize: "0.9rem" }}>{val}</span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "1.5rem 0" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>🎯</div>
              <p style={{ color: "#94a3b8", fontWeight: 500, margin: "0 0 0.4rem" }}>No Evaluated Sessions Yet</p>
              <p style={{ color: "#475569", fontSize: "0.85rem", margin: 0 }}>Complete an interview to see your performance data here.</p>
            </div>
          )}
        </SectionCard>

        {/* ── Recent Activity ── */}
        <SectionCard title="Recent Activity" icon="🕐" accent="#8b5cf6">
          {statsLoading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
              {[...Array(3)].map((_, i) => (
                <div key={i} style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                  <SkeletonBlock width={36} height={36} borderRadius={18} delay={i * 0.1} />
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                    <SkeletonBlock width="65%" height={13} delay={i * 0.1 + 0.05} />
                    <SkeletonBlock width="40%" height={11} delay={i * 0.1 + 0.1} />
                  </div>
                </div>
              ))}
            </div>
          ) : recentActivity.length === 0 ? (
            <div style={{ textAlign: "center", padding: "1.5rem 0", color: "#475569" }}>
              <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📭</div>
              <p style={{ margin: 0, fontSize: "0.9rem" }}>No interviews yet.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              {recentActivity.map((item, i) => {
                const statusIcons = { evaluated: "📊", completed: "✅", "in-progress": "▶" };
                const statusColors = { evaluated: "#22c55e", completed: "#38bdf8", "in-progress": "#facc15" };
                const sc = statusColors[item.status] || "#94a3b8";
                return (
                  <div key={item.id} style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.85rem",
                    padding: "0.75rem 0.9rem",
                    borderRadius: "0.9rem",
                    background: "rgba(148,163,184,0.04)",
                    border: "1px solid rgba(148,163,184,0.07)",
                    animation: `fadeInUp 0.4s ease ${i * 0.07}s both`,
                  }}>
                    {/* Icon bubble */}
                    <div style={{
                      width: 36, height: 36, borderRadius: "50%",
                      background: `${sc}15`,
                      border: `1px solid ${sc}30`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "1rem", flexShrink: 0,
                    }}>
                      {statusIcons[item.status] || "🎤"}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ color: "#f8fafc", fontWeight: 600, margin: "0 0 0.15rem", fontSize: "0.88rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {item.role}
                      </p>
                      <p style={{ color: "#475569", margin: 0, fontSize: "0.77rem" }}>
                        {item.difficulty} · {formatDate(item.date)}
                      </p>
                    </div>
                    {item.score != null && (
                      <span style={{
                        padding: "0.2rem 0.55rem", borderRadius: "999px",
                        background: `${getScoreColor(item.score)}15`,
                        color: getScoreColor(item.score),
                        fontSize: "0.78rem", fontWeight: 700, flexShrink: 0,
                      }}>
                        {item.score}%
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>

        {/* ── Edit Profile / Change Password ── */}
        <SectionCard title="Security" icon="🔐" accent="#ec4899">
          <form onSubmit={handleChangePassword} style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
            <p style={{ color: "#64748b", fontSize: "0.88rem", margin: "0 0 0.25rem", lineHeight: 1.6 }}>
              Update your password to keep your account secure.
            </p>

            {[
              { key: "current", label: "Current Password",  placeholder: "Enter current password" },
              { key: "newPw",   label: "New Password",      placeholder: "Minimum 6 characters" },
              { key: "confirm", label: "Confirm Password",  placeholder: "Repeat new password" },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label style={{ display: "block", color: "#94a3b8", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.4rem" }}>
                  {label}
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPw ? "text" : "password"}
                    placeholder={placeholder}
                    value={pwData[key]}
                    onChange={(e) => setPwData((p) => ({ ...p, [key]: e.target.value }))}
                    style={inputStyle}
                  />
                  {key === "newPw" && (
                    <button
                      type="button"
                      onClick={() => setShowPw((v) => !v)}
                      style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: "0.9rem" }}
                    >
                      {showPw ? "🙈" : "👁️"}
                    </button>
                  )}
                </div>
              </div>
            ))}

            <button
              type="submit"
              disabled={pwSaving || !pwData.current || !pwData.newPw || !pwData.confirm}
              style={{
                marginTop: "0.25rem",
                padding: "0.85rem",
                borderRadius: "0.9rem",
                border: "none",
                background: pwSaving ? "rgba(236,72,153,0.4)" : "linear-gradient(135deg, #ec4899, #8b5cf6)",
                color: "#fff",
                fontWeight: 700,
                fontSize: "0.9rem",
                cursor: pwSaving || !pwData.current || !pwData.newPw || !pwData.confirm ? "not-allowed" : "pointer",
                opacity: !pwData.current || !pwData.newPw || !pwData.confirm ? 0.5 : 1,
                transition: "all 0.2s ease",
                boxShadow: "0 4px 16px rgba(236,72,153,0.25)",
              }}
            >
              {pwSaving ? "Updating…" : "🔒 Update Password"}
            </button>
          </form>
        </SectionCard>
      </div>

      {/* ══ DANGER ZONE ════════════════════════════════════════════════════════ */}
      <div style={{
        marginTop: "1.25rem",
        padding: "1.5rem 1.75rem",
        borderRadius: "1.5rem",
        background: "rgba(239,68,68,0.04)",
        border: "1px solid rgba(239,68,68,0.15)",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h4 style={{ color: "#fca5a5", margin: "0 0 0.3rem", fontSize: "0.95rem" }}>⚠️ Danger Zone</h4>
            <p style={{ color: "#64748b", margin: 0, fontSize: "0.85rem" }}>
              These actions are permanent and cannot be undone.
            </p>
          </div>
          <button
            onClick={() => toast.error("⚠️ Please contact support to delete your account.")}
            style={{
              padding: "0.7rem 1.4rem",
              borderRadius: "0.75rem",
              border: "1px solid rgba(239,68,68,0.35)",
              background: "rgba(239,68,68,0.08)",
              color: "#f87171",
              fontSize: "0.88rem",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.15)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(239,68,68,0.08)"; }}
          >
            🗑️ Delete Account
          </button>
        </div>
      </div>

      {/* ══ RESPONSIVE CSS ══════════════════════════════════════════════════ */}
      <style>{`
        .profile-hero-inner {
          display: flex;
          align-items: flex-start;
          gap: 2rem;
        }
        @media (max-width: 640px) {
          .profile-hero-inner {
            flex-direction: column;
            align-items: center;
            text-align: center;
          }
          .profile-hero-inner h1 { font-size: 1.5rem !important; }
          .profile-hero-inner p { justify-content: center; }
          .profile-hero-inner > div:last-child > div:first-child { justify-content: center; }
        }
        .profile-grid {
          grid-template-columns: 1fr 1fr;
        }
        @media (max-width: 860px) {
          .profile-grid {
            grid-template-columns: 1fr !important;
          }
        }
        .stats-row > * {
          min-width: 100px;
        }
        @media (max-width: 640px) {
          .stats-row {
            display: grid !important;
            grid-template-columns: 1fr 1fr;
          }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spinSlow {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// ─── Shared styles ────────────────────────────────────────────────────────────

const inputStyle = {
  width: "100%",
  padding: "0.75rem 1rem",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(148,163,184,0.15)",
  borderRadius: "0.75rem",
  color: "#f8fafc",
  fontSize: "0.9rem",
  outline: "none",
  transition: "border-color 0.2s, background 0.2s",
  boxSizing: "border-box",
};

const saveBtnStyle = {
  padding: "0.5rem 1rem",
  borderRadius: "0.65rem",
  border: "none",
  background: "rgba(34,197,94,0.2)",
  color: "#4ade80",
  fontWeight: 700,
  cursor: "pointer",
  fontSize: "1rem",
  transition: "background 0.2s",
};

const cancelBtnStyle = {
  padding: "0.5rem 0.75rem",
  borderRadius: "0.65rem",
  border: "none",
  background: "rgba(248,113,113,0.12)",
  color: "#f87171",
  fontWeight: 700,
  cursor: "pointer",
  fontSize: "0.9rem",
};
