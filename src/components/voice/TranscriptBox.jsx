"use client";

// ─── TranscriptBox — Displays live and final speech transcript ────────────────

export default function TranscriptBox({
  transcript,
  interimTranscript,
  isRecording,
}) {
  const hasContent = transcript || interimTranscript;

  if (!hasContent && !isRecording) return null;

  return (
    <div
      style={{
        marginTop: "0.85rem",
        padding: "1rem 1.25rem",
        borderRadius: "1rem",
        background: "rgba(236,72,153,0.05)",
        border: `1px solid ${isRecording ? "rgba(236,72,153,0.4)" : "rgba(236,72,153,0.2)"}`,
        transition: "border-color 0.3s ease",
      }}
    >
      <p
        style={{
          color: "#94a3b8",
          fontSize: "0.75rem",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          margin: "0 0 0.5rem",
        }}
      >
        🗣️ You Said:
      </p>

      <div
        style={{
          color: "#f1f5f9",
          fontSize: "0.93rem",
          lineHeight: 1.7,
          minHeight: "2rem",
        }}
      >
        {/* Final transcript */}
        {transcript && (
          <span style={{ color: "#f1f5f9" }}>{transcript} </span>
        )}

        {/* Interim (live) transcript in dimmer color */}
        {interimTranscript && (
          <span
            style={{
              color: "#64748b",
              fontStyle: "italic",
            }}
          >
            {interimTranscript}
          </span>
        )}

        {/* Placeholder when recording but nothing said yet */}
        {isRecording && !transcript && !interimTranscript && (
          <span
            style={{
              color: "#475569",
              fontStyle: "italic",
            }}
          >
            Listening…
          </span>
        )}
      </div>

      {transcript && !isRecording && (
        <p
          style={{
            color: "#64748b",
            fontSize: "0.77rem",
            marginTop: "0.65rem",
            marginBottom: 0,
          }}
        >
          ✏️ Transcript auto-filled above — you can edit before submitting.
        </p>
      )}
    </div>
  );
}
