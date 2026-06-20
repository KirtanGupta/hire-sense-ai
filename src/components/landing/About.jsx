"use client";
import { FiTarget, FiUsers, FiZap } from "react-icons/fi";

const highlights = [
  {
    icon: <FiTarget size={24} />,
    title: "Our Mission",
    description:
      "Help every job seeker practice smarter with AI-driven interviews that feel real and deliver actionable feedback.",
    color: "#6366f1",
  },
  {
    icon: <FiUsers size={24} />,
    title: "Who We Serve",
    description:
      "Students, fresh graduates, and professionals preparing for technical and non-technical roles across industries.",
    color: "#8b5cf6",
  },
  {
    icon: <FiZap size={24} />,
    title: "What We Offer",
    description:
      "Resume parsing, role-based questions, voice interviews, scoring, and detailed reports — all powered by Groq AI.",
    color: "#06b6d4",
  },
];

export default function About() {
  return (
    <section id="about" className="section" style={{ position: "relative" }}>
      <div
        className="glow-orb"
        style={{
          width: 450,
          height: 450,
          background: "#8b5cf6",
          right: "-120px",
          top: "10%",
          opacity: 0.1,
        }}
      />

      <div className="container" style={{ position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <div className="section-badge" style={{ display: "inline-flex" }}>
            About Us
          </div>
          <h2 className="heading-lg" style={{ color: "#f1f5f9", marginBottom: "1rem" }}>
            Built for the{" "}
            <span className="text-gradient">Next Generation</span>
          </h2>
          <p
            style={{
              color: "#64748b",
              fontSize: "1.05rem",
              maxWidth: "640px",
              margin: "0 auto",
              lineHeight: 1.75,
            }}
          >
            HireSense AI is an interview preparation platform that combines modern web
            technology with Groq-powered AI to simulate realistic hiring experiences. We believe
            great candidates deserve great preparation — without expensive coaching or rigid schedules.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "1.5rem",
          }}
          className="about-grid"
        >
          {highlights.map((item) => (
            <div key={item.title} className="card">
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: "1rem",
                  background: `${item.color}18`,
                  border: `1px solid ${item.color}30`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: item.color,
                  marginBottom: "1.25rem",
                }}
              >
                {item.icon}
              </div>
              <h3
                style={{
                  fontFamily: "var(--font-space-grotesk), 'Space Grotesk', sans-serif",
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  color: "#f1f5f9",
                  marginBottom: "0.65rem",
                }}
              >
                {item.title}
              </h3>
              <p style={{ color: "#64748b", fontSize: "0.9rem", lineHeight: 1.7 }}>
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .about-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
