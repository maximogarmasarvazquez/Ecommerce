'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/hooks/use-cart'
import { ShoppingCart } from 'lucide-react'

interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  images: string[]
  inventory: number
}

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart()
  const imageUrl = product.images?.[0] || '/placeholder.jpg'

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: imageUrl,
    })
  }

  return (
    <Link href={`/products/${product.id}`} className="block group">
      <div className="bg-white border border-stone-200 rounded-xl overflow-hidden hover:shadow-xl hover:border-emerald-200 transition-all duration-300">
        <div className="relative h-48 bg-stone-100 overflow-hidden">
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-1 line-clamp-1 text-emerald-900">{product.name}</h3>
          <p className="text-stone-500 text-sm mb-3 line-clamp-2">{product.description}</p>
          <div className="flex items-center justify-between">
            <span className="text-emerald-700 font-bold text-xl">
              ${(product.price / 100).toLocaleString('es-AR')}
            </span>
            <button
              onClick={handleAddToCart}
              disabled={product.inventory === 0}
              className="bg-emerald-700 text-white px-3 py-2 rounded-lg hover:bg-emerald-600 disabled:bg-stone-300 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="text-sm">Agregar</span>
            </button>
          </div>
          {product.inventory === 0 && (
            <p className="text-red-500 text-sm mt-2 font-medium">Sin stock</p>
          )}
        </div>
      </div>
    </Link>
  )
}