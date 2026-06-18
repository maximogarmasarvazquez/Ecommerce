'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle, Leaf, Package, MapPin } from 'lucide-react'

function CheckoutSuccessContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('order_id') || ''
  const [order, setOrder] = useState<any>(null)
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!orderId) {
      setLoading(false)
      return
    }
    const fetchOrder = async () => {
      const supabase = createClient()
      const { data: orderData } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single()
      if (orderData) {
        setOrder(orderData)
        const { data: itemsData } = await supabase
          .from('order_items')
          .select('*, products!inner(name)')
          .eq('order_id', orderId)
        if (itemsData) setItems(itemsData)
      }
      setLoading(false)
    }
    fetchOrder()
  }, [orderId])

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-emerald-600" />
          </div>
          <h1 className="text-3xl font-bold text-emerald-900">¡Pedido Confirmado!</h1>
          <p className="text-stone-600 mt-2">
            Tu pedido fue recibido y procesado con éxito.
          </p>
          {orderId && (
            <p className="text-stone-500 mt-2">
              Número de pedido: <span className="font-mono font-semibold text-emerald-700">{orderId.slice(0, 8)}</span>
            </p>
          )}
        </div>

        {loading && <p className="text-center text-stone-400">Cargando detalles...</p>}

        {order && (
          <div className="space-y-4 mb-8">
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-sm text-emerald-800">
              <Leaf className="w-4 h-4 inline mr-1" />
              Gracias por tu compra. En los próximos días recibirás tus plantas en la dirección indicada.
            </div>

            <div className="bg-white border border-stone-200 rounded-lg p-4">
              <h2 className="font-semibold text-stone-800 mb-3 flex items-center gap-2">
                <Package className="w-4 h-4" /> Productos
              </h2>
              <div className="space-y-2">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-stone-600">
                      {item.products?.name || 'Producto'} x{item.quantity}
                    </span>
                    <span className="font-medium text-stone-800">
                      ${((item.unit_price * item.quantity) / 100).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-stone-200 rounded-lg p-4">
              <h2 className="font-semibold text-stone-800 mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Envío
              </h2>
              <p className="text-sm text-stone-600">
                {order.shipping_address?.name}<br />
                {order.shipping_address?.address}<br />
                {order.shipping_address?.city}, {order.shipping_address?.province} ({order.shipping_address?.postal_code})
              </p>
            </div>

            <div className="bg-white border border-stone-200 rounded-lg p-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-stone-600">Subtotal</span>
                <span className="text-stone-800">${((order.total_amount - order.shipping_cost) / 100).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-stone-600">Envío</span>
                <span className="text-stone-800">${(order.shipping_cost / 100).toLocaleString()}</span>
              </div>
              <div className="border-t border-stone-200 pt-2 flex justify-between font-semibold text-stone-800">
                <span>Total</span>
                <span>${(order.total_amount / 100).toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-4 justify-center">
          <Link
            href="/products"
            className="bg-emerald-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-600 transition-colors"
          >
            Seguir Comprando
          </Link>
          <Link
            href="/account"
            className="border-2 border-emerald-700 text-emerald-700 px-6 py-3 rounded-lg font-semibold hover:bg-emerald-50 transition-colors"
          >
            Mis Pedidos
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-16 text-center">Cargando...</div>}>
      <CheckoutSuccessContent />
    </Suspense>
  )
}
