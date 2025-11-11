'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import type { SensorRow } from '@/lib/types' // or change path if you put it elsewhere
import PumpSwitch from './components/PumpSwitch'
import ControlEventsPanel from './components/ControlEventsPanel'
import MoistureChart from "./components/MoistureChart";
import MoistureGauge from "./components/MoistureGauge";







export default function Dashboard() {
  const [rows, setRows] = useState<SensorRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from('sensor_data')
        .select('*')
        .order('ts', { ascending: false })
        .limit(50)

      if (error) {
        console.error('Initial fetch error:', error.message)
      } else {
        setRows((data ?? []) as SensorRow[])
      }
      setLoading(false)
    }

    load()

    // Realtime subscription (requires table added to supabase_realtime)
    const channel = supabase
      .channel('realtime:sensor_data')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'sensor_data' },
        (payload) => {
          const next = payload.new as SensorRow
          // Prepend the newest row; keep at most 50
          setRows((prev) => (next ? [next, ...prev].slice(0, 50) : prev))
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Subscribed to sensor_data realtime ✅')
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])
useEffect(() => {
  const initChat = async () => {
    // ✅ Import chat package dynamically
    const { createChat } = await import("@n8n/chat");
    
    // ✅ Import styles dynamically (fixes Next.js module issue)
    

    createChat({
      webhookUrl: "https://n8n-production-f35f.up.railway.app/webhook/604cd85f-0e99-4a2e-987a-e3ad1064469f/chat",
      theme: {
        chatWindow: { backgroundColor: "#ffffff" },
        messageUser: { backgroundColor: "#e8f5e9", textColor: "#000" },
        messageBot: { backgroundColor: "#f1f8e9", textColor: "#333" },
      },
      initialMessages: [
        "🌱 Hi! I’m your Garden AI Assistant. Ask me anything about plants, watering, soil or sensors!"
      ]
    });
  };

  initChat();
}, []);


function getMoistureStatus(value: number) {
  if (value < 30)  return { label: "Dry Soil", emoji: "🔥", color: "#e65100", bg: "#fff3e0" };
  if (value > 70)  return { label: "Too Wet", emoji: "💦", color: "#0d47a1", bg: "#e3f2fd" };
  return { label: "Perfect Moisture", emoji: "🌿", color: "#1b5e20", bg: "#e8f5e9" };
}






  const latest = rows[0]
 
  return (
    
        <main style={styles.wrap}>
      <h1 style={{ margin: 0 }}>🌿 Smart Garden — Live Dashboard</h1>
      <p style={{ color: '#666', marginTop: 6 }}>
        Realtime data from <code>sensor_data</code>
      </p>

      {loading && <p>Loading…</p>}

      {!loading && latest && (
        <section style={styles.cards}>
          <Card title="Device" value={latest.device_id} />
          <Card title="Metric" value={latest.metric} />
          <Card title="Value" value={String(latest.value)} />
          <Card
            title="Updated"
            value={new Date(latest.ts).toLocaleString()}
          />
        </section>
      )}
      {/* pump control section */}
      <section style={{ marginTop: 40 }}>
  <h2 style={{ marginBottom: 8 }}>Controls</h2>
  <PumpSwitch deviceId="node-1" />
    </section>

     {/* command log section */}
<section style={{ marginTop: 40 }}>
  <details open className="bg-[#111] rounded-lg shadow-lg p-4 border border-[#2a2f36]">
    <summary className="cursor-pointer text-white font-semibold text-lg">
      ⚙️ Recent Commands
    </summary>
    <div className="mt-3">
      <ControlEventsPanel deviceId="node-1" />
    </div>
  </details>
</section>


{latest && (
  <div
    style={{
      marginTop: 16, padding: "10px 14px", display: "inline-flex", gap: 8,
      borderRadius: 10, background: getMoistureStatus(latest.value).bg,
      color: getMoistureStatus(latest.value).color, fontWeight: 600
    }}
  >
    <span>{getMoistureStatus(latest.value).emoji}</span>
    {getMoistureStatus(latest.value).label}
  </div>
)}
   
      {/* moisture chart section */}
<section style={{ marginTop: 40 }}>
  <MoistureChart data={rows} />
</section>
      {/* moisture gauge section */}
      <section style={{ marginTop: 24 }}>
  <MoistureGauge value={latest ? Number(latest.value) : 0} />
</section>

{/* status + gauge side by side */}
<section style={{ marginTop: 24, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
  <div>
    {latest && (
      <div style={{
        padding: "10px 14px", borderRadius: 10,
        background: getMoistureStatus(latest.value).bg,
        color: getMoistureStatus(latest.value).color, fontWeight: 600,
        display: "inline-flex", gap: 8
      }}>
        <span>{getMoistureStatus(latest.value).emoji}</span>
        {getMoistureStatus(latest.value).label}
      </div>
    )}
    <div style={{ marginTop: 16 }}>
      <Card title="Device" value={latest?.device_id ?? "-"} />
      <div style={{ height: 8 }} />
      <Card title="Updated" value={latest ? new Date(latest.ts).toLocaleString() : "-"} />
    </div>
  </div>

  <MoistureGauge value={latest ? Number(latest.value) : 0} />
</section>

      {!loading && rows.length === 0 && (
        <p>No data yet. Publish an MQTT message → n8n → Supabase to see rows here.</p>
      )}

      {rows.length > 0 && (
        <>
          <section style={{ marginTop: 40 }}>
  <details className="bg-[#111] rounded-lg shadow-lg p-4 border border-[#2a2f36]">
    <summary className="cursor-pointer text-white font-semibold text-lg">
      📊 Recent Telemetry
    </summary>

    <table className="w-full mt-3 border border-[#222] text-white text-sm">
      <thead className="bg-[#181818]">
        <tr>
          <th className="p-2 border-b border-[#333]">Time</th>
          <th className="p-2 border-b border-[#333]">Device</th>
          <th className="p-2 border-b border-[#333]">Metric</th>
          <th className="p-2 border-b border-[#333]">Value</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(r => (
          <tr key={r.id} className="hover:bg-[#1e1e1e]">
            <td className="p-2 border-b border-[#2a2a2a]">
              {new Date(r.ts).toLocaleTimeString()}
            </td>
            <td className="p-2 border-b border-[#2a2a2a]">{r.device_id}</td>
            <td className="p-2 border-b border-[#2a2a2a]">{r.metric}</td>
            <td className="p-2 border-b border-[#2a2a2a]">{r.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </details>
</section>

        </>
      )}







    </main>


  )
}





function Card({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-[#111] shadow-lg border border-[#222] backdrop-blur-xl p-4 rounded-xl text-white">
      <div className="text-xs text-gray-400">{title}</div>
      <div className="text-xl font-semibold">{value}</div>
    </div>
  )
}


const styles: Record<string, React.CSSProperties> = {
  wrap: {
    padding: 24,
    fontFamily:
      'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
    maxWidth: 980,
    margin: '0 auto',
    color: 'var(--text)',
  },
  cards: {
    display: 'flex',
    gap: 16,
    flexWrap: 'wrap',
    marginTop: 16,
  },
  card: {
    border: '1px solid var(--border)',
    background: 'var(--card)',
    padding: 12,
    borderRadius: 10,
    minWidth: 160,
  },
  table: {
    marginTop: 8,
    width: '100%',
    borderCollapse: 'collapse',
    border: '1px solid var(--table-border)',
    background: 'var(--card)',
    color: 'var(--text)',
  },
  th: {
    textAlign: 'left' as const,
    padding: 8,
    borderBottom: '1px solid var(--table-border)',
    background: 'var(--bg)',
    fontWeight: 600,
    color: 'var(--text)',
  },
  td: {
    padding: 8,
    borderBottom: '1px solid var(--row-border)',
    color: 'var(--text)',
  },



};





