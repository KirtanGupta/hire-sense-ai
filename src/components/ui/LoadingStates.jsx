"use client";

/**
 * Phase 9.1 — Loading Components
 * Animated progress bar + skeleton loaders
 */

import { useEffect, useState } from "react";

// ─── Upload Progress Bar ──────────────────────────────────────────────────────

export function UploadProgressBar({ stage }) {
  const [progress, setProgress] = useState(0);

  const stages = {
    uploading: { label: "Uploading Resume...", target: 35, color: "#6366f1" },
    parsing:   { label: "Parsing Document...", target: 60, color: "#8b5cf6" },
    analyzing: { label: "AI Analysis Running...", target: 88, color: "#06b6d4" },
    saving:    { label: "Saving Results...", target: 97, color: "#22c55e" },
    done:      { label: "Complete!", target: 100, color: "#22c55e" },
  };

  const current = stages[stage] || stages.uploading;

  useEffect(() => {
    if (!stage) return;
    const target = current.target;
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= target) {
          clearInterval(timer);
          return target;
        }
        const step = Math.max(0.5, (target - prev) * 0.08);
        return Math.min(prev + step, target);
      });
    }, 60);
    return () => clearInterval(timer);
  }, [stage, current.target]);

  if (!stage) return null;

  const filledBlocks = Math.round((progress / 100) * 10);
  const bar = Array.from({ length: 10 }, (_, i) =>
    i < filledBlocks ? "█" : "░"
  ).join("");

  return (
    <div style={{
      marginTop: "1.25rem",
      padding: "1.25rem 1.5rem",
      borderRadius: "1rem",
      background: "rgba(99,102,241,0.06)",
      border: `1px solid ${current.color}30`,
      transition: "border-color 0.4s ease",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
        <span style={{ color: current.color, fontWeight: 600, fontSize: "0.9rem" }}>
          {current.label}
        </span>
        <span style={{ color: "#94a3b8", fontSize: "0.85rem" }}>
          {Math.round(progress)}%
        </span>
      </div>

      {/* Graphical progress bar */}
      <div style={{
        height: 6,
        borderRadius: 3,
        background: "rgba(148,163,184,0.12)",
        overflow: "hidden",
        marginBottom: "0.6rem",
      }}>
        <div style={{
          height: "100%",
          width: `${progress}%`,
          background: `linear-gradient(90deg, ${current.color}, ${current.color}bb)`,
          borderRadius: 3,
          transition: "width 0.3s ease",
          boxShadow: `0 0 8px ${current.color}60`,
        }} />
      </div>

      {/* ASCII-style block bar */}
      <div style={{
        fontFamily: "monospace",
        fontSize: "0.82rem",
        color: current.color,
        letterSpacing: "0.05em",
        opacity: 0.8,
      }}>
        [{bar}]
      </div>
    </div>
  );
}

// ─── Question Generation Loader ───────────────────────────────────────────────

export function GeneratingLoader({ stage }) {
  const stages = [
    { key: "resume",    label: "Resume Upload",         icon: "📄" },
    { key: "generate",  label: "Generating Questions...", icon: "⚡" },
    { key: "evaluate",  label: "AI Evaluation",          icon: "🧠" },
  ];

  const currentIdx = stages.findIndex((s) => s.key === stage);

  return (
    <div style={{
      padding: "2rem",
      borderRadius: "1.5rem",
      background: "rgba(99,102,241,0.06)",
      border: "1px solid rgba(99,102,241,0.25)",
      display: "flex",
      flexDirection: "column",
      gap: "1.25rem",
    }}>
      {stages.map((s, i) => {
        const isDone = i < currentIdx;
        const isActive = i === currentIdx;
        return (
          <div key={s.key} style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            opacity: isDone || isActive ? 1 : 0.35,
            transition: "opacity 0.4s ease",
          }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.2rem",
              background: isDone
                ? "rgba(34,197,94,0.15)"
                : isActive
                  ? "rgba(99,102,241,0.2)"
                  : "rgba(148,163,184,0.08)",
              border: isDone
                ? "1px solid rgba(34,197,94,0.4)"
                : isActive
                  ? "1px solid rgba(99,102,241,0.5)"
                  : "1px solid rgba(148,163,184,0.15)",
              flexShrink: 0,
              ...(isActive ? {
                animation: "pulseRing 1.5s ease-in-out infinite",
              } : {}),
            }}>
              {isDone ? "✅" : s.icon}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{
                color: isDone ? "#4ade80" : isActive ? "#a5b4fc" : "#64748b",
                fontWeight: isActive ? 600 : 500,
                margin: 0,
                fontSize: "0.95rem",
                transition: "color 0.4s ease",
              }}>
                {s.label}
              </p>
              {isActive && (
                <div style={{ display: "flex", gap: 4, marginTop: 6 }}>
                  {[0, 1, 2].map((dot) => (
                    <span key={dot} style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "#6366f1",
                      animation: `bounce 1s ease-in-out ${dot * 0.15}s infinite`,
                    }} />
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.5; }
          40% { transform: translateY(-5px); opacity: 1; }
        }
        @keyframes pulseRing {
          0%, 100% { box-shadow: 0 0 0 0 rgba(99,102,241,0.4); }
          50% { box-shadow: 0 0 0 6px rgba(99,102,241,0); }
        }
      `}</style>
    </div>
  );
}

// ─── Skeleton Row (for HistoryList) ──────────────────────────────────────────

export function SkeletonRow() {
  return (
    <div style={{
      display: "flex",
      gap: "1rem",
      padding: "1.1rem 1.5rem",
      borderRadius: "1.25rem",
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(148,163,184,0.08)",
      alignItems: "center",
      overflow: "hidden",
    }}>
      {[160, 70, 90, 60, 80, 70, 70].map((w, i) => (
        <div key={i} style={{
          width: w,
          height: 14,
          borderRadius: 7,
          background: "linear-gradient(90deg, rgba(148,163,184,0.07) 25%, rgba(148,163,184,0.14) 50%, rgba(148,163,184,0.07) 75%)",
          backgroundSize: "200% 100%",
          animation: `shimmer 1.6s ease-in-out infinite`,
          animationDelay: `${i * 0.08}s`,
          flexShrink: 0,
        }} />
      ))}
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
      `}</style>
    </div>
  );
}

// ─── Generic Skeleton Block ───────────────────────────────────────────────────

export function SkeletonBlock({ width = "100%", height = 16, borderRadius = 8, delay = 0 }) {
  return (
    <div style={{
      width,
      height,
      borderRadius,
      background: "linear-gradient(90deg, rgba(148,163,184,0.07) 25%, rgba(148,163,184,0.14) 50%, rgba(148,163,184,0.07) 75%)",
      backgroundSize: "200% 100%",
      animation: `shimmer 1.6s ease-in-out ${delay}s infinite`,
    }}>
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
      `}</style>
    </div>
  );
}

// ─── Stat Card Skeleton ───────────────────────────────────────────────────────

export function StatCardSkeleton() {
  return (
    <div style={{
      padding: "1.5rem",
      borderRadius: "1.25rem",
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(148,163,184,0.12)",
      minWidth: 190,
      display: "flex",
      flexDirection: "column",
      gap: "0.75rem",
    }}>
      <SkeletonBlock width={80} height={12} delay={0} />
      <SkeletonBlock width={60} height={28} borderRadius={6} delay={0.1} />
      <SkeletonBlock width={120} height={11} delay={0.2} />
    </div>
  );
}
