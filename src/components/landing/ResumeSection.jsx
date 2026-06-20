"use client";
import Link from "next/link";
import { FiFileText, FiUpload, FiCpu, FiArrowRight } from "react-icons/fi";

const skills = ["React", "Node.js", "MongoDB", "JavaScript", "REST APIs", "Git"];

export default function ResumeSection() {
  return (
    <section
      id="resume"
      className="section"
      style={{
        position: "relative",
        background: "linear-gradient(180deg, transparent, rgba(13,17,23,0.5), transparent)",
      }}
    >
      <div className="container" style={{ position: "relative", zIndex: 1 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "4rem",
            alignItems: "center",
          }}
          className="resume-grid"
        >
          <div>
            <div className="section-badge">Resume Analysis</div>
            <h2 className="heading-lg" style={{ color: "#f1f5f9", marginBottom: "1rem" }}>
              Upload Once,{" "}
              <span className="text-gradient">Practice Smarter</span>
            </h2>
            <p style={{ color: "#64748b", fontSize: "1.05rem", lineHeight: 1.75, marginBottom: "2rem" }}>
              Upload your PDF or DOCX resume and let AI extract your skills automatically.
              Interview questions are tailored to your experience — no generic question banks.
            </p>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "2rem" }}>
              {[
                "Supports PDF and DOCX formats",
                "AI extracts skills, projects, and experience",
                "Questions matched to your profile",
              ].map((text) => (
                <li key={text} style={{ display: "flex", alignItems: "center", gap: "0.75rem", color: "#94a3b8", fontSize: "0.9rem" }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#6366f1", flexShrink: 0 }} />
                  {text}
                </li>
              ))}
            </ul>
            <Link href="/register" className="btn-primary">
              Upload Resume
              <FiArrowRight size={18} />
            </Link>
          </div>

          <div
            className="card"
            style={{ padding: "2rem", position: "relative" }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                marginBottom: "1.5rem",
                paddingBottom: "1rem",
                borderBottom: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "0.75rem",
                  background: "rgba(99,102,241,0.15)",
                  border: "1px solid rgba(99,102,241,0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#a5b4fc",
                }}
              >
                <FiFileText size={22} />
              </div>
              <div>
                <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "#f1f5f9" }}>resume_mern_dev.pdf</div>
                <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Parsed successfully</div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", color: "#94a3b8", fontSize: "0.85rem" }}>
                <FiUpload size={16} color="#6366f1" />
                Upload → Parse → Extract Text
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", color: "#94a3b8", fontSize: "0.85rem" }}>
                <FiCpu size={16} color="#8b5cf6" />
                Groq AI skill extraction
              </div>
            </div>

            <div style={{ marginTop: "1.5rem" }}>
              <div style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>
                Detected Skills
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {skills.map((skill) => (
                  <span key={skill} className="tag">{skill}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .resume-grid {
            grid-template-columns: 1fr !important;
            gap: 2.5rem !important;
          }
        }
      `}</style>
    </section>
  );
}
