"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Dashboard",  href: "/dashboard",  icon: "📊" },
  { label: "Profile",    href: "/profile",    icon: "👤" },
  { label: "Resume",     href: "/resume",     icon: "📄" },
  { label: "Interview",  href: "/interview",  icon: "🎤" },
  { label: "History",    href: "/history",    icon: "📋" },
  { label: "Settings",   href: "/settings",   icon: "⚙️" },
];

/**
 * Phase 9.5 — Responsive Sidebar
 * Active link highlighting, close button for mobile
 */
export default function Sidebar({ onClose }) {
  const pathname = usePathname();

  return (
    <aside style={{
      width: 260,
      minHeight: "100vh",
      padding: "1.75rem 1.25rem",
      background: "#0a0f1e",
      color: "#e2e8f0",
      borderRight: "1px solid rgba(148,163,184,0.1)",
      display: "flex",
      flexDirection: "column",
    }}>
      {/* Logo + close button row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem" }}>
        <div>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "0 0 0.2rem", color: "#f8fafc" }}>
            <span style={{
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>HireSense AI</span>
          </h2>
          <p style={{ fontSize: "0.78rem", color: "#64748b", margin: 0 }}>Candidate Dashboard</p>
        </div>
        {/* Mobile close button */}
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Close sidebar"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 36,
              height: 36,
              borderRadius: "0.6rem",
              border: "1px solid rgba(148,163,184,0.15)",
              background: "rgba(255,255,255,0.04)",
              color: "#94a3b8",
              fontSize: "1rem",
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Nav */}
      <nav style={{ display: "flex", flexDirection: "column", gap: "0.3rem", flex: 1 }}>
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.8rem 1rem",
                borderRadius: "0.85rem",
                color: isActive ? "#e0e7ff" : "#94a3b8",
                textDecoration: "none",
                fontWeight: isActive ? 600 : 400,
                fontSize: "0.92rem",
                background: isActive
                  ? "rgba(99,102,241,0.15)"
                  : "transparent",
                border: isActive
                  ? "1px solid rgba(99,102,241,0.25)"
                  : "1px solid transparent",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "rgba(148,163,184,0.06)";
                  e.currentTarget.style.color = "#e2e8f0";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#94a3b8";
                }
              }}
            >
              <span style={{ fontSize: "1.05rem", width: 20, textAlign: "center" }}>{item.icon}</span>
              {item.label}
              {isActive && (
                <span style={{
                  marginLeft: "auto",
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#6366f1",
                  boxShadow: "0 0 8px rgba(99,102,241,0.7)",
                }} />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{
        marginTop: "auto",
        paddingTop: "1.5rem",
        borderTop: "1px solid rgba(148,163,184,0.08)",
        fontSize: "0.75rem",
        color: "#475569",
        textAlign: "center",
      }}>
        HireSense AI v1.0 · Phase 9
      </div>
    </aside>
  );
}
