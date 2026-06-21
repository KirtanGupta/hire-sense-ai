"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const navItems = [
  { href: "/admin/dashboard", icon: "📊", label: "Dashboard" },
  { href: "/admin/users", icon: "👥", label: "Users" },
  { href: "/admin/interviews", icon: "🎤", label: "Interviews" },
  { href: "/admin/resumes", icon: "📄", label: "Resumes" },
  { href: "/admin/analytics", icon: "📈", label: "Analytics" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } catch {
      // ignore
    }
    router.push("/login");
  }

  return (
    <aside
      style={{
        width: 240,
        minHeight: "100vh",
        background: "rgba(5,8,22,0.95)",
        borderRight: "1px solid rgba(99,102,241,0.15)",
        display: "flex",
        flexDirection: "column",
        padding: "0",
        position: "sticky",
        top: 0,
        backdropFilter: "blur(20px)",
        flexShrink: 0,
      }}
    >
      {/* ── Logo / Brand ── */}
      <div
        style={{
          padding: "1.75rem 1.5rem 1.25rem",
          borderBottom: "1px solid rgba(148,163,184,0.08)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "0.65rem",
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1rem",
              boxShadow: "0 4px 12px rgba(99,102,241,0.4)",
              flexShrink: 0,
            }}
          >
            ⚙️
          </div>
          <div>
            <p style={{ color: "#f8fafc", fontWeight: 700, fontSize: "0.97rem", margin: 0 }}>
              Admin Panel
            </p>
            <p style={{ color: "#475569", fontSize: "0.73rem", margin: 0 }}>
              HireSense AI
            </p>
          </div>
        </div>
      </div>

      {/* ── Nav Items ── */}
      <nav style={{ flex: 1, padding: "1rem 0.75rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
        <p
          style={{
            color: "#334155",
            fontSize: "0.68rem",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            padding: "0 0.75rem",
            marginBottom: "0.5rem",
          }}
        >
          Navigation
        </p>

        {navItems.map(({ href, icon, label }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.7rem 0.85rem",
                borderRadius: "0.75rem",
                textDecoration: "none",
                fontWeight: isActive ? 700 : 500,
                fontSize: "0.9rem",
                transition: "all 0.18s ease",
                background: isActive
                  ? "rgba(99,102,241,0.15)"
                  : "transparent",
                color: isActive ? "#a5b4fc" : "#64748b",
                border: isActive
                  ? "1px solid rgba(99,102,241,0.25)"
                  : "1px solid transparent",
                position: "relative",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "rgba(148,163,184,0.06)";
                  e.currentTarget.style.color = "#94a3b8";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#64748b";
                }
              }}
            >
              {/* Active indicator */}
              {isActive && (
                <span
                  style={{
                    position: "absolute",
                    left: 0,
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: 3,
                    height: "60%",
                    borderRadius: "0 3px 3px 0",
                    background: "linear-gradient(180deg, #6366f1, #8b5cf6)",
                  }}
                />
              )}
              <span style={{ fontSize: "1.05rem" }}>{icon}</span>
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* ── Logout ── */}
      <div style={{ padding: "1rem 0.75rem", borderTop: "1px solid rgba(148,163,184,0.08)" }}>
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            padding: "0.7rem 0.85rem",
            borderRadius: "0.75rem",
            border: "1px solid rgba(248,113,113,0.2)",
            background: "rgba(248,113,113,0.06)",
            color: "#f87171",
            fontSize: "0.9rem",
            fontWeight: 600,
            cursor: loggingOut ? "not-allowed" : "pointer",
            transition: "all 0.18s ease",
            opacity: loggingOut ? 0.6 : 1,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(248,113,113,0.12)";
            e.currentTarget.style.borderColor = "rgba(248,113,113,0.4)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(248,113,113,0.06)";
            e.currentTarget.style.borderColor = "rgba(248,113,113,0.2)";
          }}
        >
          <span>🚪</span>
          <span>{loggingOut ? "Logging out…" : "Logout"}</span>
        </button>
      </div>
    </aside>
  );
}
