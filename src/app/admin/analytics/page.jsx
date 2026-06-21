import AdminTopbar from "@/components/admin/AdminTopbar";

export const metadata = { title: "Analytics — Admin | HireSense AI" };

export default function AdminAnalyticsPage() {
  return (
    <>
      <AdminTopbar
        title="Platform Analytics"
        subtitle="Trends, charts, and insights across the platform"
      />
      <div
        style={{
          padding: "3rem",
          borderRadius: "1.5rem",
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(148,163,184,0.1)",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📈</div>
        <h3 style={{ color: "#f8fafc", marginBottom: "0.5rem" }}>Platform Analytics</h3>
        <p style={{ color: "#64748b", fontSize: "0.9rem" }}>
          Coming in Phase 8.4 — Score distribution charts, voice vs text ratios, user growth graphs, and more.
        </p>
      </div>
    </>
  );
}
