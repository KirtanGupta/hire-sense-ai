"use client";

import { useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";

const SIDEBAR_WIDTH = 260;

/**
 * DashboardShell — Fixed sidebar layout
 *
 * Desktop: sidebar is position:fixed on the left, main content
 *          has a left margin equal to the sidebar width so it
 *          never goes under the sidebar.
 *
 * Mobile (≤768px): sidebar hidden off-screen, hamburger button
 *          slides it in over an overlay backdrop.
 */
export default function DashboardShell({ title, subtitle, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ minHeight: "100vh", background: "#020617", color: "#f8fafc" }}>

      {/* ── Desktop: fixed sidebar ─────────────────────────────────────── */}
      <div
        className="sidebar-desktop-wrap"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: SIDEBAR_WIDTH,
          height: "100vh",
          zIndex: 100,
          overflowY: "auto",
          overflowX: "hidden",
          // Custom scrollbar for the sidebar itself
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(99,102,241,0.3) transparent",
        }}
      >
        <Sidebar />
      </div>

      {/* ── Mobile: slide-in sidebar + overlay ────────────────────────── */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(3px)",
            zIndex: 200,
          }}
        />
      )}
      <div
        className="sidebar-mobile-wrap"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          height: "100vh",
          width: SIDEBAR_WIDTH,
          zIndex: 210,
          transform: sidebarOpen ? "translateX(0)" : `translateX(-${SIDEBAR_WIDTH}px)`,
          transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1)",
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* ── Main content area ──────────────────────────────────────────── */}
      <main className="dashboard-main">
        {/* Hamburger — mobile only */}
        <button
          className="hamburger-btn"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open sidebar"
        >
          <span />
          <span style={{ width: 15 }} />
          <span />
        </button>

        <Topbar />

        {title && (
          <div style={{ marginBottom: "2rem" }}>
            <h1 className="dashboard-title">{title}</h1>
            {subtitle && (
              <p style={{ color: "#94a3b8", marginTop: "0.6rem", lineHeight: 1.7, margin: "0.6rem 0 0" }}>
                {subtitle}
              </p>
            )}
          </div>
        )}

        <div>{children}</div>
      </main>

      <style>{`
        /* ─── Desktop sidebar wrapper ─── */
        .sidebar-desktop-wrap {
          display: block;
        }
        .sidebar-mobile-wrap {
          display: none;
        }

        /* ─── Main content: offset by sidebar width on desktop ─── */
        .dashboard-main {
          margin-left: ${SIDEBAR_WIDTH}px;
          padding: 2rem 3rem;
          min-height: 100vh;
          box-sizing: border-box;
          min-width: 0;
        }

        .dashboard-title {
          font-size: 2.25rem;
          margin: 0;
          color: #f8fafc;
          font-weight: 800;
        }

        /* hamburger hidden on desktop */
        .hamburger-btn {
          display: none;
        }

        /* ─── Tablet (≤1024px) ─── */
        @media (max-width: 1024px) {
          .dashboard-main {
            padding: 1.75rem 2rem;
          }
        }

        /* ─── Mobile (≤768px) ─── */
        @media (max-width: 768px) {
          /* Hide fixed desktop sidebar, show slide-in mobile one */
          .sidebar-desktop-wrap {
            display: none !important;
          }
          .sidebar-mobile-wrap {
            display: block;
          }

          /* Main takes full width — no sidebar offset */
          .dashboard-main {
            margin-left: 0;
            padding: 1.25rem 1rem;
          }

          .dashboard-title {
            font-size: 1.6rem;
          }

          /* Show hamburger */
          .hamburger-btn {
            display: flex;
            flex-direction: column;
            justify-content: center;
            gap: 5px;
            width: 44px;
            height: 44px;
            border-radius: 0.75rem;
            border: 1px solid rgba(148,163,184,0.2);
            background: rgba(255,255,255,0.04);
            cursor: pointer;
            margin-bottom: 1.25rem;
            padding: 0 12px;
          }
          .hamburger-btn span {
            display: block;
            height: 2px;
            width: 100%;
            background: #f8fafc;
            border-radius: 2px;
          }
        }

        /* ─── Small mobile (≤480px) ─── */
        @media (max-width: 480px) {
          .dashboard-main {
            padding: 1rem 0.75rem;
          }
          .dashboard-title {
            font-size: 1.4rem;
          }
        }

        /* ─── Sidebar scrollbar (webkit) ─── */
        .sidebar-desktop-wrap::-webkit-scrollbar {
          width: 4px;
        }
        .sidebar-desktop-wrap::-webkit-scrollbar-track {
          background: transparent;
        }
        .sidebar-desktop-wrap::-webkit-scrollbar-thumb {
          background: rgba(99,102,241,0.3);
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
}
