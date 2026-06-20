"use client";
import Link from "next/link";
import { FiMic, FiMicOff, FiArrowRight } from "react-icons/fi";

const transcript = [
  { role: "ai", text: "What is the Virtual DOM in React?" },
  { role: "user", text: "It is a lightweight copy of the real DOM that React uses to optimize updates..." },
];

export default function VoiceInterviewSection() {
  return (
    <section id="voice-interview" className="section" style={{ position: "relative" }}>
      <div
        className="glow-orb"
        style={{
          width: 500,
          height: 500,
          background: "#6366f1",
          left: "-150px",
          bottom: "0",
          opacity: 0.1,
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
          className="voice-grid"
        >
          <div
            className="card animate-float"
            style={{ padding: "2rem", order: 1 }}
          >
            <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, rgba(99,102,241,0.3), rgba(139,92,246,0.2))",
                  border: "2px solid rgba(99,102,241,0.4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 1rem",
                  color: "#a5b4fc",
                  boxShadow: "0 0 40px rgba(99,102,241,0.3)",
                }}
                className="animate-pulse-glow"
              >
                <FiMic size={32} />
              </div>
              <div style={{ fontSize: "0.85rem", color: "#10b981", fontWeight: 600 }}>
                Recording... Speak naturally
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {transcript.map((line, i) => (
                <div
                  key={i}
                  style={{
                    padding: "0.85rem 1rem",
                    borderRadius: "0.75rem",
                    background: line.role === "ai" ? "rgba(99,102,241,0.1)" : "rgba(255,255,255,0.04)",
                    border: `1px solid ${line.role === "ai" ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.08)"}`,
                    fontSize: "0.85rem",
                    color: line.role === "ai" ? "#a5b4fc" : "#e2e8f0",
                    lineHeight: 1.6,
                  }}
                >
                  <span style={{ fontWeight: 700, fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: "0.25rem", color: "#64748b" }}>
                    {line.role === "ai" ? "AI Question" : "Your Answer"}
                  </span>
                  {line.text}
                </div>
              ))}
            </div>

            <div style={{ display: "flex", justifyContent: "center", gap: "1rem", marginTop: "1.5rem" }}>
              <button type="button" className="btn-primary" style={{ padding: "0.65rem 1.25rem", fontSize: "0.85rem" }} aria-label="Stop recording">
                <FiMicOff size={16} />
                Stop
              </button>
            </div>
          </div>

          <div style={{ order: 0 }}>
            <div className="section-badge">Voice Interview</div>
            <h2 className="heading-lg" style={{ color: "#f1f5f9", marginBottom: "1rem" }}>
              Real Interviews,{" "}
              <span className="text-gradient">Real Voice</span>
            </h2>
            <p style={{ color: "#64748b", fontSize: "1.05rem", lineHeight: 1.75, marginBottom: "2rem" }}>
              Use the Web Speech API to answer questions hands-free. Your speech is converted to
              text, sent for AI evaluation, and you receive instant feedback — just like a
              live interview.
            </p>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "2rem" }}>
              {[
                "Browser-based speech recognition",
                "Switch between voice and text anytime",
                "AI scores clarity, accuracy, and completeness",
              ].map((text) => (
                <li key={text} style={{ display: "flex", alignItems: "center", gap: "0.75rem", color: "#94a3b8", fontSize: "0.9rem" }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#8b5cf6", flexShrink: 0 }} />
                  {text}
                </li>
              ))}
            </ul>
            <Link href="/register" className="btn-primary">
              Try Voice Interview
              <FiArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .voice-grid {
            grid-template-columns: 1fr !important;
            gap: 2.5rem !important;
          }
          .voice-grid > div:first-child {
            order: 2 !important;
          }
          .voice-grid > div:last-child {
            order: 1 !important;
          }
        }
      `}</style>
    </section>
  );
}
