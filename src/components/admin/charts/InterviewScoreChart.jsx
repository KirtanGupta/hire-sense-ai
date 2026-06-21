"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length && payload[0].value !== null) {
    return (
      <div
        style={{
          background: "rgba(5,8,22,0.95)",
          border: "1px solid rgba(139,92,246,0.3)",
          borderRadius: "0.75rem",
          padding: "0.75rem 1rem",
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        }}
      >
        <p style={{ color: "#94a3b8", fontSize: "0.78rem", marginBottom: "0.3rem" }}>{label}</p>
        <p style={{ color: "#c4b5fd", fontWeight: 700, fontSize: "1rem", margin: 0 }}>
          {payload[0].value}% avg score
        </p>
      </div>
    );
  }
  return null;
};

export default function InterviewScoreChart({ data = [] }) {
  const hasData = data.some((d) => d.score !== null);

  if (!hasData) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 220, color: "#475569" }}>
        No evaluated interview data yet
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
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
          domain={[0, 100]}
          tick={{ fill: "#64748b", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${v}%`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="score"
          stroke="#8b5cf6"
          strokeWidth={2.5}
          fill="url(#scoreGrad)"
          dot={{ fill: "#8b5cf6", strokeWidth: 0, r: 4 }}
          activeDot={{ fill: "#c4b5fd", r: 6, strokeWidth: 0 }}
          connectNulls={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
