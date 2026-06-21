"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#4ade80", "#f87171"];

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
        <p
          style={{
            color: payload[0].name === "Passed" ? "#4ade80" : "#f87171",
            fontWeight: 700,
            fontSize: "1rem",
            margin: 0,
          }}
        >
          {payload[0].value} candidates
        </p>
      </div>
    );
  }
  return null;
};

export default function SuccessRateChart({ data = [] }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const hasData = total > 0;

  const passed = data.find((d) => d.name === "Passed")?.value || 0;
  const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;

  return (
    <div style={{ position: "relative" }}>
      {!hasData ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: 240,
            color: "#475569",
          }}
        >
          No evaluated interview data yet
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={85}
                paddingAngle={4}
                dataKey="value"
                startAngle={90}
                endAngle={-270}
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} opacity={0.9} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          {/* Center label */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -62%)",
              textAlign: "center",
              pointerEvents: "none",
            }}
          >
            <p style={{ color: "#f8fafc", fontSize: "1.6rem", fontWeight: 800, margin: 0, lineHeight: 1 }}>
              {passRate}%
            </p>
            <p style={{ color: "#64748b", fontSize: "0.72rem", margin: "0.2rem 0 0" }}>Pass Rate</p>
          </div>

          {/* Legend */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "1.5rem",
              marginTop: "0.5rem",
            }}
          >
            {data.map((d, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: COLORS[i],
                    flexShrink: 0,
                  }}
                />
                <span style={{ color: "#94a3b8", fontSize: "0.82rem" }}>
                  {d.name}: <strong style={{ color: "#f8fafc" }}>{d.value}</strong>
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
