"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const COLORS = ["#475569", "#6366f1", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b"];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: "rgba(5,8,22,0.95)",
          border: "1px solid rgba(6,182,212,0.3)",
          borderRadius: "0.75rem",
          padding: "0.75rem 1rem",
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        }}
      >
        <p style={{ color: "#94a3b8", fontSize: "0.78rem", marginBottom: "0.3rem" }}>Score: {label}</p>
        <p style={{ color: "#67e8f9", fontWeight: 700, fontSize: "1rem", margin: 0 }}>
          {payload[0].value} resumes
        </p>
      </div>
    );
  }
  return null;
};

export default function ResumeScoreChart({ data = [] }) {
  if (!data.length) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 220, color: "#475569" }}>
        No resume score data yet
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={32}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" vertical={false} />
        <XAxis
          dataKey="range"
          tick={{ fill: "#64748b", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "#64748b", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
        <Bar dataKey="count" radius={[6, 6, 0, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} opacity={0.85} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
