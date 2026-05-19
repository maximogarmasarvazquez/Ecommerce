'use client'

import Link from 'next/link'
import { ShoppingCart, User, Menu } from 'lucide-react'
import { useCart } from '@/hooks/use-cart'
import { useState } from 'react'

export function Navbar() {
  const { itemCount } = useCart()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="text-xl font-bold text-gray-900">
            Parrillas Store
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/products" className="text-gray-600 hover:text-gray-900">
              Productos
            </Link>
            <Link href="/products?category=gas" className="text-gray-600 hover:text-gray-900">
              Gas
            </Link>
            <Link href="/products?category=carbon" className="text-gray-600 hover:text-gray-900">
              Carbón
            </Link>
            <Link href="/products?category=accesorios" className="text-gray-600 hover:text-gray-900">
              Accesorios
            </Link>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <Link href="/cart" className="relative p-2 text-gray-600 hover:text-gray-900">
              <ShoppingCart className="w-6 h-6" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
            <Link href="/account" className="p-2 text-gray-600 hover:text-gray-900">
              <User className="w-6 h-6" />
            </Link>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 text-gray-600"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col gap-4">
              <Link href="/products" className="text-gray-600">
                Productos
              </Link>
              <Link href="/products?category=gas" className="text-gray-600">
                Gas
              </Link>
              <Link href="/products?category=carbon" className="text-gray-600">
                Carbón
              </Link>
              <Link href="/products?category=accesorios" className="text-gray-600">
                Accesorios
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}