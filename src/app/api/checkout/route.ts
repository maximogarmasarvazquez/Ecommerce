import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { MercadoPagoConfig, Preference } from 'mercadopago'

const FREE_SHIPPING_MIN = 200000

function calculateShippingCost(totalAmount: number): number {
  return totalAmount >= FREE_SHIPPING_MIN ? 0 : 15000
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { customer_id, items, shipping_address } = body

    if (!customer_id) {
      return NextResponse.json({ error: 'customer_id requerido' }, { status: 400 })
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Carrito vacio' }, { status: 400 })
    }

    if (!shipping_address || !shipping_address.name || !shipping_address.address || !shipping_address.city) {
      return NextResponse.json({ error: 'Direccion de envio incompleta' }, { status: 400 })
    }

    // Verificar que el customer pertenece al usuario autenticado
    const { data: customer } = await supabase
      .from('customers')
      .select('id')
      .eq('id', customer_id)
      .eq('user_id', user.id)
      .single()

    if (!customer) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 403 })
    }

    // Validar que todos los productos existen, estan activos, y obtener precios reales
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

    // Validar stock y calcular total REAL
    let totalAmount = 0
    const itemMap = new Map(items.map((i: { id: string; quantity: number }) => [i.id, i.quantity]))

    for (const product of products) {
      const qty = itemMap.get(product.id)!
      if (qty <= 0) {
        return NextResponse.json({ error: `Cantidad invalida para ${product.name}` }, { status: 400 })
      }
      if (product.inventory < qty) {
        return NextResponse.json({ error: `Stock insuficiente para ${product.name}` }, { status: 400 })
      }
      totalAmount += product.price * qty
    }

    // Calcular costo de envio server-side
    const shippingCost = calculateShippingCost(totalAmount)

    // Preparar items para la funcion create_order (solo id + quantity, sin precio)
    const orderItems = items.map((item: { id: string; quantity: number }) => ({
      product_id: item.id,
      quantity: item.quantity,
    }))

    // Ejecutar create_order en una transaccion (via funcion DB)
    const { data: orderResult, error: orderError } = await supabaseAdmin.rpc('create_order', {
      p_customer_id: customer_id,
      p_items: JSON.stringify(orderItems),
      p_shipping_address: shipping_address,
      p_shipping_cost: shippingCost,
    })

    if (orderError) {
      console.error('create_order error:', orderError)
      return NextResponse.json({ error: orderError.message }, { status: 500 })
    }

    const orderId = orderResult.order_id

    // Buscar productos con sus nombres para la preferencia de MP
    const { data: orderItemsWithProducts } = await supabaseAdmin
      .from('order_items')
      .select(`
        quantity,
        unit_price,
        product:products(name)
      `)
      .eq('order_id', orderId)

    // Crear preferencia de Mercado Pago con precios REALES de DB
    const mpClient = new MercadoPagoConfig({
      accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
    })

    const preference = new Preference(mpClient)
    const mpResult = await preference.create({
      body: {
        items: (orderItemsWithProducts || []).map((item: any, index: number) => ({
          id: String(index + 1),
          title: item.product?.name || 'Producto',
          quantity: item.quantity,
          unit_price: item.unit_price / 100,
          currency_id: 'ARS',
        })),
        payer: {
          name: shipping_address.name,
          email: shipping_address.email || user.email,
        },
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/success`,
          failure: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout`,
          pending: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout`,
        },
        external_reference: orderId,
        auto_return: 'approved',
      },
    })

    return NextResponse.json({
      init_point: mpResult.init_point,
      order_id: orderId,
    })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Error al procesar el pedido' },
      { status: 500 }
    )
  }
}
