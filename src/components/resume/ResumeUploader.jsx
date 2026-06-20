"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";

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

export default function ResumeUploader() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState(null);
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
      setStatus({ type: "error", message: "Please select a resume file first." });
      return;
    }

    const formData = new FormData();
    formData.append("resume", file);

    try {
      setStatus({ type: "loading", message: "Uploading resume..." });
      setSkills([]);
      setSkillCategories(emptySkillCategories);
      setAnalysis(null);

      const res = await fetch("/api/resume/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const data = await res.json();

        if (data.success) {
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
        setStatus({ type: "success", message: data.message || "Resume uploaded and parsed successfully." });
        setFile(null);
      } else {
        setSkills([]);
        setSkillCategories(emptySkillCategories);
        setAnalysis(null);
        setStatus({ type: "error", message: data.message || "Upload failed." });
      }
    } catch (err) {
      console.error(err);
      setSkills([]);
      setSkillCategories(emptySkillCategories);
      setAnalysis(null);
      setStatus({ type: "error", message: "Resume upload failed." });
    }
  }

  return (
    <div style={{ display: "grid", gap: "1.5rem" }}>
      <div style={{ padding: "2rem", borderRadius: "1.5rem", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(148,163,184,0.12)" }}>
        <h2 style={{ color: "#fff", marginBottom: "1rem" }}>Resume Upload</h2>
        <p style={{ color: "#cbd5e1", marginBottom: "1.5rem" }}>Upload your resume and let AI extract skills, score, and suggestions.</p>
        <input
          type="file"
          accept=".pdf,.docx"
          onChange={(event) => setFile(event.target.files?.[0] || null)}
          style={{ marginBottom: "1rem", color: "#f8fafc" }}
        />
        <button
          type="button"
          onClick={handleUpload}
          style={{ padding: "0.9rem 1.2rem", borderRadius: "0.9rem", border: "none", background: "#6366f1", color: "#fff", cursor: "pointer" }}
        >
          Upload Resume
        </button>
        {status && (
          <p style={{ marginTop: "1rem", color: status.type === "success" ? "#22c55e" : status.type === "error" ? "#f87171" : "#cbd5e1" }}>
            {status.message}
          </p>
        )}
      </div>

      {analysis?.recommendedRole && (
        <div style={{ padding: "1.5rem 2rem", borderRadius: "1.5rem", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.18)" }}>
          <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.9rem" }}>Recommended Role</p>
          <h3 style={{ margin: "0.35rem 0 0", color: "#f8fafc", fontSize: "1.4rem" }}>{analysis.recommendedRole}</h3>
        </div>
      )}

      {skills.length > 0 && (
        <div style={{ padding: "2rem", borderRadius: "1.5rem", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(148,163,184,0.12)" }}>
          <h3 style={{ color: "#fff", marginBottom: "1rem" }}>Detected Skills</h3>
          <div style={{ display: "grid", gap: "1.25rem", gridTemplateColumns: "1fr 1fr" }}>
            <div>
              <h4 style={{ color: "#e0e7ff", marginBottom: "0.75rem" }}>Technical Skills</h4>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
                {flattenTechnicalSkills(skillCategories).map((skill) => (
                  <span key={`technical-${skill}`} style={{ padding: "0.5rem 0.9rem", borderRadius: "999px", background: "rgba(99,102,241,0.15)", color: "#e0e7ff", fontWeight: 600 }}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h4 style={{ color: "#bbf7d0", marginBottom: "0.75rem" }}>Soft Skills</h4>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
                {(skillCategories.softSkills || []).map((skill) => (
                  <span key={`soft-${skill}`} style={{ padding: "0.5rem 0.9rem", borderRadius: "999px", background: "rgba(16,185,129,0.14)", color: "#bbf7d0", fontWeight: 600 }}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(4, 1fr)", marginTop: "1.5rem" }}>
            {Object.entries(skillCategoryLabels).map(([key, label]) => (
              key !== "softSkills" && (skillCategories[key] || []).length > 0 ? (
                <div key={key} style={{ padding: "1rem", borderRadius: "1rem", background: "rgba(148,163,184,0.06)" }}>
                  <h4 style={{ color: "#f8fafc", margin: "0 0 0.75rem", fontSize: "0.95rem" }}>{label}</h4>
                  <p style={{ color: "#94a3b8", margin: 0, lineHeight: 1.6 }}>{skillCategories[key].join(", ")}</p>
                </div>
              ) : null
            ))}
          </div>
        </div>
      )}

      {analysis && (
        <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "1fr 1fr" }}>
          <div style={{ padding: "2rem", borderRadius: "1.5rem", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(148,163,184,0.12)" }}>
            <h3 style={{ color: "#fff", marginBottom: "1rem" }}>Resume Score</h3>
            <div style={{ fontSize: "3rem", fontWeight: 700, color: "#fff" }}>{analysis.score}%</div>
            <div style={{ display: "grid", gap: "0.65rem", marginTop: "1.25rem" }}>
              {Object.entries(analysis.scoreBreakdown || {}).map(([key, value]) => (
                <div key={key} style={{ display: "flex", justifyContent: "space-between", gap: "1rem", color: "#cbd5e1", fontSize: "0.95rem" }}>
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
            <ul style={{ color: "#cbd5e1", paddingLeft: "1.25rem" }}>
              {(analysis.suggestions || []).map((suggestion, index) => (
                <li key={index} style={{ marginBottom: "0.75rem" }}>
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {resumes.length > 0 && (
        <div style={{ padding: "2rem", borderRadius: "1.5rem", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(148,163,184,0.12)" }}>
          <h3 style={{ color: "#fff", marginBottom: "1rem" }}>Uploaded Resumes</h3>
          <div style={{ display: "grid", gap: "1rem" }}>
            {resumes.map((resume) => (
              <div key={resume._id} style={{ padding: "1rem", borderRadius: "1rem", background: "rgba(148,163,184,0.06)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <p style={{ color: "#f8fafc", margin: 0 }}>{resume.fileName}</p>
                  <span style={{ color: "#94a3b8", fontSize: "0.9rem" }}>{new Date(resume.uploadedAt).toLocaleDateString()}</span>
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
                      style={{
                        padding: "0.35rem 0.65rem",
                        borderRadius: "999px",
                        background: "rgba(99,102,241,0.16)",
                        color: "#e0e7ff",
                        fontSize: "0.9rem",
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
                {resume.recommendedRole && (
                  <p style={{ color: "#bbf7d0", margin: "0.75rem 0 0", fontSize: "0.9rem" }}>Recommended Role: {resume.recommendedRole}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
