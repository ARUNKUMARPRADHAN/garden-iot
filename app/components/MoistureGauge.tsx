"use client";
import React from "react";

export default function MoistureGauge({ value = 0 }: { value: number }) {
  // clamp 0–100
  const v = Math.max(0, Math.min(100, Number(value) || 0));
  const size = 220;
  const stroke = 14;
  const r = (size - stroke) / 2;
  const cx = size / 2, cy = size / 2;
  const startAngle = 210; // left-bottom
  const endAngle = -30;   // right-bottom
  const angle = startAngle + (endAngle - startAngle) * (v / 100);
  const arc = (a: number) => {
    const rad = (a * Math.PI) / 180;
    return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
  };
  const [sx, sy] = arc(startAngle);
  const [ex, ey] = arc(endAngle);
  const largeArc = endAngle - startAngle <= -180 ? 1 : 0;

  const [nx, ny] = arc(angle);

  const color =
    v < 30 ? "#e65100" : v > 70 ? "#0d47a1" : "#1b5e20";
  const bg = "#eee";

  return (
    <div style={{ border: "2px solid #090808ff", borderRadius: 12, padding: 12, background: "#fff" }}>
      <h3 style={{ margin: 0, marginBottom: 6 }}>💧 Moisture Gauge</h3>
      <svg width={size} height={size/1.1} viewBox={`0 0 ${size} ${size}`}>
        {/* background arc */}
        <path
          d={`M ${sx} ${sy} A ${r} ${r} 0 ${largeArc} 1 ${ex} ${ey}`}
          stroke={bg}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
        />
        {/* needle */}
        <line x1={cx} y1={cy} x2={nx} y2={ny} stroke={color} strokeWidth={6} />
        {/* center dot */}
        <circle cx={cx} cy={cy} r={6} fill={color} />
        {/* text */}
        <text x={cx} y={cy + 35} textAnchor="middle" fontSize="16" fill="#333">
          {v}% moisture
        </text>
      </svg>
    </div>
    
  );
}
