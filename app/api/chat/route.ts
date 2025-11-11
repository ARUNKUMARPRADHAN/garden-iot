import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { query } = await req.json()

  if (!query) {
    return NextResponse.json({ error: 'Missing query' }, { status: 400 })
  }

  try {
    console.log('🪴 GardenBot query:', query)

    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000', // or your deployed domain
        'X-Title': 'Smart Garden Dashboard',
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-20b:free',
        messages: [
          {
            role: 'system',
            content:
              'You are GardenBot 🌿 — a friendly AI that helps users with plant care, watering, soil, and garden automation. Keep answers short, clear, and kind.',
          },
          { role: 'user', content: query },
        ],
      }),
    })

    console.log('🌿 OpenRouter status:', res.status)
    const data = await res.json()
    console.log('🌱 Full OpenRouter response:', data)

    const ai_reply =
      data?.choices?.[0]?.message?.content ??
      '🌿 Sorry, I couldn’t think of an answer right now.'

    return NextResponse.json({ ai_reply })
  } catch (err) {
    console.error('🔥 Error contacting AI:', err)
    return NextResponse.json({ error: 'Error contacting AI' }, { status: 500 })
  }
}


