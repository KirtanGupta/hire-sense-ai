"use client";
import { FiUpload, FiBriefcase, FiMessageSquare, FiAward } from "react-icons/fi";

const steps = [
  {
    number: "01",
    icon: <FiUpload size={28} />,
    title: "Upload Resume",
    description:
      "Upload your PDF or DOCX resume. Our AI parses your skills, experience, and projects to craft relevant questions.",
    color: "#6366f1",
  },
  {
    number: "02",
    icon: <FiBriefcase size={28} />,
    title: "Select Job Role",
    description:
      "Choose your target role — MERN Developer, Data Analyst, Java Engineer, and many more.",
    color: "#8b5cf6",
  },
  {
    number: "03",
    icon: <FiMessageSquare size={28} />,
    title: "Attend Interview",
    description:
      "Answer questions via voice or text in a realistic interview simulation. Take your time, just like a real interview.",
    color: "#06b6d4",
  },
  {
    number: "04",
    icon: <FiAward size={28} />,
    title: "Get AI Feedback",
    description:
      "Receive instant scores, detailed feedback, and improvement tips powered by Groq AI after each session.",
    color: "#10b981",
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="section"
      style={{
        position: "relative",
        background:
          "linear-gradient(180deg, transparent 0%, rgba(13,17,23,0.8) 50%, transparent 100%)",
      }}
    >
      {/* Glow orb */}
      <div
        className="glow-orb"
        style={{
          width: 500,
          height: 500,
          background: "#06b6d4",
          right: "-100px",
          top: "30%",
          opacity: 0.1,
        }}
      />

      <div className="container" style={{ position: "relative", zIndex: 1 }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "5rem" }}>
          <div className="section-badge" style={{ display: "inline-flex" }}>
            🚀 How It Works
          </div>
          <h2 className="heading-lg" style={{ color: "#f1f5f9", marginBottom: "1rem" }}>
            Four Steps to{" "}
            <span className="text-gradient">Interview Success</span>
          </h2>
          <p style={{ color: "#64748b", fontSize: "1.05rem", maxWidth: "480px", margin: "0 auto" }}>
            Get started in minutes and receive AI-powered coaching that adapts to you.
          </p>
        </div>

        {/* Steps */}
        <div style={{ position: "relative" }}>
          {/* Connecting line */}
          <div
            style={{
              position: "absolute",
              top: "42px",
              left: "calc(12.5% + 28px)",
              right: "calc(12.5% + 28px)",
              height: 2,
              background:
                "linear-gradient(90deg, #6366f1, #8b5cf6, #06b6d4, #10b981)",
              zIndex: 0,
              opacity: 0.4,
            }}
            className="steps-connector"
          />

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "2rem",
              position: "relative",
              zIndex: 1,
            }}
            className="steps-grid"
          >
            {steps.map((step, i) => (
              <div
                key={step.number}
                style={{ textAlign: "center" }}
              >
                {/* Circle */}
                <div
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    background: `linear-gradient(135deg, ${step.color}20, ${step.color}08), #050816`,
                    border: `2px solid ${step.color}50`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 1.75rem",
                    color: step.color,
                    position: "relative",
                    boxShadow: `0 0 30px ${step.color}25`,
                    transition: "all 0.3s",
                  }}
                  className="step-circle"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = `0 0 50px ${step.color}50`;
                    e.currentTarget.style.transform = "scale(1.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = `0 0 30px ${step.color}25`;
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                >
                  {step.icon}
                  {/* Number badge */}
                  <div
                    style={{
                      position: "absolute",
                      top: -8,
                      right: -8,
                      width: 26,
                      height: 26,
                      borderRadius: "50%",
                      background: step.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.7rem",
                      fontWeight: 800,
                      color: "#fff",
                      fontFamily: "'Space Grotesk', sans-serif",
                    }}
                  >
                    {i + 1}
                  </div>
                </div>

                <div
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    letterSpacing: "0.12em",
                    color: step.color,
                    textTransform: "uppercase",
                    marginBottom: "0.4rem",
                  }}
                >
                  Step {step.number}
                </div>
                <h3
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: "1.15rem",
                    fontWeight: 600,
                    color: "#f1f5f9",
                    marginBottom: "0.75rem",
                  }}
                >
                  {step.title}
                </h3>
                <p
                  style={{
                    color: "#64748b",
                    fontSize: "0.875rem",
                    lineHeight: 1.7,
                  }}
                >
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .steps-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .steps-connector {
            display: none !important;
          }
        }
        @media (max-width: 540px) {
          .steps-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
