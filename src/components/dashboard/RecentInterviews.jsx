export default function RecentInterviews() {
  const interviews = [
    { title: "Frontend Engineer", date: "Jun 15, 2026", status: "Completed" },
    { title: "Backend Developer", date: "Jun 10, 2026", status: "Pending" },
    { title: "Data Analyst", date: "Jun 05, 2026", status: "Completed" },
  ];

  return (
    <div style={{ marginTop: "2rem", padding: "1.5rem", borderRadius: "1.25rem", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(148,163,184,0.12)" }}>
      <h3 style={{ color: "#fff", marginBottom: "1rem" }}>Recent Interviews</h3>
      <div style={{ display: "grid", gap: "0.75rem" }}>
        {interviews.map((item) => (
          <div key={item.title} style={{ padding: "1rem", borderRadius: "1rem", background: "rgba(148,163,184,0.06)" }}>
            <h4 style={{ color: "#f8fafc", margin: 0 }}>{item.title}</h4>
            <p style={{ color: "#94a3b8", margin: "0.35rem 0 0" }}>{item.date}</p>
            <span style={{ color: item.status === "Completed" ? "#22c55e" : "#facc15", fontWeight: 600 }}>{item.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
