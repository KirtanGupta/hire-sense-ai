export default function StatCard({ title, value, description }) {
  return (
    <div style={{ padding: "1.5rem", borderRadius: "1.25rem", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(148,163,184,0.12)", minWidth: 190 }}>
      <p style={{ color: "#94a3b8", marginBottom: "0.75rem", fontSize: "0.9rem" }}>{title}</p>
      <h2 style={{ color: "#fff", fontSize: "1.75rem", margin: 0 }}>{value}</h2>
      <p style={{ color: "#cbd5e1", marginTop: "0.75rem", fontSize: "0.95rem" }}>{description}</p>
    </div>
  );
}
