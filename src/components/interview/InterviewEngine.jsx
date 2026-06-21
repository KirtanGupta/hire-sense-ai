"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

export default function InterviewEngine({ sessionId }) {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | active | submitting | saving | completed | error
  const [errorMsg, setErrorMsg] = useState("");
  const [saveMsg, setSaveMsg] = useState("");
  const autosaveRef = useRef(null);
  const lastSavedRef = useRef({});

  // ── Load session ───────────────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/interview/session?sessionId=${sessionId}`, {
          credentials: "include",
        });
        const data = await res.json();
        if (data.success) {
          const q = data.session;
          setSession(q);
          setAnswers(q.questions.map((item) => item.answer || ""));
          setStatus(q.status === "completed" ? "completed" : "active");
        } else {
          setErrorMsg(data.message || "Session not found.");
          setStatus("error");
        }
      } catch {
        setErrorMsg("Failed to load session.");
        setStatus("error");
      }
    }
    load();
  }, [sessionId]);

  // ── Save one answer to backend ────────────────────────────────────────────
  const saveAnswer = useCallback(
    async (index, answerText, silent = false) => {
      if (lastSavedRef.current[index] === answerText) return; // skip if unchanged
      try {
        if (!silent) setStatus("saving");
        await fetch("/api/interview/answer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ sessionId, questionIndex: index, answer: answerText }),
        });
        lastSavedRef.current[index] = answerText;
        if (!silent) {
          setSaveMsg("Answer saved ✓");
          setTimeout(() => setSaveMsg(""), 2000);
          setStatus("active");
        }
      } catch {
        if (!silent) {
          setSaveMsg("Save failed");
          setTimeout(() => setSaveMsg(""), 2000);
          setStatus("active");
        }
      }
    },
    [sessionId]
  );

  // ── Autosave every 10 seconds ─────────────────────────────────────────────
  useEffect(() => {
    if (status !== "active") return;
    autosaveRef.current = setInterval(() => {
      saveAnswer(currentIndex, answers[currentIndex] ?? "", true);
    }, 10000);
    return () => clearInterval(autosaveRef.current);
  }, [status, currentIndex, answers, saveAnswer]);

  // ── Navigation ────────────────────────────────────────────────────────────
  async function goNext() {
    await saveAnswer(currentIndex, answers[currentIndex] ?? "");
    if (currentIndex < session.questions.length - 1) {
      setCurrentIndex((i) => i + 1);
    }
  }

  async function goPrev() {
    await saveAnswer(currentIndex, answers[currentIndex] ?? "");
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    }
  }

  async function handleJump(idx) {
    await saveAnswer(currentIndex, answers[currentIndex] ?? "");
    setCurrentIndex(idx);
  }

  // ── Finish interview ──────────────────────────────────────────────────────
  async function handleFinish() {
    setStatus("submitting");
    // Save current answer first
    await saveAnswer(currentIndex, answers[currentIndex] ?? "", true);

    try {
      const res = await fetch("/api/interview/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ sessionId }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus("completed");
      } else {
        setErrorMsg(data.message || "Failed to complete interview.");
        setStatus("active");
      }
    } catch {
      setErrorMsg("Network error. Please try again.");
      setStatus("active");
    }
  }

  // ── Render states ─────────────────────────────────────────────────────────

  if (status === "loading") {
    return (
      <div style={centerStyle}>
        <div style={bigSpinnerStyle} />
        <p style={{ color: "#94a3b8", marginTop: "1.5rem" }}>Loading your interview…</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div style={centerStyle}>
        <p style={{ color: "#f87171", fontSize: "1.1rem" }}>{errorMsg}</p>
        <button onClick={() => router.push("/interview")} style={secondaryBtnStyle}>
          ← Back to Setup
        </button>
      </div>
    );
  }

  if (status === "completed") {
    const answeredCount = answers.filter((a) => a.trim().length > 0).length;
    const total = session?.questions?.length || 0;
    return (
      <div style={{ maxWidth: 680, margin: "0 auto", textAlign: "center" }}>
        <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🎉</div>
        <h2 style={{ color: "#f8fafc", fontSize: "2rem", marginBottom: "0.75rem" }}>
          Interview Completed!
        </h2>
        <p style={{ color: "#94a3b8", marginBottom: "2rem", lineHeight: 1.7 }}>
          You answered <strong style={{ color: "#f8fafc" }}>{answeredCount}</strong> of{" "}
          <strong style={{ color: "#f8fafc" }}>{total}</strong> questions. Your session has been
          saved and is ready for evaluation.
        </p>
        <div
          style={{
            padding: "1.5rem",
            borderRadius: "1.25rem",
            background: "rgba(34,197,94,0.08)",
            border: "1px solid rgba(34,197,94,0.2)",
            marginBottom: "2rem",
          }}
        >
          <p style={{ color: "#4ade80", fontWeight: 600 }}>
            ✓ Role: {session?.role} · {session?.difficulty} · {session?.experience}
          </p>
        </div>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={() => router.push("/history")} style={primaryBtnStyle}>
            View History
          </button>
          <button onClick={() => router.push("/interview")} style={secondaryBtnStyle}>
            New Interview
          </button>
          <button onClick={() => router.push("/dashboard")} style={secondaryBtnStyle}>
            Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!session) return null;

  const questions = session.questions;
  const total = questions.length;
  const progress = Math.round(((currentIndex + 1) / total) * 100);
  const answeredCount = answers.filter((a) => a.trim().length > 0).length;
  const currentAnswer = answers[currentIndex] ?? "";
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === total - 1;

  return (
    <div style={{ maxWidth: 860, margin: "0 auto" }}>
      {/* Session meta bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          flexWrap: "wrap",
          marginBottom: "1.5rem",
        }}
      >
        {[session.role, session.difficulty, session.experience].map((tag) => (
          <span key={tag} style={tagStyle}>
            {tag}
          </span>
        ))}
        <span style={{ ...tagStyle, marginLeft: "auto", background: "rgba(34,197,94,0.1)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.25)" }}>
          {answeredCount}/{total} answered
        </span>
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: "1.75rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
          <span style={{ color: "#94a3b8", fontSize: "0.88rem" }}>
            Question {currentIndex + 1} of {total}
          </span>
          <span style={{ color: "#a5b4fc", fontSize: "0.88rem", fontWeight: 600 }}>{progress}%</span>
        </div>
        <div
          style={{
            height: 6,
            borderRadius: 999,
            background: "rgba(148,163,184,0.15)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              borderRadius: 999,
              width: `${progress}%`,
              background: "linear-gradient(90deg, #6366f1, #8b5cf6)",
              transition: "width 0.35s ease",
            }}
          />
        </div>
      </div>

      {/* Question navigator dots */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.5rem",
          marginBottom: "2rem",
        }}
      >
        {questions.map((_, idx) => {
          const isAnswered = (answers[idx] ?? "").trim().length > 0;
          const isCurrent = idx === currentIndex;
          return (
            <button
              key={idx}
              onClick={() => handleJump(idx)}
              title={`Question ${idx + 1}`}
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                border: isCurrent
                  ? "2px solid #6366f1"
                  : isAnswered
                  ? "2px solid rgba(34,197,94,0.6)"
                  : "2px solid rgba(148,163,184,0.25)",
                background: isCurrent
                  ? "rgba(99,102,241,0.25)"
                  : isAnswered
                  ? "rgba(34,197,94,0.12)"
                  : "rgba(148,163,184,0.06)",
                color: isCurrent ? "#a5b4fc" : isAnswered ? "#4ade80" : "#64748b",
                fontSize: "0.8rem",
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.18s ease",
              }}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>

      {/* Question card */}
      <div
        style={{
          padding: "2.25rem",
          borderRadius: "1.5rem",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(148,163,184,0.12)",
          marginBottom: "1.5rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem", marginBottom: "1.75rem" }}>
          <span
            style={{
              flexShrink: 0,
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: "rgba(99,102,241,0.2)",
              border: "1px solid rgba(99,102,241,0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#a5b4fc",
              fontWeight: 700,
              fontSize: "0.9rem",
            }}
          >
            {currentIndex + 1}
          </span>
          <p
            style={{
              color: "#f1f5f9",
              fontSize: "1.15rem",
              fontWeight: 500,
              lineHeight: 1.65,
              margin: 0,
            }}
          >
            {questions[currentIndex].question}
          </p>
        </div>

        <label style={{ display: "block", color: "#94a3b8", fontSize: "0.88rem", marginBottom: "0.65rem" }}>
          Your Answer
        </label>
        <textarea
          value={currentAnswer}
          onChange={(e) => {
            const updated = [...answers];
            updated[currentIndex] = e.target.value;
            setAnswers(updated);
          }}
          placeholder="Type your answer here…"
          rows={7}
          style={{
            width: "100%",
            padding: "1rem 1.25rem",
            borderRadius: "1rem",
            background: "rgba(15,23,42,0.7)",
            border: "1px solid rgba(148,163,184,0.18)",
            color: "#f1f5f9",
            fontSize: "0.97rem",
            lineHeight: 1.7,
            resize: "vertical",
            outline: "none",
            transition: "border-color 0.2s ease",
            fontFamily: "inherit",
          }}
          onFocus={(e) => (e.target.style.borderColor = "rgba(99,102,241,0.5)")}
          onBlur={(e) => (e.target.style.borderColor = "rgba(148,163,184,0.18)")}
        />

        {/* Save feedback */}
        {saveMsg && (
          <p style={{ color: "#4ade80", fontSize: "0.85rem", marginTop: "0.5rem" }}>{saveMsg}</p>
        )}
      </div>

      {/* Navigation buttons */}
      <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
        <button
          onClick={goPrev}
          disabled={isFirst || status === "submitting" || status === "saving"}
          style={{ ...secondaryBtnStyle, opacity: isFirst ? 0.4 : 1 }}
        >
          ← Previous
        </button>

        <button
          onClick={() => saveAnswer(currentIndex, currentAnswer)}
          disabled={status === "submitting" || status === "saving"}
          style={{
            padding: "0.75rem 1.4rem",
            borderRadius: "0.9rem",
            border: "1px solid rgba(99,102,241,0.35)",
            background: "rgba(99,102,241,0.08)",
            color: "#a5b4fc",
            cursor: "pointer",
            fontSize: "0.93rem",
            fontWeight: 500,
          }}
        >
          {status === "saving" ? "Saving…" : "💾 Save"}
        </button>

        {isLast ? (
          <button
            onClick={handleFinish}
            disabled={status === "submitting"}
            style={{ ...primaryBtnStyle, marginLeft: "auto" }}
          >
            {status === "submitting" ? (
              <>
                <span style={smallSpinnerStyle} />
                Finishing…
              </>
            ) : (
              "✅ Finish Interview"
            )}
          </button>
        ) : (
          <button
            onClick={goNext}
            disabled={status === "submitting" || status === "saving"}
            style={{ ...primaryBtnStyle, marginLeft: "auto" }}
          >
            Next →
          </button>
        )}
      </div>

      {errorMsg && (
        <p
          style={{
            color: "#f87171",
            marginTop: "1rem",
            padding: "0.75rem 1rem",
            background: "rgba(248,113,113,0.08)",
            borderRadius: "0.75rem",
          }}
        >
          {errorMsg}
        </p>
      )}
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const centerStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 400,
  gap: "1rem",
};

const tagStyle = {
  padding: "0.3rem 0.85rem",
  borderRadius: "999px",
  background: "rgba(148,163,184,0.08)",
  border: "1px solid rgba(148,163,184,0.2)",
  color: "#94a3b8",
  fontSize: "0.83rem",
  fontWeight: 500,
};

const primaryBtnStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "0.5rem",
  padding: "0.85rem 1.75rem",
  borderRadius: "0.9rem",
  border: "none",
  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
  color: "#fff",
  fontSize: "0.97rem",
  fontWeight: 700,
  cursor: "pointer",
  boxShadow: "0 4px 16px rgba(99,102,241,0.3)",
};

const secondaryBtnStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "0.5rem",
  padding: "0.85rem 1.5rem",
  borderRadius: "0.9rem",
  border: "1px solid rgba(148,163,184,0.2)",
  background: "rgba(148,163,184,0.06)",
  color: "#cbd5e1",
  fontSize: "0.97rem",
  fontWeight: 600,
  cursor: "pointer",
};

const bigSpinnerStyle = {
  width: 48,
  height: 48,
  border: "3px solid rgba(99,102,241,0.2)",
  borderTopColor: "#6366f1",
  borderRadius: "50%",
  animation: "spin 0.8s linear infinite",
};

const smallSpinnerStyle = {
  display: "inline-block",
  width: 15,
  height: 15,
  border: "2px solid rgba(255,255,255,0.3)",
  borderTopColor: "#fff",
  borderRadius: "50%",
  animation: "spin 0.7s linear infinite",
};
