'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Package, ShoppingCart, Users, Plus, Edit, Trash2, Image as ImageIcon, Leaf } from 'lucide-react'
import type { Profile } from '@/lib/supabase/types'

interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  images: string[]
  inventory: number
  weight_grams: number | null
  width_cm: number | null
  height_cm: number | null
  depth_cm: number | null
  is_featured: boolean
  is_active: boolean
  created_at: string
}

interface Order {
  id: string
  status: string
  total_amount: number
  created_at: string
  shipping_address: any
}

interface Category {
  name: string
  slug: string
}

export default function AdminPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'customers'>('products')
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [customers, setCustomers] = useState<Profile[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkAdmin()
  }, [])

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/login')
      return
    }

    setUser(user)
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    
    if (profile?.role !== 'admin') {
      router.push('/')
      return
    }

    setIsAdmin(true)
    fetchProducts()
    fetchOrders()
    fetchCustomers()
    fetchCategories()
    setLoading(false)
  }

  const fetchProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (data) setProducts(data)
  }

  const fetchOrders = async () => {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (data) setOrders(data)
  }

  const fetchCustomers = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'customer')
      .order('created_at', { ascending: false })

    if (data) setCustomers(data)
  }

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('name, slug')
      .order('name')

    if (data) setCategories(data)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de desactivar este producto?')) return

    const { error } = await supabase
      .from('products')
      .update({ is_active: false, deleted_at: new Date().toISOString() })
      .eq('id', id)
    if (!error) fetchProducts()
  }

  const handleSaveProduct = async (product: Partial<Product>) => {
    if (editingProduct) {
      await supabase.from('products').update(product).eq('id', editingProduct.id)
    } else {
      await supabase.from('products').insert([product])
    }
    setShowModal(false)
    setEditingProduct(null)
    fetchProducts()
  }

  const handleStatusChange = async (orderId: string, status: string) => {
    await supabase.from('orders').update({ status }).eq('id', orderId)
    fetchOrders()
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p>Cargando...</p>
      </div>
    )
  }

  if (!isAdmin) return null

  const statusOptions = ['pending', 'paid', 'shipped', 'delivered', 'cancelled']

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-emerald-900 flex items-center gap-3">
        <Leaf className="w-8 h-8 text-emerald-600" />
        Panel de Administración
      </h1>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b">
        <button
          onClick={() => setActiveTab('products')}
          className={`pb-2 px-4 font-semibold ${activeTab === 'products' ? 'border-b-2 border-emerald-700 text-emerald-700' : 'text-stone-500 hover:text-stone-700'}`}
        >
          <Package className="w-5 h-5 inline mr-2" />
          Productos
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-2 px-4 font-semibold ${activeTab === 'orders' ? 'border-b-2 border-emerald-700 text-emerald-700' : 'text-stone-500 hover:text-stone-700'}`}
        >
          <ShoppingCart className="w-5 h-5 inline mr-2" />
          Pedidos
        </button>
        <button
          onClick={() => setActiveTab('customers')}
          className={`pb-2 px-4 font-semibold ${activeTab === 'customers' ? 'border-b-2 border-emerald-700 text-emerald-700' : 'text-stone-500 hover:text-stone-700'}`}
        >
          <Users className="w-5 h-5 inline mr-2" />
          Clientes
        </button>
      </div>

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div>
          <div className="flex justify-between mb-4">
            <h2 className="text-xl font-semibold">Gestión de Productos</h2>
            <button
              onClick={() => { setEditingProduct(null); setShowModal(true) }}
              className="bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-emerald-600 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Nuevo Producto
            </button>
          </div>

          <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full">
              <thead className="bg-stone-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-stone-700">Nombre</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-stone-700">Categoría</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-stone-700">Precio</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-stone-700">Stock</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-stone-700">Estado</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-stone-700">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product.id} className="border-t">
                    <td className="px-4 py-3">{product.name}</td>
                    <td className="px-4 py-3 capitalize">{product.category}</td>
                    <td className="px-4 py-3">${(product.price / 100).toLocaleString('es-AR')}</td>
                    <td className="px-4 py-3">{product.inventory}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs ${product.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {product.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setEditingProduct(product); setShowModal(true) }}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Todos los Pedidos</h2>
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order.id} className="bg-white border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-mono text-sm text-gray-500">#{order.id.slice(0, 8)}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString('es-AR')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">
                      ${(order.total_amount / 100).toLocaleString('es-AR')}
                    </p>
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className="text-sm border rounded px-2 py-1 mt-1"
                    >
                      {statusOptions.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
                {order.shipping_address && (
                  <div className="text-sm text-gray-600 mt-2">
                    <p>📍 {order.shipping_address.name}</p>
                    <p>{order.shipping_address.address}, {order.shipping_address.city}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Customers Tab */}
      {activeTab === 'customers' && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Todos los Clientes</h2>
          <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full">
              <thead className="bg-stone-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-stone-700">Nombre</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-stone-700">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-stone-700">Teléfono</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-stone-700">Dirección</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-stone-700">Registro</th>
                </tr>
              </thead>
              <tbody>
                {customers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                      No hay clientes registrados
                    </td>
                  </tr>
                ) : (
                  customers.map((c) => (
                    <tr key={c.id} className="border-t">
                      <td className="px-4 py-3">{c.full_name || '-'}</td>
                      <td className="px-4 py-3">{c.email || '-'}</td>
                      <td className="px-4 py-3">{c.phone || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-500 max-w-[200px] truncate">
                        {c.shipping_address?.address || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {new Date(c.created_at).toLocaleDateString('es-AR')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <ProductModal
          product={editingProduct}
          categories={categories}
          onSave={handleSaveProduct}
          onClose={() => { setShowModal(false); setEditingProduct(null) }}
        />
      )}
    </div>
  )
}

function ProductModal({ product, categories, onSave, onClose }: { product: Product | null, categories: Category[], onSave: (p: Partial<Product>) => void, onClose: () => void }) {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product ? product.price / 100 : 0,
    category: product?.category || 'interior',
    inventory: product?.inventory || 0,
    weight_grams: product?.weight_grams || '',
    width_cm: product?.width_cm || '',
    height_cm: product?.height_cm || '',
    depth_cm: product?.depth_cm || '',
    is_featured: product?.is_featured || false,
    is_active: product?.is_active ?? true,
    images: product?.images || [],
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      ...formData,
      price: Math.round(formData.price * 100),
      weight_grams: formData.weight_grams ? parseInt(formData.weight_grams as string) : null,
      width_cm: formData.width_cm ? parseInt(formData.width_cm as string) : null,
      height_cm: formData.height_cm ? parseInt(formData.height_cm as string) : null,
      depth_cm: formData.depth_cm ? parseInt(formData.depth_cm as string) : null,
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">
          {product ? 'Editar Producto' : 'Nuevo Producto'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nombre</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Descripción</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full border rounded px-3 py-2"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Precio ($)</label>
              <input
                type="number"
                value={formData.price}
                onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                className="w-full border rounded px-3 py-2"
                required
                min={0}
                step={0.01}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Stock</label>
              <input
                type="number"
                value={formData.inventory}
                onChange={e => setFormData({ ...formData, inventory: parseInt(e.target.value) })}
                className="w-full border rounded px-3 py-2"
                required
                min={0}
              />
            </div>
          </div>
          <fieldset className="border rounded p-4">
            <legend className="text-sm font-medium px-2">Peso y Dimensiones (para envío)</legend>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Peso (gramos)</label>
                <input
                  type="number"
                  value={formData.weight_grams as string}
                  onChange={e => setFormData({ ...formData, weight_grams: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  min={0}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Ancho (cm)</label>
                <input
                  type="number"
                  value={formData.width_cm as string}
                  onChange={e => setFormData({ ...formData, width_cm: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  min={0}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Alto (cm)</label>
                <input
                  type="number"
                  value={formData.height_cm as string}
                  onChange={e => setFormData({ ...formData, height_cm: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  min={0}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Profundidad (cm)</label>
                <input
                  type="number"
                  value={formData.depth_cm as string}
                  onChange={e => setFormData({ ...formData, depth_cm: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  min={0}
                />
              </div>
            </div>
          </fieldset>
            <div>
              <label className="block text-sm font-medium mb-1">Categoría</label>
            <select
              value={formData.category}
              onChange={e => setFormData({ ...formData, category: e.target.value })}
              className="w-full border rounded px-3 py-2"
            >
              {categories.length > 0 ? categories.map((cat) => (
                <option key={cat.slug} value={cat.slug}>{cat.name}</option>
              )) : (
                <>
                  <option value="interior">Interior</option>
                  <option value="exterior">Exterior</option>
                  <option value="suculentas">Suculentas</option>
                  <option value="macetas">Macetas</option>
                  <option value="accesorios">Accesorios</option>
                </>
              )}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              <ImageIcon className="w-4 h-4 inline mr-1" />
              Imagen (URL)
            </label>
            <input
              type="url"
              value={formData.images[0] || ''}
              onChange={e => setFormData({ ...formData, images: e.target.value ? [e.target.value] : [] })}
              placeholder="https://ejemplo.com/imagen.jpg"
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_featured}
                onChange={e => setFormData({ ...formData, is_featured: e.target.checked })}
              />
              Destacado
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
              />
              Activo
            </label>
          </div>
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              className="flex-1 bg-emerald-700 text-white py-2 rounded hover:bg-emerald-600 transition-colors"
            >
              Guardar
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border py-2 rounded hover:bg-gray-50"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}