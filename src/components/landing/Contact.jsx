"use client";
import { useState } from "react";
import { FiUser, FiMail, FiMessageSquare, FiSend, FiCheckCircle } from "react-icons/fi";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate submission
    setTimeout(() => setSubmitted(true), 600);
  };

  return (
    <section id="contact" className="section" style={{ position: "relative" }}>
      <div
        className="glow-orb"
        style={{
          width: 500,
          height: 500,
          background: "#06b6d4",
          right: "10%",
          bottom: "0%",
          opacity: 0.08,
        }}
      />

      <div className="container" style={{ position: "relative", zIndex: 1 }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <div className="section-badge" style={{ display: "inline-flex" }}>
            📬 Contact
          </div>
          <h2 className="heading-lg" style={{ color: "#f1f5f9", marginBottom: "1rem" }}>
            Get in{" "}
            <span className="text-gradient">Touch</span>
          </h2>
          <p style={{ color: "#64748b", fontSize: "1.05rem", maxWidth: "460px", margin: "0 auto" }}>
            Have a question or feedback? We would love to hear from you. Send us a message and we will get back to you soon.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1.6fr",
            gap: "3rem",
            maxWidth: 900,
            margin: "0 auto",
            alignItems: "start",
          }}
          className="contact-grid"
        >
          {/* Left: Info */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {[
              {
                icon: <FiMail size={20} />,
                label: "Email Us",
                value: "hello@hiresense.ai",
                color: "#6366f1",
              },
              {
                icon: <FiMessageSquare size={20} />,
                label: "Live Chat",
                value: "Available 9AM–6PM IST",
                color: "#8b5cf6",
              },
              {
                icon: <FiUser size={20} />,
                label: "Support",
                value: "24/7 Help Center",
                color: "#06b6d4",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="card"
                style={{ padding: "1.25rem 1.5rem", display: "flex", alignItems: "center", gap: "1rem" }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "0.75rem",
                    background: `${item.color}18`,
                    border: `1px solid ${item.color}30`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: item.color,
                    flexShrink: 0,
                  }}
                >
                  {item.icon}
                </div>
                <div>
                  <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 500, marginBottom: "0.2rem" }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: "0.9rem", color: "#e2e8f0", fontWeight: 600 }}>
                    {item.value}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right: Form */}
          <div
            className="card"
            style={{ padding: "2.5rem" }}
          >
            {submitted ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "2rem",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "1rem",
                }}
              >
                <FiCheckCircle size={48} color="#10b981" style={{ filter: "drop-shadow(0 0 16px #10b981)" }} />
                <h3
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: "1.3rem",
                    fontWeight: 600,
                    color: "#f1f5f9",
                  }}
                >
                  Message Sent!
                </h3>
                <p style={{ color: "#64748b", fontSize: "0.9rem" }}>
                  Thanks for reaching out. We will get back to you within 24 hours.
                </p>
                <button
                  className="btn-secondary"
                  onClick={() => { setSubmitted(false); setForm({ name: "", email: "", message: "" }); }}
                  style={{ marginTop: "0.5rem" }}
                >
                  Send Another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                <div>
                  <label
                    htmlFor="contact-name"
                    style={{
                      display: "block",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      color: "#94a3b8",
                      marginBottom: "0.5rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Full Name
                  </label>
                  <div style={{ position: "relative" }}>
                    <FiUser
                      size={16}
                      style={{
                        position: "absolute",
                        left: "1rem",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "#64748b",
                        pointerEvents: "none",
                      }}
                    />
                    <input
                      id="contact-name"
                      type="text"
                      className="input"
                      placeholder="John Doe"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                      style={{ paddingLeft: "2.75rem" }}
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="contact-email"
                    style={{
                      display: "block",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      color: "#94a3b8",
                      marginBottom: "0.5rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Email Address
                  </label>
                  <div style={{ position: "relative" }}>
                    <FiMail
                      size={16}
                      style={{
                        position: "absolute",
                        left: "1rem",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "#64748b",
                        pointerEvents: "none",
                      }}
                    />
                    <input
                      id="contact-email"
                      type="email"
                      className="input"
                      placeholder="john@example.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      required
                      style={{ paddingLeft: "2.75rem" }}
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="contact-message"
                    style={{
                      display: "block",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      color: "#94a3b8",
                      marginBottom: "0.5rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Message
                  </label>
                  <textarea
                    id="contact-message"
                    className="input"
                    placeholder="Tell us how we can help you..."
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  style={{ width: "100%", justifyContent: "center", padding: "0.9rem" }}
                >
                  <FiSend size={16} />
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .contact-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
