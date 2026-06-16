import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  try {
    const supabase = createAdminClient()

    const { error } = await supabase
      .from('categories')
      .select('id')
      .limit(1)

    if (error) {
      console.error('[KeepAlive] Supabase query failed:', error.message)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 503 }
      )
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      message: 'Supabase keep alive successful',
    })
  } catch (err) {
    console.error('[KeepAlive] Unexpected error:', err)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
