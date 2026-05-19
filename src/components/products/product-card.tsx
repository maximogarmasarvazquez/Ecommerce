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
    <Link href={`/products/${product.id}`} className="block">
      <div className="bg-white border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
        <div className="relative h-48 bg-gray-200">
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-cover"
          />
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-1 line-clamp-1">{product.name}</h3>
          <p className="text-gray-500 text-sm mb-2 line-clamp-2">{product.description}</p>
          <div className="flex items-center justify-between">
            <span className="text-orange-600 font-bold text-xl">
              ${(product.price / 100).toLocaleString('es-AR')}
            </span>
            <button
              onClick={handleAddToCart}
              disabled={product.inventory === 0}
              className="bg-orange-600 text-white px-3 py-2 rounded-lg hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="text-sm">Agregar</span>
            </button>
          </div>
          {product.inventory === 0 && (
            <p className="text-red-500 text-sm mt-2">Sin stock</p>
          )}
        </div>
      </div>
    </Link>
  )
}