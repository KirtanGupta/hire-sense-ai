import Link from "next/link";
import { RiBrainLine } from "react-icons/ri";

export const metadata = {
  title: "Login — HireSense AI",
  description: "Log in to your HireSense AI account and continue your interview practice journey.",
};

export default function LoginPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg-primary)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background */}
      <div
        style={{
          position: "absolute",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: "#6366f1",
          filter: "blur(120px)",
          opacity: 0.12,
          top: "-150px",
          right: "-100px",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          width: "100%",
          maxWidth: 440,
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "1.5rem",
          padding: "3rem 2.5rem",
          backdropFilter: "blur(16px)",
          boxShadow: "0 32px 80px rgba(0,0,0,0.4)",
          position: "relative",
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <Link href="/" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.6rem" }}>
            <div
              style={{
                width: 42,
                height: 42,
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                borderRadius: "0.75rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 20px rgba(99,102,241,0.4)",
              }}
            >
              <RiBrainLine size={22} color="#fff" />
            </div>
            <span
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700,
                fontSize: "1.2rem",
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
          <h1
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "1.6rem",
              fontWeight: 700,
              color: "#f1f5f9",
              marginTop: "1.5rem",
              marginBottom: "0.4rem",
            }}
          >
            Welcome back
          </h1>
          <p style={{ color: "#64748b", fontSize: "0.9rem" }}>
            Sign in to continue your journey
          </p>
        </div>

        {/* Placeholder notice */}
        <div
          style={{
            background: "rgba(99,102,241,0.1)",
            border: "1px solid rgba(99,102,241,0.25)",
            borderRadius: "0.75rem",
            padding: "1rem 1.25rem",
            marginBottom: "1.5rem",
            fontSize: "0.85rem",
            color: "#a5b4fc",
            textAlign: "center",
            lineHeight: 1.6,
          }}
        >
          🚧 Login functionality coming in Phase 2.
          <br />
          This is a placeholder page.
        </div>

        {/* Fake form */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <input className="input" type="email" placeholder="Email address" disabled />
          <input className="input" type="password" placeholder="Password" disabled />
          <button className="btn-primary" style={{ justifyContent: "center", padding: "0.85rem", opacity: 0.6, cursor: "not-allowed" }} disabled>
            Sign In
          </button>
        </div>

        <p style={{ textAlign: "center", marginTop: "1.5rem", color: "#64748b", fontSize: "0.875rem" }}>
          Don&apos;t have an account?{" "}
          <Link href="/register" style={{ color: "#a5b4fc", textDecoration: "none", fontWeight: 600 }}>
            Register
          </Link>
        </p>

        <p style={{ textAlign: "center", marginTop: "1rem" }}>
          <Link href="/" style={{ color: "#475569", textDecoration: "none", fontSize: "0.8rem" }}>
            ← Back to Home
          </Link>
        </p>
      </div>
    </div>
  );
}
