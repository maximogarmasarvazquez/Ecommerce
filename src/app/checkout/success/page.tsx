'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { CheckCircle } from 'lucide-react'

function CheckoutSuccessContent() {
  const searchParams = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search)
    : null
  const orderId = searchParams?.get('order_id') || ''

  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
      <h1 className="text-3xl font-bold mb-4">¡Pedido Confirmado!</h1>
      <p className="text-gray-600 mb-2">
        Tu pedido ha sido recibido correctamente.
      </p>
      {orderId && (
        <p className="text-gray-500 mb-8">
          Número de pedido: <span className="font-mono">{orderId.slice(0, 8)}</span>
        </p>
      )}
      <p className="text-gray-600 mb-8">
        Te enviaremos un email con los detalles de tu pedido.
      </p>
      <div className="flex gap-4 justify-center">
        <Link
          href="/products"
          className="bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700"
        >
          Seguir Comprando
        </Link>
        <Link
          href="/account"
          className="border border-orange-600 text-orange-600 px-6 py-3 rounded-lg font-semibold hover:bg-orange-50"
        >
          Mi Cuenta
        </Link>
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