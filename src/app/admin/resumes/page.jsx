"use client";

import { useState, useEffect } from "react";
import AdminTopbar from "@/components/admin/AdminTopbar";
import AdminStatCard from "@/components/admin/AdminStatCard";
import { useRouter } from "next/navigation";

export default function AdminResumesPage() {
  const router = useRouter();
  const [resumes, setResumes] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchName, setSearchName] = useState("");

  const fetchResumes = async () => {
    Promise.resolve().then(() => setLoading(true));
    try {
      const res = await fetch(`/api/admin/resumes?t=${Date.now()}`, { credentials: "include", cache: "no-store" });
      const data = await res.json();
      if (data.success) {
        setResumes(data.resumes);
        setStats(data.stats);
      } else {
        setError(data.message || "Failed to load resumes.");
      }
    } catch {
      setError("Error connecting to server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.resolve().then(() => {
      fetchResumes();
    });
  }, []);

  // Apply filters on the fly (derived state)
  const filteredResumes = (() => {
    if (!searchName.trim()) {
      return resumes;
    }
    const q = searchName.toLowerCase();
    return resumes.filter(
      (r) => r.userId?.fullName?.toLowerCase().includes(q) || r.userId?.email?.toLowerCase().includes(q)
    );
  })();

  return (
    <>
      <AdminTopbar title="Resume Monitoring" subtitle="View and analyze candidate resumes" />

      {error && <p style={{ color: "#f87171", marginBottom: "1rem" }}>{error}</p>}

      {/* Analytics Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.25rem", marginBottom: "2rem" }}>
        <AdminStatCard icon="📄" title="Total Resumes" value={stats?.total || 0} loading={loading} accent="#6366f1" />
        <AdminStatCard icon="📊" title="Avg Score" value={stats && stats.avgScore !== null ? `${stats.avgScore}%` : "—"} loading={loading} accent="#8b5cf6" />
        <AdminStatCard icon="🏆" title="Highest Score" value={stats && stats.highestScore !== null ? `${stats.highestScore}%` : "—"} loading={loading} accent="#22c55e" />
        <AdminStatCard icon="📉" title="Lowest Score" value={stats && stats.lowestScore !== null ? `${stats.lowestScore}%` : "—"} loading={loading} accent="#f87171" />
      </div>

      {/* Search Filter */}
      <div style={{ marginBottom: "1.5rem" }}>
        <input
          type="text"
          placeholder="🔍 Search by candidate name or email"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          style={{
            width: "100%",
            maxWidth: "400px",
            padding: "0.85rem 1.2rem",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(148,163,184,0.2)",
            borderRadius: "0.75rem",
            color: "#f1f5f9",
            outline: "none",
            fontSize: "0.95rem"
          }}
        />
      </div>

      {/* Resumes Table */}
      <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(148,163,184,0.1)", borderRadius: "1rem", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ background: "rgba(255,255,255,0.04)", color: "#94a3b8", fontSize: "0.85rem", textTransform: "uppercase" }}>
              <th style={{ padding: "1rem 1.25rem", borderBottom: "1px solid rgba(148,163,184,0.1)" }}>Candidate</th>
              <th style={{ padding: "1rem 1.25rem", borderBottom: "1px solid rgba(148,163,184,0.1)" }}>Resume Name</th>
              <th style={{ padding: "1rem 1.25rem", borderBottom: "1px solid rgba(148,163,184,0.1)" }}>Resume Score</th>
              <th style={{ padding: "1rem 1.25rem", borderBottom: "1px solid rgba(148,163,184,0.1)" }}>Upload Date</th>
              <th style={{ padding: "1rem 1.25rem", borderBottom: "1px solid rgba(148,163,184,0.1)", textAlign: "right" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" style={{ padding: "2rem", textAlign: "center", color: "#64748b" }}>Loading resumes...</td>
              </tr>
            ) : filteredResumes.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ padding: "2rem", textAlign: "center", color: "#64748b" }}>No resumes found.</td>
              </tr>
            ) : (
              filteredResumes.map((r) => (
                <tr key={r._id} style={{ borderBottom: "1px solid rgba(148,163,184,0.05)", transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.03)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <td style={{ padding: "1rem 1.25rem" }}>
                    <p style={{ color: "#f8fafc", fontWeight: 500, margin: 0 }}>{r.userId?.fullName || "Unknown User"}</p>
                    <p style={{ color: "#64748b", fontSize: "0.8rem", margin: 0 }}>{r.userId?.email || "N/A"}</p>
                  </td>
                  <td style={{ padding: "1rem 1.25rem", color: "#f1f5f9" }}>{r.fileName}</td>
                  <td style={{ padding: "1rem 1.25rem" }}>
                    {r.analysisScore ? (
                      <span style={{ color: r.analysisScore >= 80 ? "#4ade80" : r.analysisScore >= 60 ? "#facc15" : "#f87171", fontWeight: 600 }}>
                        {r.analysisScore}%
                      </span>
                    ) : (
                      <span style={{ color: "#64748b" }}>—</span>
                    )}
                  </td>
                  <td style={{ padding: "1rem 1.25rem", color: "#94a3b8", fontSize: "0.9rem" }}>
                    {new Date(r.uploadedAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: "1rem 1.25rem", textAlign: "right" }}>
                    <button
                      onClick={() => router.push(`/admin/resumes/${r._id}`)}
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
