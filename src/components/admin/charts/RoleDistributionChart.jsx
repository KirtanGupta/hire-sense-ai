"use client";

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const COLORS = [
  "#6366f1", "#8b5cf6", "#06b6d4", "#ec4899",
  "#f59e0b", "#10b981", "#f97316", "#3b82f6",
];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: "rgba(5,8,22,0.95)",
          border: "1px solid rgba(99,102,241,0.3)",
          borderRadius: "0.75rem",
          padding: "0.75rem 1rem",
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        }}
      >
        <p style={{ color: "#94a3b8", fontSize: "0.78rem", marginBottom: "0.3rem" }}>
          {payload[0].name}
        </p>
        <p style={{ color: "#f8fafc", fontWeight: 700, fontSize: "1rem", margin: 0 }}>
          {payload[0].value} interviews
        </p>
      </div>
    );
  }
  return null;
};

const CustomLegend = ({ payload }) => (
  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", justifyContent: "center", marginTop: "0.75rem" }}>
    {payload.map((entry, i) => (
      <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: entry.color, flexShrink: 0 }} />
        <span style={{ color: "#94a3b8", fontSize: "0.78rem" }}>{entry.value}</span>
      </div>
    ))}
  </div>
);

export default function RoleDistributionChart({ data = [] }) {
  if (!data.length) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 220, color: "#475569" }}>
        No interview role data yet
      </div>
    );
  }

  const chartData = data.map((d) => ({ name: d.role, value: d.count }));

  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="45%"
          innerRadius={55}
          outerRadius={85}
          paddingAngle={3}
          dataKey="value"
        >
          {chartData.map((_, index) => (
            <Cell
              key={`cell-${index}`}
              fill={COLORS[index % COLORS.length]}
              opacity={0.9}
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend content={<CustomLegend />} />
      </PieChart>
    </ResponsiveContainer>
  );
}
