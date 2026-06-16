'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Package, LogOut, Save, AlertCircle, Loader2, User, Leaf } from 'lucide-react'
import type { Order, Profile } from '@/lib/supabase/types'

interface OrderItemWithProduct {
  quantity: number
  unit_price: number
  product: { name: string } | null
}

interface OrderWithItems extends Order {
  order_items: OrderItemWithProduct[]
}

const statusLabels: Record<string, string> = {
  pending: 'Pendiente',
  paid: 'Pagado',
  shipped: 'Enviado',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
}

  const statusColors: Record<string, string> = {
    pending: 'text-amber-600',
    paid: 'text-emerald-600',
    shipped: 'text-sky-600',
    delivered: 'text-stone-600',
    cancelled: 'text-red-600',
  }

export default function AccountPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [orders, setOrders] = useState<OrderWithItems[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [profileForm, setProfileForm] = useState({
    full_name: '',
    phone: '',
    address: '',
    city: '',
    province: '',
    postal_code: '',
  })
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      setUser(user)

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profile) {
        setProfile(profile)
        const addr = (profile.shipping_address || {}) as Record<string, string>
        setProfileForm({
          full_name: profile.full_name || '',
          phone: profile.phone || '',
          address: addr.address || '',
          city: addr.city || '',
          province: addr.province || '',
          postal_code: addr.postal_code || '',
        })

        const { data: ordersData } = await supabase
          .from('orders')
          .select(`
            *,
            order_items (
              quantity,
              unit_price,
              product:products (name)
            )
          `)
          .eq('customer_id', profile.id)
          .order('created_at', { ascending: false })

        if (ordersData) {
          setOrders(ordersData as OrderWithItems[])
        }
      }

      setLoading(false)
    }

    fetchData()
  }, [supabase, router])

  const handleSaveProfile = async () => {
    if (!profile) return
    setSaving(true)
    setError(null)

    const { error: err } = await supabase
      .from('profiles')
      .update({
        full_name: profileForm.full_name,
        phone: profileForm.phone,
        shipping_address: {
          address: profileForm.address,
          city: profileForm.city,
          province: profileForm.province,
          postal_code: profileForm.postal_code,
        },
      })
      .eq('id', profile.id)

    if (err) {
      setError('Error al guardar los datos')
    }
    setSaving(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-emerald-900 flex items-center gap-3">
          <Leaf className="w-8 h-8 text-emerald-600" />
          Mi Cuenta
        </h1>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-stone-600 hover:text-red-600 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Cerrar Sesión
        </button>
      </div>

      <div className="bg-white border border-stone-200 rounded-xl p-6 mb-8 shadow-sm">
        <h2 className="text-xl font-bold mb-4 text-emerald-900 flex items-center gap-2">
          <User className="w-5 h-5 text-emerald-600" />
          Mis Datos
        </h2>
        {error && (
          <div className="flex items-center gap-2 text-red-500 mb-4 text-sm">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nombre completo</label>
            <input
              type="text"
              value={profileForm.full_name}
              onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
              className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-stone-700">Email</label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full px-4 py-2 border border-stone-300 rounded-lg bg-stone-50 text-stone-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-stone-700">Teléfono</label>
            <input
              type="tel"
              value={profileForm.phone}
              onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
              className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-stone-700">Dirección</label>
            <input
              type="text"
              value={profileForm.address}
              onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
              className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-stone-700">Ciudad</label>
            <input
              type="text"
              value={profileForm.city}
              onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
              className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-stone-700">Provincia</label>
            <input
              type="text"
              value={profileForm.province}
              onChange={(e) => setProfileForm({ ...profileForm, province: e.target.value })}
              className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-stone-700">Código Postal</label>
            <input
              type="text"
              value={profileForm.postal_code}
              onChange={(e) => setProfileForm({ ...profileForm, postal_code: e.target.value })}
              className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
        </div>
        <button
          onClick={handleSaveProfile}
          disabled={saving}
          className="mt-4 bg-emerald-700 text-white px-6 py-2 rounded-lg font-semibold hover:bg-emerald-600 disabled:opacity-50 flex items-center gap-2 transition-colors"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>

      <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-emerald-900">
          <Package className="w-5 h-5 text-emerald-600" />
          Mis Pedidos
        </h2>

        {orders.length === 0 ? (
          <p className="text-stone-500">No tenés pedidos aún</p>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="border border-stone-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-mono text-sm text-gray-500">
                      #{order.id.slice(0, 8)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString('es-AR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">
                      ${(order.total_amount / 100).toLocaleString('es-AR')}
                    </p>
                    <span className={`text-sm font-medium ${statusColors[order.status] || 'text-gray-500'}`}>
                      {statusLabels[order.status] || order.status}
                    </span>
                  </div>
                </div>

                {/* Order Items */}
                {order.order_items && order.order_items.length > 0 && (
                  <div className="border-t pt-3 space-y-2">
                    {order.order_items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm text-gray-600">
                        <span>
                          {item.product?.name || 'Producto'} x{item.quantity}
                        </span>
                        <span>${((item.unit_price * item.quantity) / 100).toLocaleString('es-AR')}</span>
                      </div>
                    ))}
                    {order.shipping_cost > 0 && (
                      <div className="flex justify-between text-sm text-gray-600 border-t pt-2">
                        <span>Envio</span>
                        <span>${(order.shipping_cost / 100).toLocaleString('es-AR')}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm font-semibold border-t pt-2">
                      <span>Total</span>
                      <span>${(order.total_amount / 100).toLocaleString('es-AR')}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
