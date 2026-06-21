"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import AdminTopbar from "@/components/admin/AdminTopbar";
import AdminStatCard from "@/components/admin/AdminStatCard";

export default function UserDetailsPage({ params }) {
  const router = useRouter();
  const { userId } = use(params);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isBlocking, setIsBlocking] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetchUserDetails = async () => {
      try {
        const res = await fetch(`/api/admin/user/${userId}?t=${Date.now()}`, { credentials: "include", cache: "no-store" });
        const result = await res.json();
        if (mounted) {
          if (result.success) {
            setData(result);
          } else {
            setError(result.message || "Failed to load user details.");
          }
        }
      } catch {
        if (mounted) setError("Error connecting to server.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    Promise.resolve().then(() => {
      if (mounted) setLoading(true);
    });
    fetchUserDetails();

    return () => {
      mounted = false;
    };
  }, [userId]);

  const toggleBlockStatus = async () => {
    const action = data.user.isBlocked ? "unblock" : "block";
    if (!confirm(`Are you sure you want to ${action} this user?`)) return;

    setIsBlocking(true);
    try {
      const res = await fetch(`/api/admin/user/${userId}/block`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ isBlocked: !data.user.isBlocked }),
      });
      const result = await res.json();
      if (result.success) {
        setData({
          ...data,
          user: { ...data.user, isBlocked: result.isBlocked }
        });
      } else {
        alert(result.message || "Failed to update block status.");
      }
    } catch (e) {
      alert("Error updating block status.");
    } finally {
      setIsBlocking(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${data.user.fullName} and ALL their data? This action cannot be undone.`)) return;

    try {
      const res = await fetch(`/api/admin/delete-user/${userId}`, { method: "DELETE", credentials: "include" });
      const result = await res.json();
      if (result.success) {
        alert("User deleted successfully.");
        router.push("/admin/users");
      } else {
        alert(result.message || "Failed to delete user.");
      }
    } catch (e) {
      alert("Error deleting user.");
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "3rem" }}>
        <p style={{ color: "#94a3b8" }}>Loading user details...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ padding: "2rem" }}>
        <p style={{ color: "#f87171" }}>{error || "User not found"}</p>
        <button onClick={() => router.push("/admin/users")} style={{ background: "rgba(255,255,255,0.1)", color: "#fff", padding: "0.5rem 1rem", border: "none", borderRadius: "0.5rem", marginTop: "1rem", cursor: "pointer" }}>← Back to Users</button>
      </div>
    );
  }

  const { user, resume, interviews } = data;
  const avgScore = interviews.length > 0 
    ? Math.round(interviews.reduce((s, i) => s + (i.overallScore || 0), 0) / interviews.length) 
    : 0;

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", marginBottom: "1rem" }}>
        <div>
          <button onClick={() => router.push("/admin/users")} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", marginBottom: "1rem", fontSize: "0.9rem" }}>
            ← Back to Users
          </button>
          <AdminTopbar title="User Details" subtitle={`Viewing details for ${user.fullName}`} />
        </div>
        
        {/* Admin Actions */}
        {user.role !== "admin" && (
          <div style={{ display: "flex", gap: "1rem", marginTop: "2rem" }}>
            <button
              onClick={toggleBlockStatus}
              disabled={isBlocking}
              style={{
                padding: "0.7rem 1.25rem",
                background: user.isBlocked ? "rgba(34,197,94,0.1)" : "rgba(245,158,11,0.1)",
                border: `1px solid ${user.isBlocked ? "rgba(34,197,94,0.3)" : "rgba(245,158,11,0.3)"}`,
                color: user.isBlocked ? "#4ade80" : "#f59e0b",
                borderRadius: "0.75rem",
                fontWeight: 600,
                cursor: isBlocking ? "not-allowed" : "pointer"
              }}
            >
              {user.isBlocked ? "🟢 Unblock User" : "🚫 Block User"}
            </button>
            <button
              onClick={handleDelete}
              style={{
                padding: "0.7rem 1.25rem",
                background: "rgba(248,113,113,0.1)",
                border: "1px solid rgba(248,113,113,0.3)",
                color: "#f87171",
                borderRadius: "0.75rem",
                fontWeight: 600,
                cursor: "pointer"
              }}
            >
              🗑️ Delete User
            </button>
          </div>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
        {/* User Info Card */}
        <div style={{ padding: "1.5rem", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(148,163,184,0.1)", borderRadius: "1.25rem" }}>
          <h3 style={{ color: "#f8fafc", fontSize: "1.1rem", marginBottom: "1rem" }}>Profile Information</h3>
          <div style={{ display: "grid", gap: "0.75rem" }}>
            <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.9rem" }}>Name: <span style={{ color: "#f1f5f9", fontWeight: 500, marginLeft: "0.5rem" }}>{user.fullName}</span></p>
            <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.9rem" }}>Email: <span style={{ color: "#f1f5f9", fontWeight: 500, marginLeft: "0.5rem" }}>{user.email}</span></p>
            <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.9rem" }}>Role: <span style={{ color: "#a5b4fc", fontWeight: 500, marginLeft: "0.5rem" }}>{user.role}</span></p>
            <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.9rem" }}>Joined: <span style={{ color: "#f1f5f9", fontWeight: 500, marginLeft: "0.5rem" }}>{new Date(user.createdAt).toLocaleDateString()}</span></p>
            <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.9rem" }}>Status: <span style={{ color: user.isBlocked ? "#f87171" : "#4ade80", fontWeight: 600, marginLeft: "0.5rem" }}>{user.isBlocked ? "Blocked" : "Active"}</span></p>
          </div>
        </div>

        {/* User Stats Card */}
        <div style={{ padding: "1.5rem", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(148,163,184,0.1)", borderRadius: "1.25rem" }}>
          <h3 style={{ color: "#f8fafc", fontSize: "1.1rem", marginBottom: "1rem" }}>Platform Statistics</h3>
          <div style={{ display: "grid", gap: "0.75rem" }}>
            <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.9rem" }}>Total Interviews: <span style={{ color: "#f1f5f9", fontWeight: 500, marginLeft: "0.5rem" }}>{interviews.length}</span></p>
            <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.9rem" }}>Average Score: <span style={{ color: "#f59e0b", fontWeight: 500, marginLeft: "0.5rem" }}>{interviews.length ? `${avgScore}%` : "N/A"}</span></p>
            <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.9rem" }}>Resume: <span style={{ color: resume ? "#4ade80" : "#f87171", fontWeight: 500, marginLeft: "0.5rem" }}>{resume ? "Uploaded" : "Not Uploaded"}</span></p>
          </div>
        </div>
      </div>

      {/* Resume Section */}
      <h3 style={{ color: "#f8fafc", fontSize: "1.2rem", marginBottom: "1rem" }}>Resume Details</h3>
      <div style={{ padding: "1.5rem", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(148,163,184,0.1)", borderRadius: "1.25rem", marginBottom: "2rem" }}>
        {resume ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "2rem" }}>
            <div>
              <p style={{ color: "#94a3b8", fontSize: "0.85rem", marginBottom: "0.2rem" }}>File Name</p>
              <p style={{ color: "#f1f5f9", fontWeight: 500 }}>{resume.fileName}</p>
            </div>
            <div>
              <p style={{ color: "#94a3b8", fontSize: "0.85rem", marginBottom: "0.2rem" }}>Analysis Score</p>
              <p style={{ color: "#6366f1", fontWeight: 700 }}>{resume.analysisScore}%</p>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ color: "#94a3b8", fontSize: "0.85rem", marginBottom: "0.5rem" }}>Detected Skills</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {resume.extractedSkills && resume.extractedSkills.length > 0 ? (
                  resume.extractedSkills.slice(0, 15).map(skill => (
                    <span key={skill} style={{ background: "rgba(99,102,241,0.1)", color: "#a5b4fc", padding: "0.2rem 0.6rem", borderRadius: "0.5rem", fontSize: "0.8rem", border: "1px solid rgba(99,102,241,0.2)" }}>{skill}</span>
                  ))
                ) : (
                  <span style={{ color: "#64748b" }}>No skills detected</span>
                )}
                {resume.extractedSkills && resume.extractedSkills.length > 15 && (
                  <span style={{ color: "#64748b", fontSize: "0.85rem", alignSelf: "center" }}>+{resume.extractedSkills.length - 15} more</span>
                )}
              </div>
            </div>
          </div>
        ) : (
          <p style={{ color: "#64748b", margin: 0 }}>Candidate has not uploaded a resume yet.</p>
        )}
      </div>

      {/* Interviews Section */}
      <h3 style={{ color: "#f8fafc", fontSize: "1.2rem", marginBottom: "1rem" }}>Interview History</h3>
      <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(148,163,184,0.1)", borderRadius: "1rem", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ background: "rgba(255,255,255,0.04)", color: "#94a3b8", fontSize: "0.85rem", textTransform: "uppercase" }}>
              <th style={{ padding: "1rem 1.25rem", borderBottom: "1px solid rgba(148,163,184,0.1)" }}>Role</th>
              <th style={{ padding: "1rem 1.25rem", borderBottom: "1px solid rgba(148,163,184,0.1)" }}>Date</th>
              <th style={{ padding: "1rem 1.25rem", borderBottom: "1px solid rgba(148,163,184,0.1)" }}>Mode</th>
              <th style={{ padding: "1rem 1.25rem", borderBottom: "1px solid rgba(148,163,184,0.1)" }}>Overall Score</th>
              <th style={{ padding: "1rem 1.25rem", borderBottom: "1px solid rgba(148,163,184,0.1)", textAlign: "right" }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {interviews.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ padding: "2rem", textAlign: "center", color: "#64748b" }}>No interviews taken.</td>
              </tr>
            ) : (
              interviews.map((i) => (
                <tr key={i._id} style={{ borderBottom: "1px solid rgba(148,163,184,0.05)", transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.03)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <td style={{ padding: "1rem 1.25rem" }}>
                    <p style={{ color: "#f8fafc", fontWeight: 500, margin: 0 }}>{i.role}</p>
                    <p style={{ color: "#64748b", fontSize: "0.8rem", margin: 0 }}>{i.difficulty}</p>
                  </td>
                  <td style={{ padding: "1rem 1.25rem", color: "#94a3b8", fontSize: "0.9rem" }}>{new Date(i.createdAt).toLocaleDateString()}</td>
                  <td style={{ padding: "1rem 1.25rem" }}>
                    <span style={{ padding: "0.2rem 0.6rem", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 600, background: i.interviewMode === "voice" ? "rgba(236,72,153,0.1)" : i.interviewMode === "mixed" ? "rgba(139,92,246,0.1)" : "rgba(99,102,241,0.08)", color: i.interviewMode === "voice" ? "#f472b6" : i.interviewMode === "mixed" ? "#c084fc" : "#a5b4fc" }}>
                      {i.interviewMode === "voice" ? "🎤 Voice" : i.interviewMode === "mixed" ? "⚡ Mixed" : "📝 Text"}
                    </span>
                  </td>
                  <td style={{ padding: "1rem 1.25rem" }}>
                    {i.overallScore ? (
                      <span style={{ padding: "0.25rem 0.6rem", borderRadius: "999px", background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.35)", color: "#6366f1", fontWeight: 700, fontSize: "0.85rem" }}>
                        {i.overallScore}%
                      </span>
                    ) : (
                      <span style={{ color: "#64748b" }}>—</span>
                    )}
                  </td>
                  <td style={{ padding: "1rem 1.25rem", textAlign: "right" }}>
                    <span style={{ padding: "0.3rem 0.85rem", borderRadius: "999px", background: i.status === "evaluated" ? "rgba(34,197,94,0.1)" : i.status === "completed" ? "rgba(56,189,248,0.1)" : "rgba(250,204,21,0.1)", color: i.status === "evaluated" ? "#4ade80" : i.status === "completed" ? "#38bdf8" : "#facc15", fontSize: "0.8rem", fontWeight: 600 }}>
                      {i.status}
                    </span>
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
