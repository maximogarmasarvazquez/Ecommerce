import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { MercadoPagoConfig, Preference } from 'mercadopago'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { order_id } = body

    if (!order_id) {
      return NextResponse.json({ error: 'order_id requerido' }, { status: 400 })
    }

    // Cargar la orden y verificar que pertenece al usuario
    const { data: order } = await supabase
      .from('orders')
      .select(`
        id,
        status,
        total_amount,
        shipping_cost,
        shipping_address,
        customer_id
      `)
      .eq('id', order_id)
      .single()

    if (!order) {
      return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 })
    }

    // Cargar items de la orden con nombres de productos (usando service_role para datos completos)
    const supabaseAdmin = createAdminClient()

    const { data: orderItems } = await supabaseAdmin
      .from('order_items')
      .select(`
        quantity,
        unit_price,
        product:products(name)
      `)
      .eq('order_id', order_id)

    if (!orderItems || orderItems.length === 0) {
      return NextResponse.json({ error: 'Orden sin items' }, { status: 400 })
    }

    const client = new MercadoPagoConfig({
      accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
    })

    const preference = new Preference(client)

    const result = await preference.create({
      body: {
        items: orderItems.map((item: any, index: number) => ({
          id: String(index + 1),
          title: item.product?.name || 'Producto',
          quantity: item.quantity,
          unit_price: item.unit_price / 100,
          currency_id: 'ARS',
        })),
        payer: {
          name: (order.shipping_address as any)?.name || '',
          email: user.email || '',
        },
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/success`,
          failure: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout`,
          pending: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout`,
        },
        external_reference: order_id,
        auto_return: 'approved',
      },
    })

    return NextResponse.json({
      init_point: result.init_point,
      id: result.id,
    })
  } catch (error) {
    console.error('MercadoPago error:', error)
    return NextResponse.json(
      { error: 'Error creating payment preference' },
      { status: 500 }
    )
  }
}
