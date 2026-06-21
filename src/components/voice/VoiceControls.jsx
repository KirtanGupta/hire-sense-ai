"use client";

// ─── VoiceControls — Mode Toggle Component ────────────────────────────────────
// Renders a "📝 Text" / "🎤 Voice" toggle for switching input mode

export default function VoiceControls({ mode, onModeChange, isRecording }) {
  return (
    <div
      style={{
        display: "flex",
        gap: "0.5rem",
        marginBottom: "1rem",
        padding: "0.4rem",
        borderRadius: "0.9rem",
        background: "rgba(15,23,42,0.6)",
        border: "1px solid rgba(148,163,184,0.15)",
        width: "fit-content",
      }}
    >
      {/* Text Mode */}
      <button
        onClick={() => !isRecording && onModeChange("text")}
        disabled={isRecording}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.45rem",
          padding: "0.55rem 1.1rem",
          borderRadius: "0.65rem",
          border: "none",
          cursor: isRecording ? "not-allowed" : "pointer",
          fontSize: "0.88rem",
          fontWeight: 600,
          transition: "all 0.2s ease",
          background:
            mode === "text"
              ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
              : "transparent",
          color: mode === "text" ? "#fff" : "#64748b",
          boxShadow:
            mode === "text" ? "0 2px 8px rgba(99,102,241,0.4)" : "none",
        }}
      >
        📝 Text
      </button>

      {/* Voice Mode */}
      <button
        onClick={() => !isRecording && onModeChange("voice")}
        disabled={isRecording}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.45rem",
          padding: "0.55rem 1.1rem",
          borderRadius: "0.65rem",
          border: "none",
          cursor: isRecording ? "not-allowed" : "pointer",
          fontSize: "0.88rem",
          fontWeight: 600,
          transition: "all 0.2s ease",
          background:
            mode === "voice"
              ? "linear-gradient(135deg, #ec4899, #f43f5e)"
              : "transparent",
          color: mode === "voice" ? "#fff" : "#64748b",
          boxShadow:
            mode === "voice" ? "0 2px 8px rgba(236,72,153,0.4)" : "none",
        }}
      >
        🎤 Voice
      </button>
    </div>
  );
}
