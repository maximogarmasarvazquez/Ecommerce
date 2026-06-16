'use client'

import { Suspense, useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ProductCard } from '@/components/products/product-card'
import { Loader2, AlertCircle } from 'lucide-react'

function ProductsContent() {

interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  images: string[]
  inventory: number
}

interface Category {
  name: string
  slug: string
}

const PAGE_SIZE = 12

const sortOptions = [
  { value: 'newest', label: 'Mas nuevos' },
  { value: 'price_asc', label: 'Precio: menor a mayor' },
  { value: 'price_desc', label: 'Precio: mayor a menor' },
  { value: 'name', label: 'Nombre A-Z' },
]

  const router = useRouter()
  const searchParams = useSearchParams()

  const [products, setProducts] = useState<Product[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const supabase = createClient()

  const category = searchParams.get('category') || ''
  const search = searchParams.get('search') || ''
  const sort = searchParams.get('sort') || 'newest'
  const page = parseInt(searchParams.get('page') || '1', 10)

  const updateParam = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    // Resetear pagina al cambiar filtros
    if (key !== 'page') {
      params.delete('page')
    }
    router.push(`/products?${params.toString()}`)
  }, [router, searchParams])

  // Cargar categorias al inicio
  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase
        .from('categories')
        .select('name, slug')
        .order('name')

      if (data) {
        setCategories(data)
      }
    }
    fetchCategories()
  }, [supabase])

  // Cargar productos con filtros server-side
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      setError(null)

      try {
        let query = supabase
          .from('products')
          .select('*', { count: 'exact' })
          .eq('is_active', true)

        if (category) {
          query = query.eq('category', category)
        }

        if (search) {
          query = query.ilike('name', `%${search}%`)
        }

        switch (sort) {
          case 'price_asc':
            query = query.order('price', { ascending: true })
            break
          case 'price_desc':
            query = query.order('price', { ascending: false })
            break
          case 'name':
            query = query.order('name', { ascending: true })
            break
          default:
            query = query.order('created_at', { ascending: false })
        }

        const from = (page - 1) * PAGE_SIZE
        const to = from + PAGE_SIZE - 1
        query = query.range(from, to)

        const { data, error: queryError, count } = await query

        if (queryError) throw queryError

        setProducts(data || [])
        setTotalCount(count || 0)
      } catch (err) {
        console.error('Error fetching products:', err)
        setError('Error al cargar productos. Intenta de nuevo.')
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [category, search, sort, page, supabase])

  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Catalogo de Productos</h1>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <input
          type="text"
          placeholder="Buscar productos..."
          defaultValue={search}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              updateParam('search', (e.target as HTMLInputElement).value)
            }
          }}
          className="flex-1 px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        />
        <select
          value={category}
          onChange={(e) => updateParam('category', e.target.value)}
          className="px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
        >
          <option value="">Todas las categorias</option>
          {categories.map((cat) => (
            <option key={cat.slug} value={cat.slug}>
              {cat.name}
            </option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(e) => updateParam('sort', e.target.value)}
          className="px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Error State */}
      {error && (
        <div className="flex flex-col items-center justify-center py-12 text-red-500">
          <AlertCircle className="w-12 h-12 mb-4" />
          <p>{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && products.length === 0 && (
        <div className="text-center py-12 text-stone-400">
          <p>No se encontraron productos</p>
        </div>
      )}

      {/* Products Grid */}
      {!loading && !error && products.length > 0 && (
        <>
          <p className="text-sm text-stone-500 mb-4">
            {totalCount} producto{(totalCount !== 1 ? 's' : '')} encontrado{(totalCount !== 1 ? 's' : '')}
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => updateParam('page', String(p))}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    p === page
                      ? 'bg-emerald-700 text-white'
                      : 'border border-stone-300 hover:bg-stone-50'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
      </div>
    }>
      <ProductsContent />
    </Suspense>
  )
}
