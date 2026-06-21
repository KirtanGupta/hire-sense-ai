// ─── AdminStatCard — Reusable stat card for admin dashboard ──────────────────

export default function AdminStatCard({
  icon,
  title,
  value,
  description,
  accent = "#6366f1",
  trend,
  loading = false,
}) {
  return (
    <div
      style={{
        padding: "1.5rem 1.75rem",
        borderRadius: "1.25rem",
        background: "rgba(255,255,255,0.03)",
        border: `1px solid ${accent}20`,
        position: "relative",
        overflow: "hidden",
        transition: "transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-3px)";
        e.currentTarget.style.borderColor = `${accent}45`;
        e.currentTarget.style.boxShadow = `0 8px 32px ${accent}18`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.borderColor = `${accent}20`;
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: "absolute",
          top: -20,
          right: -20,
          width: 100,
          height: 100,
          borderRadius: "50%",
          background: accent,
          opacity: 0.06,
          filter: "blur(30px)",
          pointerEvents: "none",
        }}
      />

      {/* Icon + Title row */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: "1rem",
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: "0.85rem",
            background: `${accent}18`,
            border: `1px solid ${accent}30`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.25rem",
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
        {trend != null && (
          <span
            style={{
              fontSize: "0.78rem",
              fontWeight: 700,
              color: trend >= 0 ? "#4ade80" : "#f87171",
              background: trend >= 0 ? "rgba(34,197,94,0.1)" : "rgba(248,113,113,0.1)",
              border: `1px solid ${trend >= 0 ? "rgba(34,197,94,0.25)" : "rgba(248,113,113,0.25)"}`,
              padding: "0.2rem 0.55rem",
              borderRadius: "999px",
            }}
          >
            {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}%
          </span>
        )}
      </div>

      {/* Value */}
      {loading ? (
        <div
          style={{
            width: "50%",
            height: "2rem",
            borderRadius: "0.5rem",
            background: "rgba(148,163,184,0.08)",
            marginBottom: "0.5rem",
            animation: "adminPulse 1.5s ease-in-out infinite",
          }}
        />
      ) : (
        <p
          style={{
            color: "#f8fafc",
            fontSize: "2rem",
            fontWeight: 800,
            margin: "0 0 0.25rem",
            letterSpacing: "-0.03em",
            lineHeight: 1,
          }}
        >
          {value}
        </p>
      )}

      {/* Title */}
      <p style={{ color: "#94a3b8", fontSize: "0.88rem", fontWeight: 500, margin: "0 0 0.2rem" }}>
        {title}
      </p>

      {/* Description */}
      {description && (
        <p style={{ color: "#475569", fontSize: "0.78rem", margin: 0 }}>{description}</p>
      )}

      <style>{`
        @keyframes adminPulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}
