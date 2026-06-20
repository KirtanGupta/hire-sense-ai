"use client";
import { FiMic, FiFileText, FiCpu, FiBarChart2, FiTarget, FiTrendingUp } from "react-icons/fi";

const features = [
  {
    icon: <FiMic size={26} />,
    emoji: "🎤",
    title: "Voice Interview",
    description:
      "Answer questions using your voice for a fully realistic interview experience with speech-to-text transcription.",
    color: "#6366f1",
    gradient: "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(99,102,241,0.05))",
  },
  {
    icon: <FiFileText size={26} />,
    emoji: "📄",
    title: "Resume Analysis",
    description:
      "Upload your resume and receive AI-tailored interview questions that match your skills and experience.",
    color: "#8b5cf6",
    gradient: "linear-gradient(135deg, rgba(139,92,246,0.2), rgba(139,92,246,0.05))",
  },
  {
    icon: <FiCpu size={26} />,
    emoji: "🤖",
    title: "AI Evaluation",
    description:
      "Get instant scoring and detailed feedback powered by Groq AI for every answer you give.",
    color: "#06b6d4",
    gradient: "linear-gradient(135deg, rgba(6,182,212,0.2), rgba(6,182,212,0.05))",
  },
  {
    icon: <FiBarChart2 size={26} />,
    emoji: "📊",
    title: "Performance Reports",
    description:
      "Track your strengths, identify weaknesses, and monitor improvement areas with detailed analytics.",
    color: "#10b981",
    gradient: "linear-gradient(135deg, rgba(16,185,129,0.2), rgba(16,185,129,0.05))",
  },
  {
    icon: <FiTarget size={26} />,
    emoji: "🎯",
    title: "Role-Based Interviews",
    description:
      "Practice for MERN, Java, Python, Data Analyst, DevOps, and more with domain-specific questions.",
    color: "#f59e0b",
    gradient: "linear-gradient(135deg, rgba(245,158,11,0.2), rgba(245,158,11,0.05))",
  },
  {
    icon: <FiTrendingUp size={26} />,
    emoji: "📈",
    title: "Progress Tracking",
    description:
      "Monitor your interview performance over time and celebrate milestones on your journey to success.",
    color: "#ec4899",
    gradient: "linear-gradient(135deg, rgba(236,72,153,0.2), rgba(236,72,153,0.05))",
  },
];

export default function Features() {
  return (
    <section id="features" className="section" style={{ position: "relative" }}>
      {/* Background accent */}
      <div
        className="glow-orb"
        style={{
          width: 500,
          height: 500,
          background: "#8b5cf6",
          left: "-150px",
          top: "20%",
          opacity: 0.1,
        }}
      />

      <div className="container" style={{ position: "relative", zIndex: 1 }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <div className="section-badge" style={{ display: "inline-flex" }}>✨ Features</div>
          <h2 className="heading-lg" style={{ color: "#f1f5f9", marginBottom: "1rem" }}>
            Everything You Need to{" "}
            <span className="text-gradient">Ace Your Interview</span>
          </h2>
          <p
            style={{
              color: "#64748b",
              fontSize: "1.05rem",
              maxWidth: "520px",
              margin: "0 auto",
              lineHeight: 1.7,
            }}
          >
            A complete AI-powered toolkit designed to help you prepare, practice, and perform at your best.
          </p>
        </div>

        {/* Cards Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "1.5rem",
          }}
          className="features-grid"
        >
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className="card"
              style={{
                animationDelay: `${i * 0.1}s`,
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Icon */}
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "1rem",
                  background: feature.gradient,
                  border: `1px solid ${feature.color}30`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: feature.color,
                  marginBottom: "1.25rem",
                  fontSize: "1.5rem",
                  transition: "transform 0.3s",
                }}
                className="feature-icon"
              >
                {feature.icon}
              </div>

              <h3
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  color: "#f1f5f9",
                  marginBottom: "0.65rem",
                }}
              >
                {feature.emoji} {feature.title}
              </h3>
              <p style={{ color: "#64748b", fontSize: "0.9rem", lineHeight: 1.7 }}>
                {feature.description}
              </p>

              {/* Corner accent line */}
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: 2,
                  background: `linear-gradient(90deg, ${feature.color}, transparent)`,
                  opacity: 0,
                  transition: "opacity 0.3s",
                }}
                className="card-line"
              />
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .features-grid {
        }
        @media (max-width: 1024px) {
          .features-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 640px) {
          .features-grid {
            grid-template-columns: 1fr !important;
          }
        }
        .card:hover .card-line {
          opacity: 1 !important;
        }
        .card:hover .feature-icon {
          transform: scale(1.1) rotate(-3deg);
        }
      `}</style>
    </section>
  );
}
