"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import AdminTopbar from "@/components/admin/AdminTopbar";

export default function AdminInterviewDetailsPage({ params }) {
  const router = useRouter();
  const { sessionId } = use(params);

  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const fetchInterview = async () => {
      try {
        const res = await fetch(`/api/admin/interviews/${sessionId}?t=${Date.now()}`, { credentials: "include", cache: "no-store" });
        const data = await res.json();
        if (data.success) {
          setInterview(data.interview);
        } else {
          setError(data.message || "Failed to load interview details.");
        }
      } catch {
        setError("Error connecting to server.");
      } finally {
        setLoading(false);
      }
    };
    fetchInterview();
  }, [sessionId]);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this interview session? This action cannot be undone.")) return;
    
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/interviews/${sessionId}`, { method: "DELETE", credentials: "include" });
      const data = await res.json();
      if (data.success) {
        alert("Interview deleted successfully.");
        router.push("/admin/interviews");
      } else {
        alert(data.message || "Failed to delete interview.");
        setIsDeleting(false);
      }
    } catch {
      alert("Error deleting interview.");
      setIsDeleting(false);
    }
  };

  const handleDownloadReport = async () => {
    setIsDownloading(true);
    try {
      const { generatePDFReport } = await import("@/services/reportService");
      await generatePDFReport(interview);
    } catch (e) {
      console.error("PDF error:", e);
      alert("PDF generation failed. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: "3rem", textAlign: "center", color: "#94a3b8" }}>Loading interview details...</div>;
  }

  if (error || !interview) {
    return (
      <div style={{ padding: "2rem" }}>
        <p style={{ color: "#f87171" }}>{error || "Interview not found"}</p>
        <button onClick={() => router.push("/admin/interviews")} style={{ background: "rgba(255,255,255,0.1)", color: "#fff", padding: "0.5rem 1rem", border: "none", borderRadius: "0.5rem", marginTop: "1rem", cursor: "pointer" }}>← Back to Interviews</button>
      </div>
    );
  }

  const { userId, role, difficulty, experience, overallScore, technicalScore, communicationScore, confidenceScore, questions } = interview;

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", marginBottom: "1rem" }}>
        <div>
          <button onClick={() => router.push("/admin/interviews")} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", marginBottom: "1rem", fontSize: "0.9rem" }}>
            ← Back to Interviews
          </button>
          <AdminTopbar title="Interview Details" subtitle={`Session ID: ${sessionId}`} />
        </div>
        
        <div style={{ display: "flex", gap: "1rem", marginTop: "2rem" }}>
          <button
            onClick={handleDownloadReport}
            disabled={isDownloading}
            style={{
              padding: "0.7rem 1.25rem",
              background: "rgba(99,102,241,0.1)",
              border: "1px solid rgba(99,102,241,0.3)",
              color: "#a5b4fc",
              borderRadius: "0.75rem",
              fontWeight: 600,
              cursor: isDownloading ? "not-allowed" : "pointer"
            }}
          >
            {isDownloading ? "⏳ Generating PDF..." : "📄 Download PDF Report"}
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            style={{
              padding: "0.7rem 1.25rem",
              background: "rgba(248,113,113,0.1)",
              border: "1px solid rgba(248,113,113,0.3)",
              color: "#f87171",
              borderRadius: "0.75rem",
              fontWeight: 600,
              cursor: isDeleting ? "not-allowed" : "pointer"
            }}
          >
            🗑️ Delete Interview
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
        {/* Candidate Details Card */}
        <div style={{ padding: "1.5rem", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(148,163,184,0.1)", borderRadius: "1.25rem" }}>
          <h3 style={{ color: "#f8fafc", fontSize: "1.1rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            👤 Candidate Details
          </h3>
          <div style={{ display: "grid", gap: "0.75rem" }}>
            <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.9rem" }}>Name: <span style={{ color: "#f1f5f9", fontWeight: 500, marginLeft: "0.5rem" }}>{userId?.fullName || "Unknown"}</span></p>
            <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.9rem" }}>Email: <span style={{ color: "#f1f5f9", fontWeight: 500, marginLeft: "0.5rem" }}>{userId?.email || "N/A"}</span></p>
            <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.9rem" }}>Role: <span style={{ color: "#a5b4fc", fontWeight: 500, marginLeft: "0.5rem" }}>{role}</span></p>
            <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.9rem" }}>Difficulty: <span style={{ color: "#f1f5f9", fontWeight: 500, marginLeft: "0.5rem" }}>{difficulty}</span></p>
            <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.9rem" }}>Experience: <span style={{ color: "#f1f5f9", fontWeight: 500, marginLeft: "0.5rem" }}>{experience}</span></p>
            <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.9rem" }}>Date: <span style={{ color: "#f1f5f9", fontWeight: 500, marginLeft: "0.5rem" }}>{new Date(interview.createdAt).toLocaleString()}</span></p>
          </div>
        </div>

        {/* Scores Card */}
        <div style={{ padding: "1.5rem", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(148,163,184,0.1)", borderRadius: "1.25rem" }}>
          <h3 style={{ color: "#f8fafc", fontSize: "1.1rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            📊 Performance Scores
          </h3>
          <div style={{ display: "grid", gap: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "#94a3b8", fontSize: "0.95rem" }}>Overall Score</span>
              <span style={{ color: overallScore >= 80 ? "#4ade80" : overallScore >= 60 ? "#facc15" : "#f87171", fontWeight: 700, fontSize: "1.2rem" }}>
                {overallScore ? `${overallScore}%` : "—"}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "#94a3b8", fontSize: "0.95rem" }}>Technical Score</span>
              <span style={{ color: "#f1f5f9", fontWeight: 600 }}>{technicalScore ? `${technicalScore}/100` : "—"}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "#94a3b8", fontSize: "0.95rem" }}>Communication</span>
              <span style={{ color: "#f1f5f9", fontWeight: 600 }}>{communicationScore ? `${communicationScore}/100` : "—"}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "#94a3b8", fontSize: "0.95rem" }}>Confidence Score</span>
              <span style={{ color: "#f1f5f9", fontWeight: 600 }}>{confidenceScore ? `${confidenceScore}%` : "—"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Questions Review */}
      <h3 style={{ color: "#f8fafc", fontSize: "1.2rem", marginBottom: "1rem" }}>Question Review</h3>
      <div style={{ display: "grid", gap: "1.5rem", marginBottom: "2rem" }}>
        {questions.map((q, idx) => (
          <div key={idx} style={{ padding: "1.5rem", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(148,163,184,0.1)", borderRadius: "1.25rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
              <h4 style={{ margin: 0, color: "#f1f5f9", fontSize: "1.05rem", lineHeight: "1.5" }}>
                <span style={{ color: "#6366f1", marginRight: "0.5rem" }}>Q{idx + 1}.</span> {q.question}
              </h4>
              {q.evaluation?.score !== undefined && (
                <span style={{ padding: "0.3rem 0.8rem", background: "rgba(34,197,94,0.1)", color: "#4ade80", borderRadius: "0.5rem", fontWeight: 600, fontSize: "0.9rem" }}>
                  {q.evaluation.score}/100
                </span>
              )}
            </div>
            
            <div style={{ marginBottom: "1rem" }}>
              <p style={{ color: "#94a3b8", fontSize: "0.85rem", marginBottom: "0.3rem", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>Candidate Answer</p>
              <div style={{ padding: "1rem", background: "rgba(15,23,42,0.4)", borderRadius: "0.75rem", color: "#e2e8f0", fontSize: "0.95rem", lineHeight: "1.6" }}>
                {q.answer ? q.answer : <span style={{ color: "#64748b", fontStyle: "italic" }}>No answer provided.</span>}
              </div>
            </div>

            {q.evaluation?.feedback && (
              <div>
                <p style={{ color: "#94a3b8", fontSize: "0.85rem", marginBottom: "0.3rem", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>AI Feedback</p>
                <div style={{ padding: "1rem", background: "rgba(99,102,241,0.05)", borderLeft: "3px solid #6366f1", borderRadius: "0 0.75rem 0.75rem 0", color: "#cbd5e1", fontSize: "0.95rem", lineHeight: "1.6" }}>
                  {q.evaluation.feedback}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
