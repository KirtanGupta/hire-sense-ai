"use client";

import { useState, useEffect } from "react";
import AdminTopbar from "@/components/admin/AdminTopbar";
import AdminStatCard from "@/components/admin/AdminStatCard";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");

  const fetchUsers = async () => {
    Promise.resolve().then(() => setLoading(true));
    try {
      const res = await fetch(`/api/admin/users?t=${Date.now()}`, { credentials: "include", cache: "no-store" });
      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
        setStats(data.stats);
      } else {
        setError(data.message || "Failed to load users.");
      }
    } catch {
      setError("Error connecting to server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.resolve().then(() => {
      fetchUsers();
    });
  }, []);

  // Apply filters on the fly (derived state)
  const filteredUsers = (() => {
    if (!searchQuery.trim()) {
      return users;
    }
    const q = searchQuery.toLowerCase();
    return users.filter(
      (u) => u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    );
  })();

  // Export to Excel
  const exportUsers = () => {
    const dataToExport = filteredUsers.map((u) => ({
      ID: u._id,
      Name: u.fullName,
      Email: u.email,
      Role: u.role,
      Status: u.isBlocked ? "Blocked" : "Active",
      "Joined Date": new Date(u.createdAt).toLocaleDateString(),
      "Interviews Taken": u.interviewCount,
      "Average Score": u.avgScore ? `${u.avgScore}%` : "N/A",
      "Resumes Uploaded": u.resumeCount,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
    XLSX.writeFile(workbook, "hiresense_users.xlsx");
  };

  const handleDelete = async (userId, userName) => {
    if (!confirm(`Are you sure you want to delete ${userName} and ALL their data? This action cannot be undone.`)) return;

    try {
      const res = await fetch(`/api/admin/delete-user/${userId}`, { method: "DELETE", credentials: "include" });
      const data = await res.json();
      if (data.success) {
        fetchUsers(); // Refresh list
      } else {
        alert(data.message || "Failed to delete user.");
      }
    } catch (e) {
      alert("Error deleting user.");
    }
  };

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap" }}>
        <AdminTopbar title="User Management" subtitle="View and manage all registered candidates" />
        <button
          onClick={exportUsers}
          style={{
            padding: "0.7rem 1.25rem",
            background: "rgba(34,197,94,0.1)",
            border: "1px solid rgba(34,197,94,0.3)",
            color: "#4ade80",
            borderRadius: "0.75rem",
            fontWeight: 600,
            fontSize: "0.9rem",
            cursor: "pointer",
            marginTop: "0.5rem"
          }}
        >
          📥 Export Excel
        </button>
      </div>

      {error && <p style={{ color: "#f87171", marginBottom: "1rem" }}>{error}</p>}

      {/* Stats Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.25rem", marginBottom: "2rem" }}>
        <AdminStatCard icon="👥" title="Total Users" value={stats?.totalUsers || 0} loading={loading} accent="#6366f1" />
        <AdminStatCard icon="🟢" title="Active Users" value={stats?.totalActive || 0} loading={loading} accent="#22c55e" />
        <AdminStatCard icon="🚫" title="Blocked Users" value={stats?.totalBlocked || 0} loading={loading} accent="#f87171" />
        <AdminStatCard icon="👑" title="Admins" value={stats?.totalAdmins || 0} loading={loading} accent="#f59e0b" />
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: "1.5rem" }}>
        <input
          type="text"
          placeholder="🔍 Search by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
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

      {/* Users Table */}
      <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(148,163,184,0.1)", borderRadius: "1rem", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ background: "rgba(255,255,255,0.04)", color: "#94a3b8", fontSize: "0.85rem", textTransform: "uppercase" }}>
              <th style={{ padding: "1rem 1.25rem", borderBottom: "1px solid rgba(148,163,184,0.1)" }}>Name</th>
              <th style={{ padding: "1rem 1.25rem", borderBottom: "1px solid rgba(148,163,184,0.1)" }}>Email</th>
              <th style={{ padding: "1rem 1.25rem", borderBottom: "1px solid rgba(148,163,184,0.1)" }}>Role</th>
              <th style={{ padding: "1rem 1.25rem", borderBottom: "1px solid rgba(148,163,184,0.1)" }}>Joined Date</th>
              <th style={{ padding: "1rem 1.25rem", borderBottom: "1px solid rgba(148,163,184,0.1)" }}>Status</th>
              <th style={{ padding: "1rem 1.25rem", borderBottom: "1px solid rgba(148,163,184,0.1)", textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" style={{ padding: "2rem", textAlign: "center", color: "#64748b" }}>Loading users...</td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: "2rem", textAlign: "center", color: "#64748b" }}>No users found.</td>
              </tr>
            ) : (
              filteredUsers.map((u) => (
                <tr key={u._id} style={{ borderBottom: "1px solid rgba(148,163,184,0.05)", transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.03)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <td style={{ padding: "1rem 1.25rem", color: "#f8fafc", fontWeight: 500 }}>{u.fullName}</td>
                  <td style={{ padding: "1rem 1.25rem", color: "#94a3b8", fontSize: "0.9rem" }}>{u.email}</td>
                  <td style={{ padding: "1rem 1.25rem" }}>
                    <span style={{ padding: "0.2rem 0.6rem", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 600, background: u.role === "admin" ? "rgba(99,102,241,0.15)" : "rgba(148,163,184,0.1)", color: u.role === "admin" ? "#a5b4fc" : "#cbd5e1" }}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding: "1rem 1.25rem", color: "#94a3b8", fontSize: "0.9rem" }}>
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: "1rem 1.25rem" }}>
                    {u.isBlocked ? (
                      <span style={{ color: "#f87171", fontSize: "0.85rem", fontWeight: 600 }}>Blocked</span>
                    ) : (
                      <span style={{ color: "#4ade80", fontSize: "0.85rem", fontWeight: 600 }}>Active</span>
                    )}
                  </td>
                  <td style={{ padding: "1rem 1.25rem", textAlign: "right" }}>
                    <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                      <button
                        onClick={() => router.push(`/admin/users/${u._id}`)}
                        style={{ padding: "0.4rem 0.8rem", background: "rgba(99,102,241,0.1)", color: "#a5b4fc", border: "1px solid rgba(99,102,241,0.2)", borderRadius: "0.5rem", cursor: "pointer", fontSize: "0.85rem" }}
                      >
                        View
                      </button>
                      {u.role !== "admin" && (
                        <button
                          onClick={() => handleDelete(u._id, u.fullName)}
                          style={{ padding: "0.4rem 0.8rem", background: "rgba(248,113,113,0.1)", color: "#f87171", border: "1px solid rgba(248,113,113,0.2)", borderRadius: "0.5rem", cursor: "pointer", fontSize: "0.85rem" }}
                        >
                          Delete
                        </button>
                      )}
                    </div>
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
