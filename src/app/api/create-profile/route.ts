import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  try {
    const { id, email, full_name } = await request.json()

    if (!id || !email) {
      return NextResponse.json({ error: 'id y email requeridos' }, { status: 400 })
    }

    const supabase = createAdminClient()

    const { error } = await supabase
      .from('profiles')
      .upsert({
        id,
        email,
        full_name: full_name || '',
        role: 'customer',
      }, { onConflict: 'id' })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Create profile error:', error)
    return NextResponse.json({ error: 'Error al crear perfil' }, { status: 500 })
  }
}
