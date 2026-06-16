'use client'

import Link from 'next/link'
import { useCart } from '@/hooks/use-cart'
import { Trash2, Minus, Plus, ShoppingBag, ArrowLeft } from 'lucide-react'
import { ProductImage } from '@/components/products/product-image'

export default function CartPage() {
  const { items, removeItem, updateQuantity, total } = useCart()

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <ShoppingBag className="w-16 h-16 text-stone-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2 text-emerald-900">Tu carrito está vacío</h2>
        <p className="text-stone-500 mb-6">Agregá plantas para comenzar</p>
        <Link
          href="/products"
          className="inline-block bg-emerald-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-600 transition-colors"
        >
          Explorar Plantas
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-emerald-900">Carrito de Compras</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map(item => (
            <div
              key={item.id}
              className="bg-white border border-stone-200 rounded-lg p-4 flex gap-4"
            >
              <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                {item.image && (
                  <div className="relative w-full h-full">
                    <ProductImage src={item.image} alt={item.name} />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{item.name}</h3>
                <p className="text-emerald-700 font-bold">
                  ${(item.price / 100).toLocaleString('es-AR')}
                </p>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center border border-stone-300 rounded-lg">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="px-2 py-1 hover:bg-stone-100 text-stone-600"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-3">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="px-2 py-1 hover:bg-stone-100 text-stone-600"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold">
                  ${((item.price * item.quantity) / 100).toLocaleString('es-AR')}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="bg-white border border-stone-200 rounded-lg p-6 h-fit shadow-sm">
          <h2 className="text-xl font-bold mb-4 text-emerald-900">Resumen del Pedido</h2>
          <div className="space-y-2 mb-4">
            <div className="flex justify-between">
              <span className="text-stone-600">Subtotal</span>
              <span className="font-medium">${(total / 100).toLocaleString('es-AR')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-600">Envío</span>
              <span className="text-stone-400">Calculá en checkout</span>
            </div>
          </div>
          <div className="border-t border-stone-200 pt-4 mb-6">
            <div className="flex justify-between text-xl font-bold">
              <span className="text-emerald-900">Total</span>
              <span className="text-emerald-700">${(total / 100).toLocaleString('es-AR')}</span>
            </div>
          </div>
          <Link
            href="/checkout"
            className="block w-full bg-emerald-700 text-white text-center py-3 rounded-lg font-semibold hover:bg-emerald-600 transition-colors"
          >
            Proceder al Checkout
          </Link>
        </div>
      </div>
    </div>
  )
}