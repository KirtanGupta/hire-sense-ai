"use client";

/**
 * Phase 9.3 — Empty States
 * Reusable empty state component with icon, title, description, and CTA
 */

import { useRouter } from "next/navigation";

export default function EmptyState({
  icon = "📋",
  title = "Nothing Here Yet",
  description = "Get started by creating your first item.",
  actionLabel = null,
  actionHref = null,
  onAction = null,
  secondaryLabel = null,
  secondaryHref = null,
  animate = true,
}) {
  const router = useRouter();

  function handleAction() {
    if (onAction) return onAction();
    if (actionHref) return router.push(actionHref);
  }

  function handleSecondary() {
    if (secondaryHref) router.push(secondaryHref);
  }

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "4rem 2rem",
      borderRadius: "1.75rem",
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(148,163,184,0.1)",
      textAlign: "center",
      animation: animate ? "fadeInUp 0.5s ease forwards" : "none",
    }}>
      {/* Animated icon */}
      <div style={{
        fontSize: "4rem",
        marginBottom: "1.5rem",
        filter: "drop-shadow(0 0 24px rgba(99,102,241,0.4))",
        animation: "floatIcon 3s ease-in-out infinite",
      }}>
        {icon}
      </div>

      {/* Decorative ring */}
      <div style={{
        position: "relative",
        marginBottom: "0.5rem",
      }}>
        <div style={{
          position: "absolute",
          inset: "-1.5rem",
          borderRadius: "50%",
          border: "1px solid rgba(99,102,241,0.12)",
          animation: "ringPulse 3s ease-in-out infinite",
          pointerEvents: "none",
        }} />
      </div>

      <h3 style={{
        color: "#f8fafc",
        fontSize: "1.35rem",
        fontWeight: 700,
        margin: "0 0 0.75rem",
        fontFamily: "var(--font-space-grotesk, sans-serif)",
      }}>
        {title}
      </h3>

      <p style={{
        color: "#94a3b8",
        fontSize: "0.95rem",
        lineHeight: 1.7,
        maxWidth: 380,
        margin: "0 0 2rem",
      }}>
        {description}
      </p>

      {/* CTA Buttons */}
      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", justifyContent: "center" }}>
        {actionLabel && (
          <button
            onClick={handleAction}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.85rem 1.75rem",
              borderRadius: "0.9rem",
              border: "none",
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              color: "#fff",
              fontSize: "0.95rem",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 4px 20px rgba(99,102,241,0.35)",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 8px 28px rgba(99,102,241,0.5)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 20px rgba(99,102,241,0.35)";
            }}
          >
            🚀 {actionLabel}
          </button>
        )}

        {secondaryLabel && (
          <button
            onClick={handleSecondary}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.85rem 1.75rem",
              borderRadius: "0.9rem",
              border: "1px solid rgba(148,163,184,0.2)",
              background: "transparent",
              color: "#94a3b8",
              fontSize: "0.95rem",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(148,163,184,0.06)";
              e.currentTarget.style.borderColor = "rgba(148,163,184,0.35)";
              e.currentTarget.style.color = "#f8fafc";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.borderColor = "rgba(148,163,184,0.2)";
              e.currentTarget.style.color = "#94a3b8";
            }}
          >
            {secondaryLabel}
          </button>
        )}
      </div>

      <style>{`
        @keyframes floatIcon {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes ringPulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0; transform: scale(1.3); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
