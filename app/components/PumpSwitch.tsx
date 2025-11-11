"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function PumpSwitch({ deviceId }: { deviceId: string }) {
  const [loading, setLoading] = useState(false);
  const [state, setState] = useState<"on" | "off">("off");

  // 1) read last command on mount
  useEffect(() => {
    const init = async () => {
      const { data } = await supabase
        .from("control_events")
        .select("command,payload,ts")
        .eq("device_id", deviceId)
        .eq("command", "pump")
        .order("ts", { ascending: false })
        .limit(1);
      if (data?.[0]?.payload?.state === "on") setState("on");
      if (data?.[0]?.payload?.state === "off") setState("off");
    };
    init();

    // 2) realtime updates
    const ch = supabase
      .channel("control_events_pump_rt")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "control_events" },
        (payload: any) => {
          if (payload.new?.device_id !== deviceId) return;
          if (payload.new?.command === "pump") {
            const s = payload.new?.payload?.state;
            if (s === "on" || s === "off") setState(s);
          }
        }
      ).subscribe();

    return () => { supabase.removeChannel(ch); };
  }, [deviceId]);

  // 3) send command
  const send = async (newState: "on" | "off") => {
    if (loading || newState === state) return;
    setLoading(true);
    try {
      const res = await fetch("/api/mqtt/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceId,
          command: "pump",
          payload: { state: newState },
          qos: 1,
          retain: false,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      // UI will update via realtime insert from n8n → supabase
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const onActive  = state === "on";
  const offActive = state === "off";

  return (
    <div style={{
      display: "flex", flexDirection: "column", gap: 12, background: "#fff",
      border: "1px solid #eee", padding: 14, borderRadius: 12, width: 260
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <h3 style={{ margin: 0 }}>💧 Pump</h3>
        <span style={{
          fontSize: 12, padding: "2px 8px", borderRadius: 999,
          background: onActive ? "#e8f5e9" : "#ffebee",
          color: onActive ? "#1b5e20" : "#b71c1c",
          border: "1px solid #eee"
        }}>
          {onActive ? "Running" : "Stopped"}
        </span>
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <button
          disabled={loading || onActive}
          onClick={() => send("on")}
          style={{
            flex: 1, padding: "10px 0", borderRadius: 8, border: "none",
            cursor: loading || onActive ? "not-allowed" : "pointer",
            background: onActive ? "#4ade80" : "#e5e7eb",
            color: onActive ? "#fff" : "#111", fontWeight: 600
          }}
        >ON</button>

        <button
          disabled={loading || offActive}
          onClick={() => send("off")}
          style={{
            flex: 1, padding: "10px 0", borderRadius: 8, border: "none",
            cursor: loading || offActive ? "not-allowed" : "pointer",
            background: offActive ? "#f87171" : "#e5e7eb",
            color: offActive ? "#fff" : "#111", fontWeight: 600
          }}
        >OFF</button>
      </div>

      {loading && <div style={{ fontSize: 12, color: "#777" }}>sending…</div>}
      <div style={{ fontSize: 12, color: "#666" }}>Device: <b>{deviceId}</b></div>
    </div>
  );
}
