"use client";
import { FiX, FiCheck } from "react-icons/fi";

const rows = [
  {
    feature: "Evaluation Method",
    traditional: "Manual Evaluation",
    hiresense: "AI Evaluation",
    traditionalBad: true,
  },
  {
    feature: "Question Bank",
    traditional: "Limited Questions",
    hiresense: "Unlimited Questions",
    traditionalBad: true,
  },
  {
    feature: "Answer Mode",
    traditional: "No Voice Support",
    hiresense: "Voice + Text",
    traditionalBad: true,
  },
  {
    feature: "Feedback Quality",
    traditional: "Generic Feedback",
    hiresense: "Personalized Feedback",
    traditionalBad: true,
  },
  {
    feature: "Availability",
    traditional: "Scheduled Only",
    hiresense: "24/7 On-Demand",
    traditionalBad: true,
  },
  {
    feature: "Cost",
    traditional: "Expensive",
    hiresense: "Affordable",
    traditionalBad: true,
  },
];

export default function WhyChooseUs() {
  return (
    <section id="why-us" className="section" style={{ position: "relative" }}>
      <div
        className="glow-orb"
        style={{
          width: 450,
          height: 450,
          background: "#6366f1",
          left: "30%",
          bottom: "10%",
          opacity: 0.08,
        }}
      />

      <div className="container" style={{ position: "relative", zIndex: 1 }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <div className="section-badge" style={{ display: "inline-flex" }}>
            ⚡ Why Choose Us
          </div>
          <h2 className="heading-lg" style={{ color: "#f1f5f9", marginBottom: "1rem" }}>
            Traditional vs.{" "}
            <span className="text-gradient">HireSense AI</span>
          </h2>
          <p style={{ color: "#64748b", fontSize: "1.05rem", maxWidth: "480px", margin: "0 auto" }}>
            See why thousands of job seekers choose HireSense AI over traditional mock interview platforms.
          </p>
        </div>

        {/* Comparison Table */}
        <div
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "1.5rem",
            overflow: "hidden",
            backdropFilter: "blur(16px)",
          }}
          className="comparison-table"
        >
          {/* Table header */}
          <div
            className="comparison-header"
            style={{
              background: "rgba(255,255,255,0.04)",
              borderBottom: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <div
              style={{
                padding: "1.25rem 1.5rem",
                color: "#64748b",
                fontWeight: 600,
                fontSize: "0.85rem",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              Feature
            </div>
            <div
              style={{
                padding: "1.25rem 1.5rem",
                color: "#64748b",
                fontWeight: 600,
                fontSize: "0.85rem",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                borderLeft: "1px solid rgba(255,255,255,0.06)",
                textAlign: "center",
              }}
            >
              Traditional
            </div>
            <div
              style={{
                padding: "1.25rem 1.5rem",
                fontWeight: 700,
                fontSize: "0.85rem",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                textAlign: "center",
                borderLeft: "1px solid rgba(99,102,241,0.2)",
                background: "rgba(99,102,241,0.08)",
                color: "#a5b4fc",
              }}
            >
              🤖 HireSense AI
            </div>
          </div>

          {/* Rows */}
          {rows.map((row, i) => (
            <div
              key={row.feature}
              className="comparison-row"
              style={{
                borderBottom:
                  i < rows.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.02)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              <div
                className="comparison-feature"
                style={{
                  padding: "1.1rem 1.5rem",
                  color: "#94a3b8",
                  fontSize: "0.9rem",
                  fontWeight: 500,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {row.feature}
              </div>

              {/* Traditional */}
              <div
                className="comparison-traditional"
                style={{
                  padding: "1.1rem 1.5rem",
                  borderLeft: "1px solid rgba(255,255,255,0.04)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  color: "#ef4444",
                  fontSize: "0.875rem",
                }}
              >
                <div
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    background: "rgba(239,68,68,0.15)",
                    border: "1px solid rgba(239,68,68,0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <FiX size={11} />
                </div>
                {row.traditional}
              </div>

              {/* HireSense */}
              <div
                className="comparison-hiresense"
                style={{
                  padding: "1.1rem 1.5rem",
                  borderLeft: "1px solid rgba(99,102,241,0.15)",
                  background: "rgba(99,102,241,0.05)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  color: "#10b981",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                }}
              >
                <div
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    background: "rgba(16,185,129,0.15)",
                    border: "1px solid rgba(16,185,129,0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <FiCheck size={11} />
                </div>
                {row.hiresense}
              </div>
            </div>
          ))}
        </div>
      </div>

    </section>
  );
}
