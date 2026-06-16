'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { CheckCircle, Leaf } from 'lucide-react'

function CheckoutSuccessContent() {
  const searchParams = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search)
    : null
  const orderId = searchParams?.get('order_id') || ''

  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <div className="max-w-md mx-auto">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-emerald-600" />
        </div>
        <h1 className="text-3xl font-bold mb-4 text-emerald-900">¡Pedido Confirmado!</h1>
        <p className="text-stone-600 mb-2">
          Tu pedido fue recibido y procesado con éxito.
        </p>
        {orderId && (
          <p className="text-stone-500 mb-6">
            Número de pedido: <span className="font-mono font-semibold text-emerald-700">{orderId.slice(0, 8)}</span>
          </p>
        )}
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-8 text-sm text-emerald-800">
          <Leaf className="w-4 h-4 inline mr-1" />
          Gracias por tu compra. En los próximos días recibirás tus plantas en la dirección indicada.
        </div>
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
