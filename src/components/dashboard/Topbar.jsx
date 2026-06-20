"use client";

import Link from "next/link";
import useAuthStore from "@/store/authStore";

export default function Topbar() {
  const user = useAuthStore((state) => state.user);

  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
      <div>
        <p style={{ color: "#94a3b8", marginBottom: "0.25rem" }}>Welcome back{user ? `, ${user.fullName.split(" ")[0]}` : ""}</p>
        <h1 style={{ color: "#fff", fontSize: "2rem", margin: 0 }}>{user ? "Your Dashboard" : "User Dashboard"}</h1>
      </div>
      <Link
        href="/"
        style={{
          padding: "0.9rem 1.25rem",
          background: "#6366f1",
          color: "#fff",
          borderRadius: "0.9rem",
          textDecoration: "none",
          fontWeight: 600,
        }}
      >
        Home
      </Link>
    </div>
  );
}
