import DashboardShell from "@/components/dashboard/DashboardShell";

export const metadata = {
  title: "Settings — HireSense AI",
};

export default function SettingsPage() {
  return (
    <DashboardShell title="Settings" subtitle="Configure your account and notification preferences.">
      <div style={{ padding: "2rem", borderRadius: "1.5rem", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(148,163,184,0.12)" }}>
        <h2 style={{ color: "#fff", marginBottom: "1rem" }}>Account Settings</h2>
        <p style={{ color: "#cbd5e1" }}>This section will let you update preferences and security settings.</p>
      </div>
    </DashboardShell>
  );
}
