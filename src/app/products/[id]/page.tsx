'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { useCart } from '@/hooks/use-cart'
import { ShoppingCart, ArrowLeft, AlertCircle, Package } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  images: string[]
  inventory: number
}

export default function ProductDetailPage() {
  const params = useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const { addItem } = useCart()
  const supabase = createClient()

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', params.id)
          .single()

        if (error) throw error
        setProduct(data)
      } catch (err) {
        console.error('Error fetching product:', err)
        setError('Error al cargar el producto')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchProduct()
    }
  }, [params.id, supabase])

  const handleAddToCart = () => {
    if (!product) return
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity,
      image: product.images?.[0],
    })
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-96 bg-gray-200 rounded-lg mb-8" />
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-4" />
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-8" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-gray-500 mb-4">{error}</p>
        <Link href="/products" className="text-emerald-700 hover:underline">
          Volver al catálogo
        </Link>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-stone-400">Producto no encontrado</p>
        <Link href="/products" className="text-emerald-700 hover:underline mt-4 inline-block">
          Volver al catalogo
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/products" className="inline-flex items-center text-stone-600 hover:text-emerald-700 mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Volver al catálogo
      </Link>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Image */}
        <div className="relative h-96 bg-gray-200 rounded-lg overflow-hidden">
          <Image
            src={product.images?.[0] || '/placeholder.jpg'}
            alt={product.name}
            fill
            className="object-cover"
          />
        </div>

        {/* Details */}
        <div>
          <span className="text-sm text-emerald-600 uppercase font-medium">{product.category}</span>
          <h1 className="text-3xl font-bold mb-4 text-emerald-900">{product.name}</h1>
          <p className="text-emerald-700 text-3xl font-bold mb-6">
            ${(product.price / 100).toLocaleString('es-AR')}
          </p>

          <p className="text-stone-600 mb-6">{product.description}</p>

          {/* Quantity */}
          <div className="flex items-center gap-4 mb-6">
            <span className="text-stone-700">Cantidad:</span>
            <div className="flex items-center border border-stone-300 rounded-lg">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-4 py-2 hover:bg-stone-100 text-stone-700"
              >
                -
              </button>
              <span className="px-4 py-2 text-stone-900">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(product.inventory, quantity + 1))}
                className="px-4 py-2 hover:bg-stone-100 text-stone-700"
              >
                +
              </button>
            </div>
          </div>

          {/* Stock */}
          <p className="text-sm text-stone-500 mb-6">
            {product.inventory > 0
              ? `${product.inventory} unidades disponibles`
              : 'Sin stock'}
          </p>

          {/* Add to Cart */}
          <button
            onClick={handleAddToCart}
            disabled={product.inventory === 0}
            className="w-full bg-emerald-700 text-white py-3 rounded-lg font-semibold hover:bg-emerald-600 disabled:bg-stone-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
          >
            <ShoppingCart className="w-5 h-5" />
            Agregar al Carrito
          </button>
        </div>
      </div>
    </div>
  )
}