import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { calculateShipping } from '@/lib/shipping'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { items, shipping_address } = body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Carrito vacio' }, { status: 400 })
    }

    if (!shipping_address || !shipping_address.name || !shipping_address.address || !shipping_address.city) {
      return NextResponse.json({ error: 'Direccion de envio incompleta' }, { status: 400 })
    }

    if (!shipping_address.postal_code) {
      return NextResponse.json({ error: 'Codigo postal requerido' }, { status: 400 })
    }

    const supabaseAdmin = createAdminClient()
    const productIds = items.map((item: { id: string }) => item.id)

    const { data: products } = await supabaseAdmin
      .from('products')
      .select('id, name, price, inventory, is_active')
      .in('id', productIds)

    if (!products || products.length !== productIds.length) {
      return NextResponse.json({ error: 'Producto(s) inexistente(s)' }, { status: 400 })
    }

    for (const product of products) {
      if (!product.is_active) {
        return NextResponse.json({ error: `Producto ${product.name} no disponible` }, { status: 400 })
      }
    }

    const itemMap = new Map(items.map((i: { id: string; quantity: number }) => [i.id, i.quantity]))

    for (const product of products) {
      const qty = itemMap.get(product.id)!
      if (qty <= 0) {
        return NextResponse.json({ error: `Cantidad invalida para ${product.name}` }, { status: 400 })
      }
      if (product.inventory < qty) {
        return NextResponse.json({ error: `Stock insuficiente para ${product.name}` }, { status: 400 })
      }
    }

    const shippingResult = await calculateShipping(items, shipping_address.postal_code)
    const shippingCostCents = Math.round(shippingResult.rates[0]?.price * 100) || 0

    const orderItems = items.map((item: { id: string; quantity: number }) => ({
      product_id: item.id,
      quantity: item.quantity,
    }))

    const { data: orderResult, error: orderError } = await supabase.rpc('create_order', {
      p_items: JSON.stringify(orderItems),
      p_shipping_address: shipping_address,
      p_shipping_cost: shippingCostCents,
    })

    if (orderError) {
      console.error('create_order error:', orderError)
      return NextResponse.json({ error: orderError.message }, { status: 500 })
    }

    const orderId = orderResult.order_id

    // Mock payment: marcar como pagada directamente (portfolio mode)
    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update({
        status: 'paid',
        payment_status: 'approved',
        paid_at: new Date().toISOString(),
      })
      .eq('id', orderId)

    if (updateError) {
      console.error('Error updating order to paid:', updateError)
    }

    return NextResponse.json({
      order_id: orderId,
      shipping_cost: shippingCostCents,
    })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Error al procesar el pedido' },
      { status: 500 }
    )
  }
}
