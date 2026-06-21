"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: "rgba(5,8,22,0.95)",
          border: "1px solid rgba(16,185,129,0.3)",
          borderRadius: "0.75rem",
          padding: "0.75rem 1rem",
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        }}
      >
        <p style={{ color: "#94a3b8", fontSize: "0.78rem", marginBottom: "0.3rem" }}>{label}</p>
        <p style={{ color: "#6ee7b7", fontWeight: 700, fontSize: "1rem", margin: 0 }}>
          {payload[0].value} resumes
        </p>
      </div>
    );
  }
  return null;
};

export default function SkillDistributionChart({ data = [] }) {
  if (!data.length) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 280, color: "#475569" }}>
        No skill data found in resumes
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
        barSize={16}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" horizontal={false} />
        <XAxis
          type="number"
          tick={{ fill: "#64748b", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <YAxis
          type="category"
          dataKey="skill"
          tick={{ fill: "#94a3b8", fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          width={80}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
        <Bar dataKey="count" radius={[0, 6, 6, 0]}>
          {data.map((_, i) => {
            const opacity = 1 - i * 0.07;
            return <Cell key={i} fill="#10b981" opacity={Math.max(opacity, 0.4)} />;
          })}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
