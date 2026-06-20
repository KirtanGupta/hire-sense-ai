export default function RoleSelector() {
  const roles = ["Frontend Developer", "Backend Developer", "Data Analyst", "DevOps Engineer"];

  return (
    <div style={{ padding: "2rem", borderRadius: "1.5rem", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(148,163,184,0.12)" }}>
      <h2 style={{ color: "#fff", marginBottom: "1rem" }}>Interview</h2>
      <p style={{ color: "#cbd5e1", marginBottom: "1.5rem" }}>Choose the role you want to practice for.</p>
      <div style={{ display: "grid", gap: "0.75rem" }}>
        {roles.map((role) => (
          <button key={role} style={{ padding: "0.95rem 1rem", borderRadius: "0.9rem", border: "1px solid rgba(148,163,184,0.18)", background: "rgba(148,163,184,0.06)", color: "#f8fafc", cursor: "pointer" }}>
            {role}
          </button>
        ))}
      </div>
    </div>
  );
}
