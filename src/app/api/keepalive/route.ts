import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  const startTime = performance.now()
  const timestamp = new Date().toISOString()

  console.log('KEEPALIVE START', timestamp)

  try {
    const supabase = createAdminClient()
    const queryStart = performance.now()

    const { error } = await supabase
      .from('categories')
      .select('id')
      .limit(1)

    const queryDurationMs = Math.round(performance.now() - queryStart)

    if (error) {
      console.error('KEEPALIVE ERROR', JSON.stringify({
        time: new Date().toISOString(),
        queryDurationMs,
        error: error.message,
      }))
      return NextResponse.json(
        { success: false, timestamp, durationMs: Math.round(performance.now() - startTime) },
        { status: 503 }
      )
    }

    const totalDurationMs = Math.round(performance.now() - startTime)
    console.log('KEEPALIVE END', JSON.stringify({ durationMs: totalDurationMs, success: true }))

    return NextResponse.json({ success: true, timestamp, durationMs: totalDurationMs })
  } catch (err) {
    const error = err as Error
    console.error('KEEPALIVE CRASH', JSON.stringify({
      time: new Date().toISOString(),
      error: error.message,
    }))
    return NextResponse.json(
      { success: false, timestamp, durationMs: Math.round(performance.now() - startTime) },
      { status: 500 }
    )
  }
}
