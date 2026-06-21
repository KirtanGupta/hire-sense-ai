"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import AdminTopbar from "@/components/admin/AdminTopbar";

export default function AdminResumeDetailsPage({ params }) {
  const router = useRouter();
  const { resumeId } = use(params);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchResume = async () => {
      try {
        const res = await fetch(`/api/admin/resumes/${resumeId}?t=${Date.now()}`, { credentials: "include", cache: "no-store" });
        const result = await res.json();
        if (result.success) {
          setData(result);
        } else {
          setError(result.message || "Failed to load resume details.");
        }
      } catch {
        setError("Error connecting to server.");
      } finally {
        setLoading(false);
      }
    };
    fetchResume();
  }, [resumeId]);

  if (loading) {
    return <div style={{ padding: "3rem", textAlign: "center", color: "#94a3b8" }}>Loading resume details...</div>;
  }

  if (error || !data || !data.resume) {
    return (
      <div style={{ padding: "2rem" }}>
        <p style={{ color: "#f87171" }}>{error || "Resume not found"}</p>
        <button onClick={() => router.push("/admin/resumes")} style={{ background: "rgba(255,255,255,0.1)", color: "#fff", padding: "0.5rem 1rem", border: "none", borderRadius: "0.5rem", marginTop: "1rem", cursor: "pointer" }}>← Back to Resumes</button>
      </div>
    );
  }

  const { resume, performance } = data;
  const { userId, analysisScore, extractedSkills, analysisSummary, fileUrl, fileName, uploadedAt } = resume;

  // Performance Interpretation Logic
  let interpretationText = "";
  if (performance.gap !== null) {
    const { gap } = performance;
    if (gap < -10) {
      interpretationText = "Strong Resume, Weak Interview Performance";
    } else if (gap > 10) {
      interpretationText = "Strong Practical Knowledge, Weak Resume";
    } else {
      interpretationText = "Consistent Profile (Resume matches Interview)";
    }
  } else {
    interpretationText = "No evaluated interviews yet.";
  }

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", marginBottom: "1rem" }}>
        <div>
          <button onClick={() => router.push("/admin/resumes")} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", marginBottom: "1rem", fontSize: "0.9rem" }}>
            ← Back to Resumes
          </button>
          <AdminTopbar title="Resume Details" subtitle={`Viewing analysis for ${fileName}`} />
        </div>
        
        <div style={{ display: "flex", gap: "1rem", marginTop: "2rem" }}>
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-block",
              padding: "0.7rem 1.25rem",
              background: "rgba(99,102,241,0.1)",
              border: "1px solid rgba(99,102,241,0.3)",
              color: "#a5b4fc",
              borderRadius: "0.75rem",
              fontWeight: 600,
              textDecoration: "none",
              cursor: "pointer"
            }}
          >
            📄 View Original PDF
          </a>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
        {/* Candidate Details Card */}
        <div style={{ padding: "1.5rem", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(148,163,184,0.1)", borderRadius: "1.25rem" }}>
          <h3 style={{ color: "#f8fafc", fontSize: "1.1rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            👤 Candidate
          </h3>
          <div style={{ display: "grid", gap: "0.75rem" }}>
            <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.9rem" }}>Name: <span style={{ color: "#f1f5f9", fontWeight: 500, marginLeft: "0.5rem" }}>{userId?.fullName || "Unknown"}</span></p>
            <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.9rem" }}>Email: <span style={{ color: "#f1f5f9", fontWeight: 500, marginLeft: "0.5rem" }}>{userId?.email || "N/A"}</span></p>
            <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.9rem" }}>Uploaded: <span style={{ color: "#f1f5f9", fontWeight: 500, marginLeft: "0.5rem" }}>{new Date(uploadedAt).toLocaleDateString()}</span></p>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "0.5rem", paddingTop: "0.5rem", borderTop: "1px solid rgba(148,163,184,0.1)" }}>
              <span style={{ color: "#94a3b8", fontSize: "0.95rem" }}>Resume Score</span>
              <span style={{ color: analysisScore >= 80 ? "#4ade80" : analysisScore >= 60 ? "#facc15" : "#f87171", fontWeight: 700, fontSize: "1.2rem" }}>
                {analysisScore}%
              </span>
            </div>
          </div>
        </div>

        {/* Candidate Performance Tracking Card */}
        <div style={{ padding: "1.5rem", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(148,163,184,0.1)", borderRadius: "1.25rem" }}>
          <h3 style={{ color: "#f8fafc", fontSize: "1.1rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            📈 Performance Tracking
          </h3>
          <div style={{ display: "grid", gap: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "#94a3b8", fontSize: "0.9rem" }}>Resume Score</span>
              <span style={{ color: "#f1f5f9", fontWeight: 600 }}>{analysisScore}%</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "#94a3b8", fontSize: "0.9rem" }}>Avg Interview Score</span>
              <span style={{ color: "#f1f5f9", fontWeight: 600 }}>{performance.avgInterviewScore !== null ? `${performance.avgInterviewScore}%` : "N/A"}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "#94a3b8", fontSize: "0.9rem" }}>Gap</span>
              <span style={{ 
                color: performance.gap === null ? "#64748b" : performance.gap > 0 ? "#4ade80" : performance.gap < 0 ? "#f87171" : "#f1f5f9", 
                fontWeight: 700 
              }}>
                {performance.gap !== null ? (performance.gap > 0 ? `+${performance.gap}` : performance.gap) : "—"}
              </span>
            </div>
            <div style={{ marginTop: "0.5rem", padding: "0.75rem", background: "rgba(99,102,241,0.08)", borderRadius: "0.75rem", border: "1px solid rgba(99,102,241,0.2)" }}>
              <p style={{ color: "#a5b4fc", fontSize: "0.85rem", margin: 0, fontWeight: 500 }}>
                💡 {interpretationText}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Resume Details Section */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1.5rem", marginBottom: "2rem" }}>
        
        {/* Detected Skills */}
        <div style={{ padding: "1.5rem", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(148,163,184,0.1)", borderRadius: "1.25rem" }}>
          <h3 style={{ color: "#f8fafc", fontSize: "1.1rem", marginBottom: "1rem" }}>Detected Skills</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {extractedSkills && extractedSkills.length > 0 ? (
              extractedSkills.map(skill => (
                <span key={skill} style={{ background: "rgba(56,189,248,0.1)", color: "#7dd3fc", padding: "0.3rem 0.8rem", borderRadius: "0.5rem", fontSize: "0.85rem", border: "1px solid rgba(56,189,248,0.2)" }}>
                  {skill}
                </span>
              ))
            ) : (
              <span style={{ color: "#64748b" }}>No skills detected</span>
            )}
          </div>
        </div>

        {/* Feedback (Strengths/Weaknesses) */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
          <div style={{ padding: "1.5rem", background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: "1.25rem" }}>
            <h3 style={{ color: "#4ade80", fontSize: "1.1rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              ✓ Strengths
            </h3>
            <ul style={{ margin: 0, paddingLeft: "1.5rem", color: "#e2e8f0", fontSize: "0.95rem" }}>
              {analysisSummary?.strengths && analysisSummary.strengths.length > 0 ? (
                analysisSummary.strengths.map((s, idx) => <li key={idx} style={{ marginBottom: "0.5rem" }}>{s}</li>)
              ) : (
                <li style={{ color: "#64748b", listStyle: "none", marginLeft: "-1.5rem" }}>No strengths listed</li>
              )}
            </ul>
          </div>
          
          <div style={{ padding: "1.5rem", background: "rgba(248,113,113,0.05)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: "1.25rem" }}>
            <h3 style={{ color: "#f87171", fontSize: "1.1rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              ✗ Weaknesses
            </h3>
            <ul style={{ margin: 0, paddingLeft: "1.5rem", color: "#e2e8f0", fontSize: "0.95rem" }}>
              {analysisSummary?.weaknesses && analysisSummary.weaknesses.length > 0 ? (
                analysisSummary.weaknesses.map((w, idx) => <li key={idx} style={{ marginBottom: "0.5rem" }}>{w}</li>)
              ) : (
                <li style={{ color: "#64748b", listStyle: "none", marginLeft: "-1.5rem" }}>No weaknesses listed</li>
              )}
            </ul>
          </div>
        </div>
        
      </div>
    </>
  );
}
