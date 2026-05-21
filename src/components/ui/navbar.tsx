'use client'

import Link from 'next/link'
import { ShoppingCart, User, Menu, Settings } from 'lucide-react'
import { useCart } from '@/hooks/use-cart'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export function Navbar() {
  const { itemCount } = useCart()
  const [menuOpen, setMenuOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()
        
        if (profile?.role === 'admin') {
          setIsAdmin(true)
        }
      }
    }
    checkAdmin()
  }, [supabase])

  return (
    <nav className="bg-white shadow-sm border-b" style={{ backgroundColor: '#ffffff' }}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="text-xl font-bold" style={{ color: '#000000' }}>
            Parrillas Store
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/products" className="font-semibold" style={{ color: '#000000' }}>
              Productos
            </Link>
            <Link href="/products?category=gas" className="font-semibold" style={{ color: '#000000' }}>
              Gas
            </Link>
            <Link href="/products?category=carbon" className="font-semibold" style={{ color: '#000000' }}>
              Carbón
            </Link>
            <Link href="/products?category=accesorios" className="font-semibold" style={{ color: '#000000' }}>
              Accesorios
            </Link>
            {isAdmin && (
              <Link href="/admin" className="font-bold" style={{ color: '#ea580c' }}>
                Admin
              </Link>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <Link href="/cart" className="relative p-2" style={{ color: '#000000' }}>
              <ShoppingCart className="w-6 h-6" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
            <Link href="/account" className="p-2" style={{ color: '#000000' }}>
              <User className="w-6 h-6" />
            </Link>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2"
              style={{ color: '#000000' }}
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
              <Link href="/products" className="font-semibold" style={{ color: '#000000' }}>
                Productos
              </Link>
              <Link href="/products?category=gas" className="font-semibold" style={{ color: '#000000' }}>
                Gas
              </Link>
              <Link href="/products?category=carbon" className="font-semibold" style={{ color: '#000000' }}>
                Carbón
              </Link>
              <Link href="/products?category=accesorios" className="font-semibold" style={{ color: '#000000' }}>
                Accesorios
              </Link>
              {isAdmin && (
                <Link href="/admin" className="font-bold" style={{ color: '#ea580c' }}>
                  Admin
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}