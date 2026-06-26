import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  const startTime = performance.now()
  const timestamp = new Date().toISOString()

  const headers: Record<string, string> = {}
  request.headers.forEach((value, key) => {
    headers[key] = value
  })

  console.log('KEEPALIVE START', JSON.stringify({
    time: timestamp,
    url: request.url,
    headers,
  }))

  try {
    const supabase = createAdminClient()
    const queryStart = performance.now()

    const { error } = await supabase
      .from('categories')
      .select('id')
      .limit(1)

    const queryDurationMs = Math.round(performance.now() - queryStart)

    if (error) {
      const totalDurationMs = Math.round(performance.now() - startTime)
      console.error('KEEPALIVE ERROR', JSON.stringify({
        time: new Date().toISOString(),
        queryDurationMs,
        totalDurationMs,
        error: error.message,
        stack: error.stack,
      }))
      console.log('KEEPALIVE END', JSON.stringify({
        durationMs: totalDurationMs,
        success: false,
      }))
      return NextResponse.json(
        {
          success: false,
          timestamp,
          durationMs: totalDurationMs,
          headers,
        },
        { status: 503 }
      )
    }

    const totalDurationMs = Math.round(performance.now() - startTime)

    console.log('KEEPALIVE END', JSON.stringify({
      durationMs: totalDurationMs,
      success: true,
    }))

    return NextResponse.json({
      success: true,
      timestamp,
      durationMs: totalDurationMs,
      headers,
    })
  } catch (err) {
    const error = err as Error
    const totalDurationMs = Math.round(performance.now() - startTime)
    console.error('KEEPALIVE CRASH', JSON.stringify({
      time: new Date().toISOString(),
      totalDurationMs,
      error: error.message,
      stack: error.stack,
    }))
    console.log('KEEPALIVE END', JSON.stringify({
      durationMs: totalDurationMs,
      success: false,
    }))
    return NextResponse.json(
      {
        success: false,
        timestamp,
        durationMs: totalDurationMs,
        headers,
      },
      { status: 500 }
    )
  }
}
