"use client";

// ─── VoiceRecorder — Mic Button + Recording UI + Speech Analysis ───────────────

import { useSpeech } from "@/hooks/useSpeech";
import { analyzeSpeech } from "@/services/speechService";
import TranscriptBox from "@/components/voice/TranscriptBox";

export default function VoiceRecorder({ onTranscriptUpdate, onRecordingComplete }) {
  const {
    isRecording,
    transcript,
    interimTranscript,
    durationSeconds,
    isSupported,
    error,
    startRecording,
    stopRecording,
    resetTranscript,
  } = useSpeech();

  // ── Start mic ────────────────────────────────────────────────────────────────
  function handleStart() {
    resetTranscript();
    startRecording((liveTranscript) => {
      if (onTranscriptUpdate) onTranscriptUpdate(liveTranscript);
    });
  }

  // ── Stop mic + run speech analysis ──────────────────────────────────────────
  function handleStop() {
    stopRecording();
    // Small delay to let onend fire and durationSeconds update
    setTimeout(() => {
      const currentTranscript = transcript;
      const analysis = analyzeSpeech(currentTranscript, durationSeconds || 1);
      if (onRecordingComplete) {
        onRecordingComplete({ transcript: currentTranscript, speechData: analysis });
      }
    }, 400);
  }

  // ── Reset ────────────────────────────────────────────────────────────────────
  function handleReset() {
    resetTranscript();
    if (onTranscriptUpdate) onTranscriptUpdate("");
  }

  // ── Unsupported browser ──────────────────────────────────────────────────────
  if (!isSupported) {
    return (
      <div
        style={{
          padding: "1rem 1.25rem",
          borderRadius: "1rem",
          background: "rgba(251,191,36,0.07)",
          border: "1px solid rgba(251,191,36,0.25)",
          marginTop: "0.75rem",
        }}
      >
        <p style={{ color: "#fbbf24", fontSize: "0.9rem", margin: 0 }}>
          ⚠️ Voice input requires Chrome, Edge, or Brave browser. Your current browser does not support the Web Speech API.
        </p>
      </div>
    );
  }

  return (
    <div style={{ marginTop: "0.75rem" }}>
      {/* ── Buttons row ── */}
      <div style={{ display: "flex", gap: "0.65rem", alignItems: "center", flexWrap: "wrap" }}>
        {/* Start Recording */}
        {!isRecording && (
          <button
            onClick={handleStart}
            id="voice-start-btn"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.7rem 1.4rem",
              borderRadius: "0.85rem",
              border: "none",
              background: "linear-gradient(135deg, #ec4899, #f43f5e)",
              color: "#fff",
              fontSize: "0.93rem",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 4px 14px rgba(236,72,153,0.35)",
              transition: "transform 0.15s ease, box-shadow 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow = "0 6px 18px rgba(236,72,153,0.45)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 14px rgba(236,72,153,0.35)";
            }}
          >
            🎤 Start Recording
          </button>
        )}

        {/* Stop Recording */}
        {isRecording && (
          <button
            onClick={handleStop}
            id="voice-stop-btn"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.7rem 1.4rem",
              borderRadius: "0.85rem",
              border: "none",
              background: "linear-gradient(135deg, #374151, #1f2937)",
              color: "#f8fafc",
              fontSize: "0.93rem",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            }}
          >
            ⏹ Stop Recording
          </button>
        )}

        {/* Recording indicator */}
        {isRecording && (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.45rem 1rem",
              borderRadius: "999px",
              background: "rgba(239,68,68,0.12)",
              border: "1px solid rgba(239,68,68,0.3)",
            }}
          >
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: "#ef4444",
                animation: "voicePulse 1s ease-in-out infinite",
                display: "inline-block",
              }}
            />
            <span style={{ color: "#f87171", fontSize: "0.85rem", fontWeight: 600 }}>
              Recording…
            </span>
          </div>
        )}

        {/* Reset button (only when transcript exists and not recording) */}
        {!isRecording && transcript && (
          <button
            onClick={handleReset}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              padding: "0.6rem 1rem",
              borderRadius: "0.75rem",
              border: "1px solid rgba(148,163,184,0.2)",
              background: "rgba(148,163,184,0.06)",
              color: "#94a3b8",
              fontSize: "0.85rem",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            🔄 Re-record
          </button>
        )}
      </div>

      {/* ── Error message ── */}
      {error && (
        <div
          style={{
            marginTop: "0.65rem",
            padding: "0.65rem 1rem",
            borderRadius: "0.75rem",
            background: "rgba(248,113,113,0.08)",
            border: "1px solid rgba(248,113,113,0.25)",
          }}
        >
          <p style={{ color: "#f87171", fontSize: "0.88rem", margin: 0 }}>⚠️ {error}</p>
        </div>
      )}

      {/* ── Live transcript display ── */}
      <TranscriptBox
        transcript={transcript}
        interimTranscript={interimTranscript}
        isRecording={isRecording}
      />

      {/* Pulse animation keyframe */}
      <style>{`
        @keyframes voicePulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.25); }
        }
      `}</style>
    </div>
  );
}
