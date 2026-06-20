export default function ProfileCard({ user }) {
  return (
    <div style={{ padding: "2rem", borderRadius: "1.5rem", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(148,163,184,0.12)" }}>
      <h2 style={{ color: "#fff", marginBottom: "1rem" }}>Profile</h2>
      <p style={{ color: "#cbd5e1", marginBottom: "0.75rem" }}><strong>Name:</strong> {user?.fullName || "N/A"}</p>
      <p style={{ color: "#cbd5e1", marginBottom: "0.75rem" }}><strong>Email:</strong> {user?.email || "N/A"}</p>
      <p style={{ color: "#cbd5e1", marginBottom: "0.75rem" }}><strong>Role:</strong> {user?.role || "user"}</p>
    </div>
  );
}
