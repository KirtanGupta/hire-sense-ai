"use client";

import { useEffect, useState } from "react";
import useAuthStore from "@/store/authStore";
import api from "@/services/api";
import Link from "next/link";

export default function DashboardClient() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const user = useAuthStore((state) => state.user);
  const login = useAuthStore((state) => state.login);

  useEffect(() => {
    async function fetchMe() {
      try {
        const res = await api.get("/api/auth/me");
        if (res.data.success) {
          login(res.data.user);
        }
      } catch (err) {
        setError("Authentication failed");
      } finally {
        setLoading(false);
      }
    }

    fetchMe();
  }, [login]);

  if (loading) {
    return <div style={{ minHeight: "100vh", color: "#fff", padding: "2rem" }}>Loading dashboard...</div>;
  }

  if (error) {
    return <div style={{ minHeight: "100vh", color: "#fff", padding: "2rem" }}>{error}</div>;
  }

  return (
    <div style={{ minHeight: "100vh", padding: "3rem", background: "var(--bg-primary)", color: "#f8fafc" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>Welcome {user?.name || "User"}</h1>
      <p style={{ marginBottom: "1rem" }}>Role: {user?.role || "user"}</p>
      <p>Authentication Working</p>
      <p style={{ marginTop: "1.5rem" }}>
        <Link href="/" style={{ color: "#6366f1" }}>
          Back to Home
        </Link>
      </p>
    </div>
  );
}
