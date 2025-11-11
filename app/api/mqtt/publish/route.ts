import { NextResponse } from 'next/server'
import mqtt from 'mqtt'
import { supaAdmin } from '@/lib/supabaseAdmin'

export const runtime = 'nodejs' // ensure Node runtime

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { deviceId, command, payload = {}, qos = 1, retain = false } = body

    if (!deviceId || !command) {
      return NextResponse.json({ error: 'deviceId and command are required' }, { status: 400 })
    }

    const url = process.env.MQTT_URL
    const username = process.env.MQTT_USERNAME
    const password = process.env.MQTT_PASSWORD
    const base = process.env.MQTT_CMD_BASE || 'devices'

    if (!url) return NextResponse.json({ error: 'MQTT_URL missing' }, { status: 500 })

    const topic = `${base}/${deviceId}/cmd`
    const message = JSON.stringify({ command, payload, ts: new Date().toISOString() })

    // 1️⃣ publish to MQTT
    await new Promise<void>((resolve, reject) => {
      const client = mqtt.connect(url, {
        username,
        password,
        reconnectPeriod: 0,
        rejectUnauthorized: true,
      })
      client.once('connect', () => {
        client.publish(topic, message, { qos, retain }, (err) => {
          if (err) return reject(err)
          client.end(true, () => resolve())
        })
      })
      client.once('error', (e) => {
        client.end(true, {}, () => reject(e))
      })
    })

    // 2️⃣ log to Supabase
    const { error } = await supaAdmin
      .from('control_events')
      .insert([{ device_id: deviceId, command, payload, ts: new Date().toISOString() }])

    if (error) {
      console.error('⚠️ Supabase insert failed:', error.message)
    }

    return NextResponse.json({ ok: true, published: { topic, message, qos, retain } })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'publish failed' }, { status: 500 })
  }
}
