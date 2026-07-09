"use client";
import Link from "next/link";
import { FiGithub, FiTwitter, FiLinkedin, FiCpu } from "react-icons/fi";
import { RiBrainLine } from "react-icons/ri";
import { SiNextdotjs, SiMongodb } from "react-icons/si";

const footerLinks = {
  Product: [
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Resume Analysis", href: "#resume" },
    { label: "Voice Interview", href: "#voice-interview" },
    { label: "Tech Stack", href: "#tech" },
  ],
  Company: [
    { label: "About Us", href: "#about" },
    { label: "FAQ", href: "#faq" },
    { label: "Contact", href: "#contact" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "#contact" },
    { label: "Terms of Service", href: "#contact" },
    { label: "Cookie Policy", href: "#contact" },
  ],
};

export default function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid rgba(99,102,241,0.12)",
        background: "rgba(5,8,22,0.95)",
        paddingTop: "4rem",
        paddingBottom: "2rem",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Top glow */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "60%",
          height: 1,
          background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.5), transparent)",
        }}
      />

      <div className="container">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr 1fr",
            gap: "3rem",
            marginBottom: "3rem",
          }}
          className="footer-grid"
        >
          {/* Brand */}
          <div>
            <Link
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.6rem",
                textDecoration: "none",
                marginBottom: "1.25rem",
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  borderRadius: "0.55rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 0 14px rgba(99,102,241,0.35)",
                }}
              >
                <RiBrainLine size={18} color="#fff" />
              </div>
              <span
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 700,
                  fontSize: "1.1rem",
                  color: "#f1f5f9",
                }}
              >
                HireSense{" "}
                <span
                  style={{
                    background: "linear-gradient(135deg,#6366f1,#06b6d4)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  AI
                </span>
              </span>
            </Link>

            <p style={{ color: "#64748b", fontSize: "0.875rem", lineHeight: 1.75, maxWidth: "280px", marginBottom: "1.5rem" }}>
              Practice smarter. Get hired faster. The AI-powered mock interview platform built for the next generation of professionals.
            </p>

            {/* Built with */}
            <div style={{ marginBottom: "1.5rem" }}>
              <div style={{ fontSize: "0.75rem", color: "#475569", marginBottom: "0.6rem", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>
                Built with
              </div>
              <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                {[
                  { icon: <SiNextdotjs size={18} />, label: "Next.js", color: "#f1f5f9" },
                  { icon: <SiMongodb size={18} />, label: "MongoDB", color: "#47A248" },
                  { icon: <FiCpu size={18} />, label: "Gemini AI", color: "#8b5cf6" },
                ].map((tech) => (
                  <div
                    key={tech.label}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.35rem",
                      padding: "0.3rem 0.7rem",
                      borderRadius: "100px",
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.07)",
                      color: tech.color,
                      fontSize: "0.75rem",
                      fontWeight: 500,
                    }}
                  >
                    {tech.icon}
                    {tech.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Social */}
            <div style={{ display: "flex", gap: "0.75rem" }}>
              {[
                { icon: <FiGithub size={17} />, href: "https://github.com", label: "GitHub" },
                { icon: <FiTwitter size={17} />, href: "https://twitter.com", label: "Twitter" },
                { icon: <FiLinkedin size={17} />, href: "https://linkedin.com", label: "LinkedIn" },
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "0.5rem",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#64748b",
                    transition: "all 0.2s",
                    textDecoration: "none",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(99,102,241,0.15)";
                    e.currentTarget.style.borderColor = "rgba(99,102,241,0.3)";
                    e.currentTarget.style.color = "#a5b4fc";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                    e.currentTarget.style.color = "#64748b";
                  }}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h4
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  color: "#94a3b8",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  marginBottom: "1.1rem",
                }}
              >
                {section}
              </h4>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.55rem" }}>
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      style={{
                        color: "#64748b",
                        textDecoration: "none",
                        fontSize: "0.875rem",
                        transition: "color 0.2s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "#a5b4fc")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "#64748b")}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.06)",
            paddingTop: "1.75rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <p style={{ color: "#475569", fontSize: "0.8rem" }}>
            © 2026 HireSense AI. All rights reserved.
          </p>
          <p style={{ color: "#475569", fontSize: "0.8rem" }}>
            Made with ❤️ for job seekers everywhere.
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (max-width: 560px) {
          .footer-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </footer>
  );
}
