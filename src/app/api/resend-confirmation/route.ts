import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email requerido' }, { status: 400 })
    }

    const supabase = createAdminClient()

    const { data: userList, error: listError } = await supabase.auth.admin.listUsers()

    if (listError) {
      return NextResponse.json({ error: listError.message }, { status: 500 })
    }

    const user = userList.users.find((u) => u.email === email)

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado. Registrate primero.' }, { status: 404 })
    }

    if (user.email_confirmed_at) {
      return NextResponse.json({ error: 'Este email ya fue confirmado. Inicia sesión.' }, { status: 400 })
    }

    const { error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      { email_confirm: true }
    )

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Cuenta confirmada automáticamente. Ya podés iniciar sesión.',
    })
  } catch (error) {
    console.error('Resend confirmation error:', error)
    return NextResponse.json({ error: 'Error al confirmar usuario' }, { status: 500 })
  }
}
