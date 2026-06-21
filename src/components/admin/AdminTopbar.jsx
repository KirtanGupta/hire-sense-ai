"use client";

// ─── Admin Topbar ─────────────────────────────────────────────────────────────

export default function AdminTopbar({ title, subtitle }) {
  const now = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "2.25rem",
        flexWrap: "wrap",
        gap: "1rem",
      }}
    >
      {/* Left — Title */}
      <div>
        <h1
          style={{
            color: "#f8fafc",
            fontSize: "1.65rem",
            fontWeight: 800,
            margin: 0,
            letterSpacing: "-0.02em",
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <p style={{ color: "#64748b", fontSize: "0.88rem", marginTop: "0.3rem", margin: 0 }}>
            {subtitle}
          </p>
        )}
      </div>

      {/* Right — Admin badge + date */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <p style={{ color: "#475569", fontSize: "0.82rem", margin: 0 }}>{now}</p>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.45rem 1rem",
            borderRadius: "999px",
            background: "rgba(99,102,241,0.12)",
            border: "1px solid rgba(99,102,241,0.25)",
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#4ade80",
              display: "inline-block",
              boxShadow: "0 0 6px rgba(74,222,128,0.6)",
            }}
          />
          <span style={{ color: "#a5b4fc", fontSize: "0.82rem", fontWeight: 600 }}>
            Admin
          </span>
        </div>
      </div>
    </div>
  );
}
