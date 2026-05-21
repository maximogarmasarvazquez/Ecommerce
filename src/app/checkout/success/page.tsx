'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { CheckCircle, AlertCircle, Loader } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

function CheckoutSuccessContent() {
  const searchParams = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search)
    : null
  const orderId = searchParams?.get('order_id') || ''
  const [status, setStatus] = useState<'loading' | 'paid' | 'pending' | 'error'>('loading')

  useEffect(() => {
    if (!orderId) {
      setStatus('error')
      return
    }

    const checkOrder = async () => {
      const supabase = createClient()
      const { data: order } = await supabase
        .from('orders')
        .select('status')
        .eq('id', orderId)
        .single()

      if (order) {
        setStatus(order.status === 'paid' ? 'paid' : 'pending')
      } else {
        setStatus('error')
      }
    }

    // Dar tiempo a que MP redirija y el webhook se procese
    const timer = setTimeout(checkOrder, 3000)
    return () => clearTimeout(timer)
  }, [orderId])

  if (status === 'loading') {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Loader className="w-16 h-16 text-orange-500 mx-auto mb-6 animate-spin" />
        <h1 className="text-2xl font-bold mb-4">Verificando tu pago...</h1>
        <p className="text-gray-500">Por favor espera mientras confirmamos tu pago.</p>
      </div>
    )
  }

  if (status === 'paid') {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
        <h1 className="text-3xl font-bold mb-4">¡Pago Confirmado!</h1>
        <p className="text-gray-600 mb-2">
          Tu pedido ha sido recibido y pagado correctamente.
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

  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <AlertCircle className="w-20 h-20 text-yellow-500 mx-auto mb-6" />
      <h1 className="text-3xl font-bold mb-4">Pedido Pendiente</h1>
      <p className="text-gray-600 mb-2">
        Tu pedido fue creado pero el pago está pendiente de confirmación.
      </p>
      {orderId && (
        <p className="text-gray-500 mb-8">
          Número de pedido: <span className="font-mono">{orderId.slice(0, 8)}</span>
        </p>
      )}
      <p className="text-gray-600 mb-8">
        Si ya realizaste el pago, puede tardar unos minutos en confirmarse.
      </p>
      <div className="flex gap-4 justify-center">
        <Link
          href="/account"
          className="bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700"
        >
          Mis Pedidos
        </Link>
        <Link
          href="/products"
          className="border border-orange-600 text-orange-600 px-6 py-3 rounded-lg font-semibold hover:bg-orange-50"
        >
          Seguir Comprando
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
