'use client'

import Link from 'next/link'
import { ShoppingCart, User, Menu, Leaf } from 'lucide-react'
import { useCart } from '@/hooks/use-cart'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { usePathname, useSearchParams } from 'next/navigation'

const NAV_CATEGORIES = [
  { slug: 'interior', label: 'Interior' },
  { slug: 'exterior', label: 'Exterior' },
  { slug: 'suculentas', label: 'Suculentas' },
  { slug: 'macetas', label: 'Macetas' },
]

export function Navbar() {
  const { itemCount } = useCart()
  const [menuOpen, setMenuOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const supabase = createClient()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentCategory = searchParams.get('category')

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
    <nav className="bg-white/80 backdrop-blur-md border-b border-emerald-100 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 text-emerald-800">
            <Leaf className="w-6 h-6 text-emerald-600" />
            <span className="text-xl font-bold">Botanic Store</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/products"
              className={`text-sm font-medium transition-colors ${
                pathname === '/products' ? 'text-emerald-500' : 'text-emerald-700 hover:text-emerald-500'
              }`}
            >
              Todos
            </Link>
            {NAV_CATEGORIES.map(cat => (
              <Link
                key={cat.slug}
                href={`/products?category=${cat.slug}`}
                className={`text-sm font-medium transition-colors ${
                  pathname === '/products' && currentCategory === cat.slug ? 'text-emerald-500' : 'text-emerald-700 hover:text-emerald-500'
                }`}
              >
                {cat.label}
              </Link>
            ))}
            {isAdmin && (
              <Link href="/admin" className="text-sm font-bold text-emerald-600 hover:text-emerald-500 transition-colors">
                Admin
              </Link>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Link href="/cart" className="relative p-2 text-emerald-700 hover:text-emerald-500 transition-colors">
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
            <Link href="/account" className="p-2 text-emerald-700 hover:text-emerald-500 transition-colors">
              <User className="w-5 h-5" />
            </Link>

            <button
              className="md:hidden p-2 text-emerald-700"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

          {menuOpen && (
          <div className="md:hidden py-4 border-t border-emerald-100">
            <div className="flex flex-col gap-3">
              <Link
                href="/products"
                className={`text-sm font-medium transition-colors ${
                  pathname === '/products' ? 'text-emerald-500' : 'text-emerald-700'
                }`}
                onClick={() => setMenuOpen(false)}
              >
                Todos los productos
              </Link>
              {NAV_CATEGORIES.map(cat => (
                <Link
                  key={cat.slug}
                  href={`/products?category=${cat.slug}`}
                  className={`text-sm font-medium transition-colors ${
                    pathname === '/products' && currentCategory === cat.slug ? 'text-emerald-500' : 'text-emerald-700'
                  }`}
                  onClick={() => setMenuOpen(false)}
                >
                  {cat.label}
                </Link>
              ))}
              {isAdmin && (
                <Link
                  href="/admin"
                  className="text-sm font-bold text-emerald-600"
                  onClick={() => setMenuOpen(false)}
                >
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