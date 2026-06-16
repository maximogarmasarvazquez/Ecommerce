'use client'

import { useState, useEffect } from 'react'
import { useCart, type CartItem } from '@/hooks/use-cart'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Truck, Leaf, Package } from 'lucide-react'

interface ShippingRate {
  productType: string
  productName: string
  price: number
  deliveryTimeMin: string
  deliveryTimeMax: string
}

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart()
  const [loading, setLoading] = useState(false)
  const [shippingLoading, setShippingLoading] = useState(false)
  const [shippingRates, setShippingRates] = useState<ShippingRate[] | null>(null)
  const [shippingError, setShippingError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()
  const [profileId, setProfileId] = useState<string | null>(null)

  useEffect(() => {
    const getProfileId = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single()

      if (profile) {
        setProfileId(profile.id)
      }
    }

    getProfileId()
  }, [supabase, router])

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    province: '',
    postalCode: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handlePostalCodeBlur = async () => {
    if (!formData.postalCode || formData.postalCode.length < 4 || items.length === 0) return

    setShippingLoading(true)
    setShippingError(null)
    setShippingRates(null)

    try {
      const response = await fetch('/api/shipping/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((item: CartItem) => ({
            id: item.id,
            quantity: item.quantity,
          })),
          postal_code: formData.postalCode,
          province: formData.province,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al calcular envío')
      }

      setShippingRates(data.rates)
    } catch (error) {
      setShippingError(error instanceof Error ? error.message : 'Error al calcular envío')
    } finally {
      setShippingLoading(false)
    }
  }

  const shippingCost = shippingRates && shippingRates.length > 0
    ? Math.round(shippingRates[0].price * 100)
    : 0

  const estimatedDelivery = shippingRates && shippingRates.length > 0
    ? `${shippingRates[0].deliveryTimeMin} - ${shippingRates[0].deliveryTimeMax}`
    : null

  const totalWithShipping = total + shippingCost

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!profileId) {
        throw new Error('No se encontró el perfil')
      }

      if (!shippingRates || shippingRates.length === 0) {
        throw new Error('Calculá el costo de envío primero')
      }

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((item: CartItem) => ({
            id: item.id,
            quantity: item.quantity,
          })),
          shipping_address: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
            province: formData.province,
            postal_code: formData.postalCode,
          },
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al procesar el pedido')
      }

      clearCart()
      router.push(`/checkout/success?order_id=${data.order_id}`)
    } catch (error) {
      console.error('Error:', error)
      alert(error instanceof Error ? error.message : 'Hubo un error al procesar el pedido')
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Package className="w-12 h-12 text-stone-300 mx-auto mb-4" />
        <p className="text-stone-500">Tu carrito está vacío</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-emerald-900 flex items-center gap-2">
        <Leaf className="w-7 h-7 text-emerald-600" />
        Checkout
      </h1>

      <div className="grid lg:grid-cols-2 gap-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-4 text-emerald-900">Datos de Contacto</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-stone-700">Nombre completo</label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-stone-700">Email</label>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-stone-700">Teléfono</label>
                <input
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>

          <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-4 text-emerald-900">Dirección de Envío</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-stone-700">Dirección</label>
                <input
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-stone-700">Ciudad</label>
                  <input
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-stone-700">Provincia</label>
                  <input
                    name="province"
                    value={formData.province}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-stone-700">Código Postal</label>
                <input
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  onBlur={handlePostalCodeBlur}
                  className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !shippingRates}
            className="w-full bg-emerald-700 text-white py-4 rounded-xl font-semibold text-lg hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                Procesando...
              </span>
            ) : (
              `Confirmar Pedido - $${(totalWithShipping / 100).toLocaleString('es-AR')}`
            )}
          </button>
        </form>

        <div className="bg-white border border-stone-200 rounded-xl p-6 h-fit shadow-sm">
          <h2 className="text-xl font-bold mb-4 text-emerald-900">Resumen del Pedido</h2>
          <div className="space-y-3">
            {items.map(item => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-stone-700">
                  {item.name} <span className="text-stone-400">x{item.quantity}</span>
                </span>
                <span className="font-medium">${((item.price * item.quantity) / 100).toLocaleString('es-AR')}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-stone-200 mt-4 pt-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-stone-600">Subtotal</span>
              <span>${(total / 100).toLocaleString('es-AR')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-600 flex items-center gap-1">
                <Truck className="w-4 h-4" />
                Envío
              </span>
              {shippingLoading ? (
                <span className="text-stone-400 text-sm">Calculando...</span>
              ) : shippingRates ? (
                <div className="text-right">
                  <span>${(shippingCost / 100).toLocaleString('es-AR')}</span>
                  {estimatedDelivery && (
                    <p className="text-xs text-stone-400">{estimatedDelivery} días hábiles</p>
                  )}
                </div>
              ) : shippingError ? (
                <span className="text-red-500 text-sm">{shippingError}</span>
              ) : (
                <span className="text-stone-400 text-sm">Ingresá tu código postal</span>
              )}
            </div>
          </div>

          <div className="border-t border-stone-200 mt-4 pt-4">
            <div className="flex justify-between font-bold text-lg">
              <span className="text-emerald-900">Total</span>
              <span className="text-emerald-700">${(totalWithShipping / 100).toLocaleString('es-AR')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
