"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  defs,
  linearGradient,
  stop,
  Area,
  AreaChart,
} from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
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
        <p style={{ color: "#94a3b8", fontSize: "0.78rem", marginBottom: "0.3rem" }}>{label}</p>
        <p style={{ color: "#a5b4fc", fontWeight: 700, fontSize: "1rem", margin: 0 }}>
          {payload[0].value} users
        </p>
      </div>
    );
  }
  return null;
};

export default function UserGrowthChart({ data = [] }) {
  if (!data.length) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 220, color: "#475569" }}>
        No user growth data yet
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="userGrowthGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" vertical={false} />
        <XAxis
          dataKey="month"
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
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="users"
          stroke="#6366f1"
          strokeWidth={2.5}
          fill="url(#userGrowthGrad)"
          dot={{ fill: "#6366f1", strokeWidth: 0, r: 4 }}
          activeDot={{ fill: "#a5b4fc", r: 6, strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
