"use client";
import Link from "next/link";
import { FiPlay, FiArrowRight, FiMic, FiUser, FiCpu, FiStar } from "react-icons/fi";

const flowSteps = [
  { icon: <FiUser size={16} />, label: "Candidate", color: "#6366f1" },
  { icon: <FiMic size={16} />, label: "Voice / Text Answer", color: "#8b5cf6" },
  { icon: <FiCpu size={16} />, label: "AI Evaluation", color: "#06b6d4" },
  { icon: <FiStar size={16} />, label: "Personalized Feedback", color: "#10b981" },
];

export default function Hero() {
  return (
    <section
      id="home"
      className="section"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        paddingTop: "7rem",
        paddingBottom: "5rem",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background grid */}
      <div
        className="grid-pattern"
        style={{ position: "absolute", inset: 0, opacity: 0.4 }}
      />

      {/* Glow orbs */}
      <div
        className="glow-orb"
        style={{
          width: 600,
          height: 600,
          background: "#6366f1",
          top: "-150px",
          right: "-100px",
          opacity: 0.2,
        }}
      />
      <div
        className="glow-orb"
        style={{
          width: 400,
          height: 400,
          background: "#06b6d4",
          bottom: "-100px",
          left: "10%",
          opacity: 0.12,
        }}
      />

      <div className="container" style={{ position: "relative", zIndex: 1 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "4rem",
            alignItems: "center",
          }}
          className="hero-grid"
        >
          {/* ─── Left Content ─── */}
          <div style={{ animation: "fadeInUp 0.8s ease both" }}>
            {/* Badge */}
            <div className="section-badge" style={{ marginBottom: "1.5rem" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#6366f1", display: "inline-block" }} />
              AI-Powered Interview Platform
            </div>

            {/* Headline */}
            <h1
              className="heading-xl"
              style={{ marginBottom: "1.25rem", color: "#f1f5f9" }}
            >
              Practice{" "}
              <span className="text-gradient">Smarter.</span>
              <br />
              Get Hired{" "}
              <span
                style={{
                  position: "relative",
                  display: "inline-block",
                }}
              >
                <span className="text-gradient">Faster.</span>
                <svg
                  style={{
                    position: "absolute",
                    bottom: "-8px",
                    left: 0,
                    width: "100%",
                  }}
                  viewBox="0 0 200 12"
                  preserveAspectRatio="none"
                  height="12"
                >
                  <path
                    d="M0,10 Q50,0 100,8 Q150,16 200,6"
                    fill="none"
                    stroke="url(#heroUnderline)"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="heroUnderline" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                  </defs>
                </svg>
              </span>
            </h1>

            {/* Subheading */}
            <p
              style={{
                fontSize: "1.15rem",
                color: "#94a3b8",
                lineHeight: 1.75,
                marginBottom: "2.5rem",
                maxWidth: "480px",
              }}
            >
              AI-powered mock interviews with{" "}
              <strong style={{ color: "#a5b4fc" }}>voice recognition</strong>,{" "}
              <strong style={{ color: "#a5b4fc" }}>resume analysis</strong>, and{" "}
              <strong style={{ color: "#a5b4fc" }}>personalized feedback</strong> — all in one platform.
            </p>

            {/* CTA Buttons */}
            <div
              style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "3rem" }}
            >
              <Link href="/register" className="btn-primary" style={{ fontSize: "1rem", padding: "0.9rem 2rem" }}>
                Start Interview
                <FiArrowRight size={18} />
              </Link>
              <a
                href="#how-it-works"
                className="btn-secondary"
                style={{ fontSize: "1rem", padding: "0.9rem 2rem" }}
              >
                <FiPlay size={16} style={{ fill: "currentColor" }} />
                Watch Demo
              </a>
            </div>

            {/* Trust indicators */}
            <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
              {[
                { value: "10K+", label: "Mock Interviews" },
                { value: "95%", label: "Satisfaction Rate" },
                { value: "50+", label: "Job Roles" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: "1.6rem",
                      fontWeight: 700,
                      background: "linear-gradient(135deg,#6366f1,#06b6d4)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    {stat.value}
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "#64748b" }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ─── Right: Flow Illustration ─── */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              animation: "fadeInUp 0.8s 0.2s ease both",
            }}
          >
            <div
              className="animate-float"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(99,102,241,0.2)",
                borderRadius: "2rem",
                padding: "2.5rem 2rem",
                width: "340px",
                backdropFilter: "blur(20px)",
                position: "relative",
                boxShadow: "0 32px 80px rgba(0,0,0,0.5), 0 0 60px rgba(99,102,241,0.15)",
              }}
            >
              {/* Decorative top bar */}
              <div
                style={{
                  display: "flex",
                  gap: "6px",
                  marginBottom: "2rem",
                  paddingBottom: "1rem",
                  borderBottom: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                {["#ef4444", "#f59e0b", "#10b981"].map((c) => (
                  <div
                    key={c}
                    style={{ width: 12, height: 12, borderRadius: "50%", background: c }}
                  />
                ))}
                <span style={{ marginLeft: "auto", fontSize: "0.75rem", color: "#64748b" }}>
                  HireSense AI
                </span>
              </div>

              {/* Flow Steps */}
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {flowSteps.map((step, i) => (
                  <div key={step.label}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                        padding: "1rem 1.1rem",
                        borderRadius: "1rem",
                        background: `rgba(${
                          step.color === "#6366f1"
                            ? "99,102,241"
                            : step.color === "#8b5cf6"
                            ? "139,92,246"
                            : step.color === "#06b6d4"
                            ? "6,182,212"
                            : "16,185,129"
                        }, 0.1)`,
                        border: `1px solid ${step.color}30`,
                        transition: "all 0.3s",
                      }}
                    >
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: "0.65rem",
                          background: `${step.color}25`,
                          border: `1px solid ${step.color}50`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: step.color,
                          flexShrink: 0,
                        }}
                      >
                        {step.icon}
                      </div>
                      <span style={{ color: "#e2e8f0", fontWeight: 500, fontSize: "0.9rem" }}>
                        {step.label}
                      </span>
                      <div
                        style={{
                          marginLeft: "auto",
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: step.color,
                          boxShadow: `0 0 8px ${step.color}`,
                        }}
                      />
                    </div>

                    {/* Connector arrow */}
                    {i < flowSteps.length - 1 && (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          padding: "0.4rem 0",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: "2px",
                          }}
                        >
                          <div
                            style={{
                              width: 2,
                              height: 16,
                              background:
                                "linear-gradient(to bottom, rgba(99,102,241,0.6), rgba(6,182,212,0.4))",
                            }}
                          />
                          <svg width="10" height="6" viewBox="0 0 10 6">
                            <path
                              d="M0 0 L5 6 L10 0"
                              fill="none"
                              stroke="#6366f1"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Bottom accent */}
              <div
                style={{
                  marginTop: "1.5rem",
                  paddingTop: "1rem",
                  borderTop: "1px solid rgba(255,255,255,0.07)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "#10b981",
                    boxShadow: "0 0 8px #10b981",
                    animation: "pulse-glow 2s ease-in-out infinite",
                  }}
                />
                <span style={{ fontSize: "0.8rem", color: "#64748b" }}>
                  Powered by Groq AI
                </span>
              </div>

              {/* Corner decoration */}
              <div
                style={{
                  position: "absolute",
                  top: -1,
                  right: 40,
                  width: 80,
                  height: 3,
                  background: "linear-gradient(90deg, #6366f1, #06b6d4)",
                  borderRadius: "0 0 4px 4px",
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Responsive style */}
      <style>{`
        @media (max-width: 768px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
            gap: 3rem !important;
            text-align: center;
          }
          .hero-grid > div:first-child .section-badge {
            margin-left: auto;
            margin-right: auto;
          }
          .hero-grid > div:first-child p {
            margin-left: auto;
            margin-right: auto;
          }
          .hero-grid > div:first-child > div {
            justify-content: center;
          }
        }
      `}</style>
    </section>
  );
}
