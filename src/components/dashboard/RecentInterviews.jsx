"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";

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
    if (status === "in-progress") return "In Progress";
    if (status === "completed") return "Completed";
    if (status === "evaluated") return "Evaluated";
    return status;
  };

  return (
    <div style={{ marginTop: "2rem", padding: "1.5rem", borderRadius: "1.25rem", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(148,163,184,0.12)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h3 style={{ color: "#fff", margin: 0 }}>Recent Interviews</h3>
        <button onClick={() => router.push("/history")} style={{ background: "none", border: "none", color: "#6366f1", cursor: "pointer", fontSize: "0.9rem", fontWeight: 600 }}>View All</button>
      </div>
      
      {loading ? (
        <p style={{ color: "#94a3b8", fontSize: "0.9rem" }}>Loading...</p>
      ) : interviews.length === 0 ? (
        <p style={{ color: "#94a3b8", fontSize: "0.9rem" }}>No interviews yet.</p>
      ) : (
        <div style={{ display: "grid", gap: "0.75rem" }}>
          {interviews.map((item) => (
            <div 
              key={item._id} 
              onClick={() => {
                if (item.status === "in-progress") {
                  router.push(`/interview/session/${item._id}`);
                } else {
                  router.push(`/interview/report/${item._id}`);
                }
              }}
              style={{ padding: "1rem", borderRadius: "1rem", background: "rgba(148,163,184,0.06)", cursor: "pointer", transition: "background 0.2s" }}
              onMouseEnter={(e) => e.currentTarget.style.background = "rgba(148,163,184,0.1)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "rgba(148,163,184,0.06)"}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <h4 style={{ color: "#f8fafc", margin: 0 }}>{item.role}</h4>
                  <p style={{ color: "#94a3b8", margin: "0.35rem 0 0", fontSize: "0.85rem" }}>
                    {new Date(item.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                  </p>
                </div>
                <span style={{ color: getStatusColor(item.status), fontWeight: 600, fontSize: "0.85rem", background: "rgba(255,255,255,0.05)", padding: "0.2rem 0.6rem", borderRadius: "0.5rem" }}>
                  {getStatusLabel(item.status)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
