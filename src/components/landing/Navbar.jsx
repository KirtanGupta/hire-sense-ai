"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { FiMenu, FiX } from "react-icons/fi";
import { RiBrainLine } from "react-icons/ri";

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "About", href: "#about" },
  { label: "FAQ", href: "#faq" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("nav-menu-open", menuOpen);
    return () => document.body.classList.remove("nav-menu-open");
  }, [menuOpen]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setMenuOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        transition: "all 0.4s ease",
        background: scrolled ? "rgba(5, 8, 22, 0.85)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(99,102,241,0.12)" : "none",
      }}
    >
      <div
        className="container"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "1.1rem 1.5rem",
        }}
      >
        <Link
          href="/"
          onClick={closeMenu}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
            textDecoration: "none",
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              borderRadius: "0.6rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 16px rgba(99,102,241,0.4)",
            }}
          >
            <RiBrainLine size={20} color="#fff" />
          </div>
          <span
            style={{
              fontFamily: "var(--font-space-grotesk), 'Space Grotesk', sans-serif",
              fontWeight: 700,
              fontSize: "1.2rem",
              color: "#f1f5f9",
              letterSpacing: "-0.01em",
            }}
          >
            HireSense{" "}
            <span
              style={{
                background: "linear-gradient(135deg,#6366f1,#06b6d4)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              AI
            </span>
          </span>
        </Link>

        <ul
          style={{
            alignItems: "center",
            gap: "0.25rem",
            listStyle: "none",
          }}
          className="nav-desktop-only"
        >
          {navLinks.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                style={{
                  color: "#94a3b8",
                  textDecoration: "none",
                  fontSize: "0.9rem",
                  fontWeight: 500,
                  padding: "0.45rem 0.85rem",
                  borderRadius: "0.5rem",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#f1f5f9";
                  e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "#94a3b8";
                  e.currentTarget.style.background = "transparent";
                }}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div
          style={{ alignItems: "center", gap: "0.75rem" }}
          className="nav-desktop-only"
        >
          <Link
            href="/login"
            className="btn-secondary"
            style={{ padding: "0.55rem 1.3rem", fontSize: "0.875rem" }}
          >
            Login
          </Link>
          <Link
            href="/register"
            className="btn-primary"
            style={{ padding: "0.55rem 1.3rem", fontSize: "0.875rem" }}
          >
            Register
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            background: "none",
            border: "none",
            color: "#f1f5f9",
            cursor: "pointer",
            padding: "0.5rem",
          }}
          className="nav-hamburger"
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
        </button>
      </div>

      {menuOpen && (
        <div
          style={{
            background: "rgba(5,8,22,0.97)",
            backdropFilter: "blur(20px)",
            borderTop: "1px solid rgba(99,102,241,0.12)",
            padding: "1.5rem",
          }}
        >
          <ul
            style={{
              listStyle: "none",
              display: "flex",
              flexDirection: "column",
              gap: "0.25rem",
              marginBottom: "1rem",
            }}
          >
            {navLinks.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  onClick={closeMenu}
                  style={{
                    display: "block",
                    color: "#94a3b8",
                    textDecoration: "none",
                    fontWeight: 500,
                    padding: "0.65rem 0.75rem",
                    borderRadius: "0.5rem",
                    transition: "all 0.2s",
                  }}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <Link
              href="/login"
              onClick={closeMenu}
              className="btn-secondary"
              style={{ flex: 1, justifyContent: "center", fontSize: "0.875rem" }}
            >
              Login
            </Link>
            <Link
              href="/register"
              onClick={closeMenu}
              className="btn-primary"
              style={{ flex: 1, justifyContent: "center", fontSize: "0.875rem" }}
            >
              Register
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
