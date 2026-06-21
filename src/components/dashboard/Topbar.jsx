"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import useAuthStore from "@/store/authStore";

export default function Topbar() {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } catch { /* ignore */ }
    router.push("/login");
  }

  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
      <div>
        <p style={{ color: "#94a3b8", marginBottom: "0.25rem" }}>Welcome back{user ? `, ${user.fullName.split(" ")[0]}` : ""}</p>
        <h1 style={{ color: "#fff", fontSize: "2rem", margin: 0 }}>{user ? "Your Dashboard" : "User Dashboard"}</h1>
      </div>
      <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
        <Link
          href="/"
          style={{
            padding: "0.7rem 1.25rem",
            background: "rgba(99,102,241,0.12)",
            border: "1px solid rgba(99,102,241,0.3)",
            color: "#a5b4fc",
            borderRadius: "0.9rem",
            textDecoration: "none",
            fontWeight: 600,
            fontSize: "0.9rem",
          }}
        >
          🏠 Home
        </Link>
        <button
          onClick={handleLogout}
          disabled={loading}
          style={{
            padding: "0.7rem 1.25rem",
            background: "rgba(248,113,113,0.1)",
            border: "1px solid rgba(248,113,113,0.3)",
            color: "#f87171",
            borderRadius: "0.9rem",
            fontWeight: 600,
            fontSize: "0.9rem",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? "Logging out…" : "🚪 Logout"}
        </button>
      </div>
    </div>
  );
}
