"use client";

import { useState, useEffect } from "react";
import AdminTopbar from "@/components/admin/AdminTopbar";
import AdminStatCard from "@/components/admin/AdminStatCard";
import { useRouter } from "next/navigation";

export default function AdminInterviewsPage() {
  const router = useRouter();
  const [interviews, setInterviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [searchRole, setSearchRole] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [scoreFilter, setScoreFilter] = useState("");

  const fetchInterviews = async () => {
    Promise.resolve().then(() => setLoading(true));
    try {
      const res = await fetch(`/api/admin/interviews?t=${Date.now()}`, { credentials: "include", cache: "no-store" });
      const data = await res.json();
      if (data.success) {
        setInterviews(data.interviews);
        setStats(data.stats);
      } else {
        setError(data.message || "Failed to load interviews.");
      }
    } catch {
      setError("Error connecting to server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.resolve().then(() => {
      fetchInterviews();
    });
  }, []);

  // Apply filters on the fly (derived state)
  const filteredInterviews = (() => {
    let result = interviews;

    if (searchRole.trim()) {
      const q = searchRole.toLowerCase();
      result = result.filter(i => i.role.toLowerCase().includes(q));
    }

    if (statusFilter) {
      result = result.filter(i => {
        if (statusFilter === "completed") return i.status === "completed" || i.status === "evaluated";
        return i.status === statusFilter;
      });
    }

    if (scoreFilter) {
      result = result.filter(i => {
        if (!i.overallScore) return false;
        if (scoreFilter === "80+") return i.overallScore >= 80;
        if (scoreFilter === "70+") return i.overallScore >= 70;
        if (scoreFilter === "60+") return i.overallScore >= 60;
        return true;
      });
    }

    return result;
  })();

  return (
    <>
      <AdminTopbar title="Interview Monitoring" subtitle="View and manage all interview sessions" />

      {error && <p style={{ color: "#f87171", marginBottom: "1rem" }}>{error}</p>}

      {/* Stats Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.25rem", marginBottom: "2rem" }}>
        <AdminStatCard icon="🎤" title="Total Interviews" value={stats?.total || 0} loading={loading} accent="#6366f1" />
        <AdminStatCard icon="✅" title="Completed" value={stats?.completed || 0} loading={loading} accent="#22c55e" />
        <AdminStatCard icon="📊" title="Average Score" value={stats?.avgScore ? `${stats.avgScore}%` : "—"} loading={loading} accent="#f59e0b" />
      </div>

      {/* Filters */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
        <input
          type="text"
          placeholder="🔍 Search by role (e.g. MERN Developer)"
          value={searchRole}
          onChange={(e) => setSearchRole(e.target.value)}
          style={{
            padding: "0.85rem 1.2rem",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(148,163,184,0.2)",
            borderRadius: "0.75rem",
            color: "#f1f5f9",
            outline: "none",
            fontSize: "0.95rem"
          }}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: "0.85rem 1.2rem",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(148,163,184,0.2)",
            borderRadius: "0.75rem",
            color: statusFilter ? "#f1f5f9" : "#94a3b8",
            outline: "none",
            fontSize: "0.95rem"
          }}
        >
          <option value="">All Statuses</option>
          <option value="completed">Completed / Evaluated</option>
          <option value="in-progress">In Progress</option>
        </select>
        <select
          value={scoreFilter}
          onChange={(e) => setScoreFilter(e.target.value)}
          style={{
            padding: "0.85rem 1.2rem",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(148,163,184,0.2)",
            borderRadius: "0.75rem",
            color: scoreFilter ? "#f1f5f9" : "#94a3b8",
            outline: "none",
            fontSize: "0.95rem"
          }}
        >
          <option value="">All Scores</option>
          <option value="80+">80+ (Excellent)</option>
          <option value="70+">70+ (Good)</option>
          <option value="60+">60+ (Average)</option>
        </select>
      </div>

      {/* Interviews Table */}
      <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(148,163,184,0.1)", borderRadius: "1rem", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ background: "rgba(255,255,255,0.04)", color: "#94a3b8", fontSize: "0.85rem", textTransform: "uppercase" }}>
              <th style={{ padding: "1rem 1.25rem", borderBottom: "1px solid rgba(148,163,184,0.1)" }}>Candidate</th>
              <th style={{ padding: "1rem 1.25rem", borderBottom: "1px solid rgba(148,163,184,0.1)" }}>Role</th>
              <th style={{ padding: "1rem 1.25rem", borderBottom: "1px solid rgba(148,163,184,0.1)" }}>Difficulty</th>
              <th style={{ padding: "1rem 1.25rem", borderBottom: "1px solid rgba(148,163,184,0.1)" }}>Score</th>
              <th style={{ padding: "1rem 1.25rem", borderBottom: "1px solid rgba(148,163,184,0.1)" }}>Date</th>
              <th style={{ padding: "1rem 1.25rem", borderBottom: "1px solid rgba(148,163,184,0.1)" }}>Status</th>
              <th style={{ padding: "1rem 1.25rem", borderBottom: "1px solid rgba(148,163,184,0.1)", textAlign: "right" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ padding: "2rem", textAlign: "center", color: "#64748b" }}>Loading interviews...</td>
              </tr>
            ) : filteredInterviews.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ padding: "2rem", textAlign: "center", color: "#64748b" }}>No interviews found.</td>
              </tr>
            ) : (
              filteredInterviews.map((i) => (
                <tr key={i._id} style={{ borderBottom: "1px solid rgba(148,163,184,0.05)", transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.03)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <td style={{ padding: "1rem 1.25rem" }}>
                    <p style={{ color: "#f8fafc", fontWeight: 500, margin: 0 }}>{i.userId?.fullName || "Unknown User"}</p>
                    <p style={{ color: "#64748b", fontSize: "0.8rem", margin: 0 }}>{i.userId?.email || "N/A"}</p>
                  </td>
                  <td style={{ padding: "1rem 1.25rem", color: "#f1f5f9" }}>{i.role}</td>
                  <td style={{ padding: "1rem 1.25rem", color: "#94a3b8" }}>{i.difficulty}</td>
                  <td style={{ padding: "1rem 1.25rem" }}>
                    {i.overallScore ? (
                      <span style={{ color: i.overallScore >= 80 ? "#4ade80" : i.overallScore >= 60 ? "#facc15" : "#f87171", fontWeight: 600 }}>
                        {i.overallScore}%
                      </span>
                    ) : (
                      <span style={{ color: "#64748b" }}>—</span>
                    )}
                  </td>
                  <td style={{ padding: "1rem 1.25rem", color: "#94a3b8", fontSize: "0.9rem" }}>
                    {new Date(i.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: "1rem 1.25rem" }}>
                    <span style={{ 
                      padding: "0.25rem 0.65rem", 
                      borderRadius: "999px", 
                      fontSize: "0.8rem", 
                      fontWeight: 600, 
                      background: i.status === "evaluated" || i.status === "completed" ? "rgba(34,197,94,0.1)" : "rgba(250,204,21,0.1)", 
                      color: i.status === "evaluated" || i.status === "completed" ? "#4ade80" : "#facc15" 
                    }}>
                      {i.status === "evaluated" || i.status === "completed" ? "Completed" : "In Progress"}
                    </span>
                  </td>
                  <td style={{ padding: "1rem 1.25rem", textAlign: "right" }}>
                    <button
                      onClick={() => router.push(`/admin/interviews/${i._id}`)}
                      style={{ padding: "0.4rem 0.8rem", background: "rgba(99,102,241,0.1)", color: "#a5b4fc", border: "1px solid rgba(99,102,241,0.2)", borderRadius: "0.5rem", cursor: "pointer", fontSize: "0.85rem" }}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
