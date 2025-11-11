"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import type { SensorRow } from "@/lib/types";

export default function MoistureChart({ data }: { data: SensorRow[] }) {
  // Format for chart: latest first, convert ts to HH:mm
  const formatted = data.slice(0, 25).reverse().map(d => ({
    time: new Date(d.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    value: d.value, }));

  return (
    <div style={{ width: "100%", height: 300, background: "#fff", borderRadius: 12, padding: 12, border: "1px solid #eee" }}>
    <h3 style={{ marginBottom: 8 }}>📈 Moisture Trend</h3>
    <ResponsiveContainer width="100%" height="90%">
        <LineChart data={formatted}>
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <CartesianGrid strokeDasharray="3 3" />
        <Line type="monotone" dataKey="value" stroke="#2e7d32" strokeWidth={2} dot={false} />
        </LineChart>
    </ResponsiveContainer>
    </div> );
}
