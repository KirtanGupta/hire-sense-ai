"use client";
import {
  SiNextdotjs,
  SiReact,
  SiMongodb,
  SiJsonwebtokens,
  SiTailwindcss,
} from "react-icons/si";
import { FiCpu, FiMessageCircle } from "react-icons/fi";

const technologies = [
  {
    name: "Next.js",
    icon: <SiNextdotjs size={36} />,
    description: "Full-stack React framework for production-grade web apps",
    color: "#f1f5f9",
    category: "Frontend",
  },
  {
    name: "React",
    icon: <SiReact size={36} />,
    description: "Component-based UI library with reactive state management",
    color: "#61DAFB",
    category: "Frontend",
  },
  {
    name: "MongoDB",
    icon: <SiMongodb size={36} />,
    description: "Flexible NoSQL database for users, sessions, and reports",
    color: "#47A248",
    category: "Database",
  },
  {
    name: "Groq AI",
    icon: <FiCpu size={36} />,
    description: "Fast AI inference for evaluation and feedback",
    color: "#8B5CF6",
    category: "AI",
  },
  {
    name: "NLP",
    icon: <FiMessageCircle size={36} />,
    description: "Natural Language Processing for voice & text understanding",
    color: "#06b6d4",
    category: "AI",
  },
  {
    name: "JWT Auth",
    icon: <SiJsonwebtokens size={36} />,
    description: "Secure token-based authentication and session management",
    color: "#f59e0b",
    category: "Security",
  },
  {
    name: "Tailwind CSS",
    icon: <SiTailwindcss size={36} />,
    description: "Utility-first CSS framework for rapid UI development",
    color: "#38BDF8",
    category: "Styling",
  },
];

const categoryColors = {
  Frontend: "#6366f1",
  Database: "#10b981",
  AI: "#8b5cf6",
  Security: "#f59e0b",
  Styling: "#06b6d4",
};

export default function TechStack() {
  return (
    <section
      id="tech"
      className="section"
      style={{
        position: "relative",
        background: "linear-gradient(180deg, transparent, rgba(13,17,23,0.6), transparent)",
      }}
    >
      <div
        className="glow-orb"
        style={{
          width: 500,
          height: 500,
          background: "#06b6d4",
          right: "-100px",
          top: "10%",
          opacity: 0.08,
        }}
      />

      <div className="container" style={{ position: "relative", zIndex: 1 }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <div className="section-badge" style={{ display: "inline-flex" }}>
            🛠️ Tech Stack
          </div>
          <h2 className="heading-lg" style={{ color: "#f1f5f9", marginBottom: "1rem" }}>
            Built with{" "}
            <span className="text-gradient">Modern Technologies</span>
          </h2>
          <p style={{ color: "#64748b", fontSize: "1.05rem", maxWidth: "480px", margin: "0 auto" }}>
            Powered by the best tools in the industry to deliver a fast, reliable, and intelligent experience.
          </p>
        </div>

        {/* Tech Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "1.25rem",
          }}
          className="tech-grid"
        >
          {technologies.map((tech) => (
            <div
              key={tech.name}
              className="card"
              style={{ padding: "1.75rem 1.5rem", textAlign: "center" }}
            >
              {/* Category pill */}
              <div
                style={{
                  display: "inline-flex",
                  padding: "0.2rem 0.6rem",
                  borderRadius: "100px",
                  background: `${categoryColors[tech.category]}18`,
                  border: `1px solid ${categoryColors[tech.category]}30`,
                  color: categoryColors[tech.category],
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginBottom: "1.1rem",
                }}
              >
                {tech.category}
              </div>

              {/* Icon */}
              <div
                style={{
                  color: tech.color,
                  display: "flex",
                  justifyContent: "center",
                  marginBottom: "1rem",
                  filter: `drop-shadow(0 0 12px ${tech.color}50)`,
                  transition: "all 0.3s",
                }}
                className="tech-icon"
              >
                {tech.icon}
              </div>

              <h3
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: "1rem",
                  fontWeight: 600,
                  color: "#f1f5f9",
                  marginBottom: "0.5rem",
                }}
              >
                {tech.name}
              </h3>
              <p style={{ color: "#64748b", fontSize: "0.8rem", lineHeight: 1.6 }}>
                {tech.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .tech-grid {
            grid-template-columns: repeat(3, 1fr) !important;
          }
        }
        @media (max-width: 700px) {
          .tech-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 440px) {
          .tech-grid {
            grid-template-columns: 1fr !important;
          }
        }
        .card:hover .tech-icon {
          transform: scale(1.2) translateY(-4px);
        }
      `}</style>
    </section>
  );
}
