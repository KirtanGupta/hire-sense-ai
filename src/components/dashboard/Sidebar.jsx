import Link from "next/link";

const navItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Profile", href: "/profile" },
  { label: "Resume", href: "/resume" },
  { label: "Interview", href: "/interview" },
  { label: "History", href: "/history" },
  { label: "Settings", href: "/settings" },
];

export default function Sidebar() {
  return (
    <aside
      style={{
        width: 280,
        minHeight: "100vh",
        padding: "2rem 1.5rem",
        background: "#0f172a",
        color: "#e2e8f0",
        borderRight: "1px solid rgba(148,163,184,0.12)",
      }}
    >
      <div style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem" }}>HireSense AI</h2>
        <p style={{ fontSize: "0.95rem", color: "#94a3b8" }}>Your candidate dashboard</p>
      </div>
      <nav style={{ display: "grid", gap: "0.5rem" }}>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            style={{
              display: "block",
              padding: "0.9rem 1rem",
              borderRadius: "0.9rem",
              color: "#cbd5e1",
              textDecoration: "none",
              transition: "background 0.2s",
            }}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
