"use client";
import { useState } from "react";
import { FiChevronDown } from "react-icons/fi";

const faqs = [
  {
    question: "Is voice interview mandatory?",
    answer:
      "No. Users can switch to text mode anytime during the interview. HireSense AI supports both voice and text input, so you can choose whatever is most comfortable for your situation.",
  },
  {
    question: "Does the platform support resume analysis?",
    answer:
      "Yes. PDF and DOCX resumes are fully supported. Our AI parses your resume to extract skills, experience, and projects, then generates tailored questions based on your unique profile.",
  },
  {
    question: "How is the score calculated?",
    answer:
      "Groq AI evaluates three key dimensions: technical accuracy (correctness of the answer), completeness (how thorough your response is), and communication quality (clarity and structure). These are weighted to give you an overall score.",
  },
  {
    question: "Which job roles are supported?",
    answer:
      "We currently support MERN Stack Developer, Java Developer, Python Developer, Data Analyst, DevOps Engineer, React Developer, Node.js Developer, and more. New roles are added regularly.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Absolutely. All data is encrypted in transit and at rest. We use JWT authentication for secure sessions and never share your personal data or interview content with third parties.",
  },
  {
    question: "Can I retry an interview?",
    answer:
      "Yes! You can retake interviews as many times as you like. Your progress history is saved so you can track improvement over multiple sessions.",
  },
];

function FAQItem({ faq, index }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      style={{
        background: open ? "rgba(99,102,241,0.06)" : "rgba(255,255,255,0.03)",
        border: open
          ? "1px solid rgba(99,102,241,0.3)"
          : "1px solid rgba(255,255,255,0.07)",
        borderRadius: "1rem",
        overflow: "hidden",
        transition: "all 0.3s ease",
      }}
    >
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls={`faq-answer-${index}`}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "1.35rem 1.5rem",
          background: "none",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
          gap: "1rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span
            style={{
              width: 28,
              height: 28,
              borderRadius: "0.5rem",
              background: open ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.06)",
              border: open ? "1px solid rgba(99,102,241,0.4)" : "1px solid rgba(255,255,255,0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: open ? "#a5b4fc" : "#64748b",
              fontSize: "0.7rem",
              fontWeight: 700,
              fontFamily: "'Space Grotesk', sans-serif",
              flexShrink: 0,
              transition: "all 0.3s",
            }}
          >
            {String(index + 1).padStart(2, "0")}
          </span>
          <span
            style={{
              fontWeight: 600,
              fontSize: "0.95rem",
              color: open ? "#f1f5f9" : "#cbd5e1",
              fontFamily: "'Space Grotesk', sans-serif",
              transition: "color 0.3s",
            }}
          >
            {faq.question}
          </span>
        </div>
        <div
          style={{
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.3s ease",
            color: open ? "#6366f1" : "#64748b",
            flexShrink: 0,
          }}
        >
          <FiChevronDown size={18} />
        </div>
      </button>

      {open && (
        <div
          id={`faq-answer-${index}`}
          style={{
            padding: "1rem 1.5rem 1.35rem 4.1rem",
            color: "#94a3b8",
            fontSize: "0.9rem",
            lineHeight: 1.75,
            borderTop: "1px solid rgba(99,102,241,0.1)",
          }}
        >
          {faq.answer}
        </div>
      )}
    </div>
  );
}

export default function FAQ() {
  return (
    <section id="faq" className="section" style={{ position: "relative" }}>
      <div
        className="glow-orb"
        style={{
          width: 400,
          height: 400,
          background: "#8b5cf6",
          left: "-80px",
          top: "20%",
          opacity: 0.1,
        }}
      />

      <div className="container" style={{ position: "relative", zIndex: 1 }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <div className="section-badge" style={{ display: "inline-flex" }}>
            ❓ FAQ
          </div>
          <h2 className="heading-lg" style={{ color: "#f1f5f9", marginBottom: "1rem" }}>
            Frequently Asked{" "}
            <span className="text-gradient">Questions</span>
          </h2>
          <p style={{ color: "#64748b", fontSize: "1.05rem", maxWidth: "480px", margin: "0 auto" }}>
            Everything you need to know about HireSense AI. Cannot find an answer? Reach out to us.
          </p>
        </div>

        {/* FAQ list */}
        <div
          style={{
            maxWidth: 760,
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
          }}
        >
          {faqs.map((faq, i) => (
            <FAQItem key={faq.question} faq={faq} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
