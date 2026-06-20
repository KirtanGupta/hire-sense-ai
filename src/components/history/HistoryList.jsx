"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";

export default function HistoryList() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await api.get("/api/interview/history");
        if (res.data.success) {
          setInterviews(res.data.interviews || []);
        } else {
          setError(res.data.message || "Unable to load history");
        }
      } catch (err) {
        setError("Unable to load history");
      } finally {
        setLoading(false);
      }
    }

    loadHistory();
  }, []);

  if (loading) {
    return <p style={{ color: "#cbd5e1" }}>Loading interview history...</p>;
  }

  if (error) {
    return <p style={{ color: "#f87171" }}>{error}</p>;
  }

  if (interviews.length === 0) {
    return <p style={{ color: "#94a3b8" }}>You have no interview history yet.</p>;
  }

  return (
    <div style={{ padding: "2rem", borderRadius: "1.5rem", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(148,163,184,0.12)" }}>
      <h2 style={{ color: "#fff", marginBottom: "1rem" }}>Interview History</h2>
      <div style={{ display: "grid", gap: "1rem" }}>
        {interviews.map((item) => (
          <div key={item._id} style={{ padding: "1rem", borderRadius: "1rem", background: "rgba(148,163,184,0.06)" }}>
            <h3 style={{ color: "#f8fafc", margin: 0 }}>{item.role}</h3>
            <p style={{ color: "#94a3b8", margin: "0.5rem 0 0" }}>{new Date(item.interviewDate).toLocaleDateString()}</p>
            <p style={{ color: "#cbd5e1", margin: "0.5rem 0 0" }}>{item.feedback || "No feedback recorded."}</p>
            <span style={{ color: item.score >= 70 ? "#22c55e" : "#facc15", fontWeight: 600 }}>
              Score: {item.score}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
