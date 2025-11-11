'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Row = {
  id: string
  device_id: string
  command: string
  payload: any
  ts: string
}

export default function ControlEventsPanel({ deviceId = 'node-1' }: { deviceId?: string }) {
  const [rows, setRows] = useState<Row[]>([])

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('control_events')
        .select('*')
        .eq('device_id', deviceId)
        .order('ts', { ascending: false })
        .limit(20)
      setRows(data ?? [])
    }
    load()

    const ch = supabase
      .channel('control_events_rt')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'control_events' },
        (payload) => {
          const row = payload.new as Row
          if (row.device_id === deviceId) {
            setRows((prev) => [row, ...prev].slice(0, 50))
          }
        }
      )
      .subscribe()
       // --- ✅ NEW: Realtime for sensor_data
    const sensorChannel = supabase
    .channel('sensor_data_rt')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'sensor_data' },
      (payload) => {
        const newSensor = payload.new
        console.log('📡 New sensor data:', newSensor)
        // you can later set this in state or trigger your pump logic here
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(ch)
    supabase.removeChannel(sensorChannel)
  }
  }, [deviceId])

  return (
    <div className="rounded-2xl border bg-white shadow-sm">
      <div className="border-b p-3 text-sm font-medium">Recent commands</div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left">Time</th>
              <th className="px-3 py-2 text-left">Command</th>
              <th className="px-3 py-2 text-left">Payload</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id} className="border-t">
                <td className="px-3 py-2">{new Date(r.ts).toLocaleString()}</td>
                <td className="px-3 py-2">{r.command}</td>
                <td className="px-3 py-2"><code className="text-xs">{JSON.stringify(r.payload)}</code></td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={3} className="px-3 py-3 text-gray-500">No commands yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
