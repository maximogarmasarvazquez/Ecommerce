import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // MP envia: { type: "payment", data: { id: "12345" } }
    // o { action: "payment.created", data: { id: "12345" } }
    const paymentId = body.data?.id

    if (!paymentId) {
      return NextResponse.json({ error: 'No payment ID' }, { status: 400 })
    }

    // Obtener el access token de MP
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN

    // Consultar el estado real del pago en MP
    const mpResponse = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )

    if (!mpResponse.ok) {
      console.error('Error fetching MP payment:', await mpResponse.text())
      return NextResponse.json({ error: 'Error verifying payment' }, { status: 500 })
    }

    const payment = await mpResponse.json()

    // Solo procesar pagos aprobados
    if (payment.status !== 'approved') {
      return NextResponse.json({ received: true })
    }

    const orderId = payment.external_reference

    if (!orderId) {
      console.error('No external_reference in payment', paymentId)
      return NextResponse.json({ error: 'No order reference' }, { status: 400 })
    }

    // Actualizar orden a pagada usando service_role
    const supabaseAdmin = createAdminClient()

    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('status')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      console.error('Order not found:', orderId)
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Solo actualizar si esta pendiente (evitar regresiones)
    if (order.status === 'pending') {
      const { error: updateError } = await supabaseAdmin
        .from('orders')
        .update({ status: 'paid' })
        .eq('id', orderId)

      if (updateError) {
        console.error('Error updating order:', updateError)
        return NextResponse.json({ error: 'Error updating order' }, { status: 500 })
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
