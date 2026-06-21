"use client";

/**
 * Phase 9 Polish:
 * - 9.1: Upload progress bar (uploading → parsing → analyzing → saving)
 * - 9.4: Toast notifications (success / error)
 */

import { useEffect, useState, useRef } from "react";
import api from "@/services/api";
import toast from "react-hot-toast";
import { UploadProgressBar } from "@/components/ui/LoadingStates";

const emptySkillCategories = {
  languages: [],
  frameworks: [],
  databases: [],
  tools: [],
  softSkills: [],
};

const scoreBreakdownLabels = {
  technicalSkills: "Technical Skills",
  projects: "Projects",
  education: "Education",
  certifications: "Certifications",
  resumeStructure: "Resume Structure",
};

const skillCategoryLabels = {
  languages: "Languages",
  frameworks: "Frameworks",
  databases: "Databases",
  tools: "Tools",
  softSkills: "Soft Skills",
};

function flattenTechnicalSkills(skillCategories) {
  return [
    ...(skillCategories.languages || []),
    ...(skillCategories.frameworks || []),
    ...(skillCategories.databases || []),
    ...(skillCategories.tools || []),
  ];
}

// ─── Drag-and-drop file input ─────────────────────────────────────────────────
function FileDropZone({ file, onFileChange, uploading }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef();

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) onFileChange(dropped);
  }

  return (
    <div
      onClick={() => !uploading && inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      style={{
        border: `2px dashed ${dragging ? "#6366f1" : file ? "rgba(34,197,94,0.5)" : "rgba(148,163,184,0.2)"}`,
        borderRadius: "1.25rem",
        padding: "2rem",
        textAlign: "center",
        cursor: uploading ? "not-allowed" : "pointer",
        background: dragging
          ? "rgba(99,102,241,0.06)"
          : file
            ? "rgba(34,197,94,0.04)"
            : "rgba(148,163,184,0.03)",
        transition: "all 0.2s ease",
        opacity: uploading ? 0.6 : 1,
      }}
    >
      <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>
        {file ? "📎" : "☁️"}
      </div>
      {file ? (
        <>
          <p style={{ color: "#4ade80", fontWeight: 600, margin: "0 0 0.25rem" }}>{file.name}</p>
          <p style={{ color: "#64748b", fontSize: "0.85rem", margin: 0 }}>
            {(file.size / 1024).toFixed(1)} KB · Click to change
          </p>
        </>
      ) : (
        <>
          <p style={{ color: "#94a3b8", fontWeight: 500, margin: "0 0 0.25rem" }}>
            Drag & drop your resume here
          </p>
          <p style={{ color: "#475569", fontSize: "0.85rem", margin: 0 }}>
            or click to browse · PDF or DOCX
          </p>
        </>
      )}
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx"
        onChange={(e) => onFileChange(e.target.files?.[0] || null)}
        style={{ display: "none" }}
      />
    </div>
  );
}

export default function ResumeUploader() {
  const [file, setFile] = useState(null);
  const [uploadStage, setUploadStage] = useState(null); // null | 'uploading' | 'parsing' | 'analyzing' | 'saving' | 'done'
  const [skills, setSkills] = useState([]);
  const [skillCategories, setSkillCategories] = useState(emptySkillCategories);
  const [analysis, setAnalysis] = useState(null);
  const [resumes, setResumes] = useState([]);

  useEffect(() => {
    async function loadResumeData() {
      try {
        const [resumeRes, skillsRes, analysisRes] = await Promise.all([
          api.get("/api/resume"),
          api.get("/api/resume/skills"),
          api.get("/api/resume/analysis"),
        ]);

        if (resumeRes.data.success) {
          setResumes(resumeRes.data.resumes || []);
        }
        if (skillsRes.data.success) {
          setSkills(skillsRes.data.skills || []);
          setSkillCategories(skillsRes.data.skillCategories || emptySkillCategories);
        }
        if (analysisRes.data.success) {
          setAnalysis(analysisRes.data.analysis || null);
        }
      } catch (err) {
        console.error(err);
      }
    }

    loadResumeData();
  }, []);

  async function handleUpload() {
    if (!file) {
      toast.error("Please select a resume file first.");
      return;
    }

    const formData = new FormData();
    formData.append("resume", file);

    try {
      // Stage 1: uploading
      setUploadStage("uploading");
      setSkills([]);
      setSkillCategories(emptySkillCategories);
      setAnalysis(null);

      // Simulate stages with delays so the user sees progress
      const stageTimer = setTimeout(() => setUploadStage("parsing"), 800);
      const stageTimer2 = setTimeout(() => setUploadStage("analyzing"), 2200);

      const res = await fetch("/api/resume/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      clearTimeout(stageTimer);
      clearTimeout(stageTimer2);

      setUploadStage("saving");
      const data = await res.json();

      if (data.success) {
        setUploadStage("done");
        setResumes((current) => [data.resume, ...current]);
        setSkills(data.resume.extractedSkills || []);
        setSkillCategories(data.resume.skillCategories || emptySkillCategories);
        setAnalysis({
          score: data.resume.analysisScore,
          scoreBreakdown: data.resume.scoreBreakdown,
          recommendedRole: data.resume.recommendedRole,
          strengths: data.resume.analysisSummary?.strengths || [],
          weaknesses: data.resume.analysisSummary?.weaknesses || [],
          suggestions: data.resume.analysisSummary?.suggestions || [],
        });
        setFile(null);
        toast.success("✅ Resume uploaded and analyzed successfully!");
        // Reset progress after short delay
        setTimeout(() => setUploadStage(null), 1500);
      } else {
        setSkills([]);
        setSkillCategories(emptySkillCategories);
        setAnalysis(null);
        setUploadStage(null);
        toast.error(`❌ ${data.message || "Upload failed."}`);
      }
    } catch (err) {
      console.error(err);
      setSkills([]);
      setSkillCategories(emptySkillCategories);
      setAnalysis(null);
      setUploadStage(null);
      toast.error("❌ Resume upload failed. Please try again.");
    }
  }

  async function handleDeleteResume(resumeId) {
    if (!window.confirm("Are you sure you want to delete this resume? This will permanently delete the parsed resume details and the file from our servers.")) {
      return;
    }
    
    try {
      const res = await api.delete(`/api/resume?id=${resumeId}`);
      if (res.data.success) {
        toast.success("✅ Resume deleted successfully!");
        setResumes((current) => current.filter((r) => r._id !== resumeId));
        
        // Re-load skills and analysis to update the dashboard display
        const [skillsRes, analysisRes] = await Promise.all([
          api.get("/api/resume/skills"),
          api.get("/api/resume/analysis"),
        ]);
        
        if (skillsRes.data.success) {
          setSkills(skillsRes.data.skills || []);
          setSkillCategories(skillsRes.data.skillCategories || emptySkillCategories);
        } else {
          setSkills([]);
          setSkillCategories(emptySkillCategories);
        }
        
        if (analysisRes.data.success) {
          setAnalysis(analysisRes.data.analysis || null);
        } else {
          setAnalysis(null);
        }
      } else {
        toast.error(res.data.message || "Failed to delete resume.");
      }
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to delete resume due to a network error.");
    }
  }

  const uploading = uploadStage !== null && uploadStage !== "done";

  return (
    <div style={{ display: "grid", gap: "1.5rem" }}>
      {/* ── Upload Card ── */}
      <div style={{
        padding: "2rem",
        borderRadius: "1.5rem",
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(148,163,184,0.12)",
      }}>
        <h2 style={{ color: "#fff", marginBottom: "0.5rem" }}>Resume Upload</h2>
        <p style={{ color: "#94a3b8", marginBottom: "1.5rem", fontSize: "0.92rem" }}>
          Upload your resume and let AI extract skills, score, and personalized suggestions.
        </p>

        <FileDropZone file={file} onFileChange={setFile} uploading={uploading} />

        <button
          type="button"
          onClick={handleUpload}
          disabled={uploading || !file}
          style={{
            marginTop: "1.25rem",
            width: "100%",
            padding: "0.95rem 1.2rem",
            borderRadius: "0.9rem",
            border: "none",
            background: uploading || !file
              ? "rgba(99,102,241,0.4)"
              : "linear-gradient(135deg, #6366f1, #8b5cf6)",
            color: "#fff",
            fontSize: "0.98rem",
            fontWeight: 700,
            cursor: uploading || !file ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.6rem",
            transition: "all 0.2s ease",
            boxShadow: uploading || !file ? "none" : "0 4px 20px rgba(99,102,241,0.35)",
          }}
        >
          {uploading ? (
            <>
              <span style={{
                width: 16,
                height: 16,
                border: "2px solid rgba(255,255,255,0.3)",
                borderTopColor: "#fff",
                borderRadius: "50%",
                animation: "spin 0.7s linear infinite",
                display: "inline-block",
              }} />
              Processing...
            </>
          ) : (
            <>☁️ Upload Resume</>
          )}
        </button>

        {/* Progress bar */}
        <UploadProgressBar stage={uploadStage} />

        <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
      </div>

      {/* ── Recommended Role ── */}
      {analysis?.recommendedRole && (
        <div style={{
          padding: "1.5rem 2rem",
          borderRadius: "1.5rem",
          background: "rgba(16,185,129,0.08)",
          border: "1px solid rgba(16,185,129,0.2)",
          display: "flex",
          alignItems: "center",
          gap: "1rem",
        }}>
          <span style={{ fontSize: "2rem" }}>🎯</span>
          <div>
            <p style={{ margin: "0 0 0.2rem", color: "#94a3b8", fontSize: "0.85rem" }}>Recommended Role</p>
            <h3 style={{ margin: 0, color: "#f8fafc", fontSize: "1.3rem" }}>{analysis.recommendedRole}</h3>
          </div>
        </div>
      )}

      {/* ── Detected Skills ── */}
      {skills.length > 0 && (
        <div style={{ padding: "2rem", borderRadius: "1.5rem", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(148,163,184,0.12)" }}>
          <h3 style={{ color: "#fff", marginBottom: "1rem" }}>Detected Skills</h3>
          <div style={{ display: "grid", gap: "1.25rem", gridTemplateColumns: "1fr 1fr" }}>
            <div>
              <h4 style={{ color: "#e0e7ff", marginBottom: "0.75rem" }}>Technical Skills</h4>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
                {flattenTechnicalSkills(skillCategories).map((skill) => (
                  <span key={`technical-${skill}`} style={{ padding: "0.5rem 0.9rem", borderRadius: "999px", background: "rgba(99,102,241,0.15)", color: "#e0e7ff", fontWeight: 600, fontSize: "0.88rem" }}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h4 style={{ color: "#bbf7d0", marginBottom: "0.75rem" }}>Soft Skills</h4>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
                {(skillCategories.softSkills || []).map((skill) => (
                  <span key={`soft-${skill}`} style={{ padding: "0.5rem 0.9rem", borderRadius: "999px", background: "rgba(16,185,129,0.14)", color: "#bbf7d0", fontWeight: 600, fontSize: "0.88rem" }}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", marginTop: "1.5rem" }}>
            {Object.entries(skillCategoryLabels).map(([key, label]) =>
              key !== "softSkills" && (skillCategories[key] || []).length > 0 ? (
                <div key={key} style={{ padding: "1rem", borderRadius: "1rem", background: "rgba(148,163,184,0.06)" }}>
                  <h4 style={{ color: "#f8fafc", margin: "0 0 0.75rem", fontSize: "0.9rem" }}>{label}</h4>
                  <p style={{ color: "#94a3b8", margin: 0, lineHeight: 1.6, fontSize: "0.85rem" }}>{skillCategories[key].join(", ")}</p>
                </div>
              ) : null
            )}
          </div>
        </div>
      )}

      {/* ── Analysis ── */}
      {analysis && (
        <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "1fr 1fr" }} className="analysis-grid">
          <div style={{ padding: "2rem", borderRadius: "1.5rem", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(148,163,184,0.12)" }}>
            <h3 style={{ color: "#fff", marginBottom: "1rem" }}>Resume Score</h3>
            <div style={{
              fontSize: "3.5rem",
              fontWeight: 800,
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>{analysis.score}%</div>
            <div style={{ display: "grid", gap: "0.65rem", marginTop: "1.25rem" }}>
              {Object.entries(analysis.scoreBreakdown || {}).map(([key, value]) => (
                <div key={key} style={{ display: "flex", justifyContent: "space-between", gap: "1rem", color: "#cbd5e1", fontSize: "0.9rem" }}>
                  <span>{scoreBreakdownLabels[key] || key}</span>
                  <strong style={{ color: "#f8fafc" }}>{value.score}/{value.max}</strong>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid rgba(148,163,184,0.16)", paddingTop: "0.75rem", color: "#fff", fontWeight: 700 }}>
                <span>Total Score</span>
                <span>{analysis.score}/100</span>
              </div>
            </div>
          </div>

          <div style={{ padding: "2rem", borderRadius: "1.5rem", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(148,163,184,0.12)" }}>
            <h3 style={{ color: "#fff", marginBottom: "1rem" }}>Suggestions</h3>
            <ul style={{ color: "#cbd5e1", paddingLeft: "1.25rem", margin: 0 }}>
              {(analysis.suggestions || []).map((suggestion, index) => (
                <li key={index} style={{ marginBottom: "0.75rem", lineHeight: 1.6, fontSize: "0.9rem" }}>
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* ── Uploaded Resumes ── */}
      {resumes.length > 0 && (
        <div style={{ padding: "2rem", borderRadius: "1.5rem", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(148,163,184,0.12)" }}>
          <h3 style={{ color: "#fff", marginBottom: "1rem" }}>Uploaded Resumes</h3>
          <div style={{ display: "grid", gap: "1rem" }}>
            {resumes.map((resume) => (
              <div key={resume._id} style={{ padding: "1rem", borderRadius: "1rem", background: "rgba(148,163,184,0.06)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
                  <p style={{ color: "#f8fafc", margin: 0, fontWeight: 500 }}>{resume.fileName}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <span style={{ color: "#94a3b8", fontSize: "0.85rem" }}>{new Date(resume.uploadedAt).toLocaleDateString()}</span>
                    <button
                      type="button"
                      onClick={() => handleDeleteResume(resume._id)}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "#ef4444",
                        fontSize: "1.1rem",
                        cursor: "pointer",
                        padding: "0.2rem",
                        borderRadius: "0.35rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = "rgba(239, 68, 68, 0.15)"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                      title="Delete Resume"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "0.75rem" }}>
                  {(resume.skillCategories?.languages?.length ||
                    resume.skillCategories?.frameworks?.length ||
                    resume.skillCategories?.databases?.length ||
                    resume.skillCategories?.tools?.length
                    ? flattenTechnicalSkills(resume.skillCategories)
                    : resume.extractedSkills || []
                  ).map((skill) => (
                    <span
                      key={`${resume._id}-${skill}`}
                      style={{ padding: "0.3rem 0.6rem", borderRadius: "999px", background: "rgba(99,102,241,0.16)", color: "#e0e7ff", fontSize: "0.82rem" }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
                {resume.recommendedRole && (
                  <p style={{ color: "#bbf7d0", margin: "0.75rem 0 0", fontSize: "0.88rem" }}>
                    🎯 Recommended Role: {resume.recommendedRole}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 640px) {
          .analysis-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
