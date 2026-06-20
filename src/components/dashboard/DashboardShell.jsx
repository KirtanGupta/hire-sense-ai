import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";

export default function DashboardShell({ title, subtitle, children }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#020617", color: "#f8fafc" }}>
      <Sidebar />
      <main style={{ flex: 1, padding: "2rem 3rem" }}>
        <Topbar />
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "2.25rem", margin: 0 }}>{title}</h1>
          <p style={{ color: "#94a3b8", marginTop: "0.75rem", lineHeight: 1.7 }}>{subtitle}</p>
        </div>
        <div>{children}</div>
      </main>
    </div>
  );
}
