import Image from 'next/image'
import Link from 'next/link'
import { ChevronRight, Leaf, Truck, Shield, Sprout } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

async function getFeaturedProducts() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('products')
    .select('id, name, price, images, category')
    .eq('is_featured', true)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(4)

  return data || []
}

async function getCategories() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('categories')
    .select('name, slug')
    .order('name')

  return data || []
}

const CATEGORY_COLORS: Record<string, string> = {
  interior: 'from-emerald-400 to-green-700',
  exterior: 'from-green-500 to-emerald-800',
  suculentas: 'from-lime-400 to-green-600',
  macetas: 'from-amber-500 to-amber-800',
  accesorios: 'from-stone-400 to-stone-700',
}

export default async function Home() {
  const [featuredProducts, categories] = await Promise.all([
    getFeaturedProducts(),
    getCategories(),
  ])

  return (
    <div>
      <section className="relative bg-gradient-to-br from-emerald-900 via-green-800 to-emerald-700 text-white py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 bg-emerald-400 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-green-300 rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-emerald-800/50 backdrop-blur-sm px-4 py-2 rounded-full text-sm text-emerald-200 mb-6">
            <Sprout className="w-4 h-4" />
            Bienvenido a Botanic Store
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Dale Vida a tu Hogar
          </h1>
          <p className="text-xl md:text-2xl text-emerald-200 mb-8 max-w-2xl mx-auto">
            Descubrí la mejor selección de plantas y macetas para transformar cada rincón en un espacio único
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/products"
              className="bg-emerald-500 hover:bg-emerald-400 text-white px-8 py-3 rounded-lg font-semibold text-lg inline-flex items-center justify-center gap-2 transition-all"
            >
              Explorar Tienda
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Leaf className="w-7 h-7 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-emerald-900">Plantas Saludables</h3>
              <p className="text-stone-600">Cada planta pasa por un riguroso control de calidad antes de llegar a tu hogar</p>
            </div>
            <div className="text-center p-6">
              <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="w-7 h-7 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-emerald-900">Envío Cuidado</h3>
              <p className="text-stone-600">Empacamos tus plantas con amor para que lleguen en perfectas condiciones</p>
            </div>
            <div className="text-center p-6">
              <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-7 h-7 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-emerald-900">Asesoría Experta</h3>
              <p className="text-stone-600">Te guiamos en el cuidado de cada planta para que crezcan fuertes y sanas</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-stone-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-emerald-900">Nuestras Categorías</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {categories.slice(0, 6).map(cat => (
              <Link
                key={cat.slug}
                href={`/products?category=${cat.slug}`}
                className="group relative h-64 rounded-2xl overflow-hidden shadow-lg"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${CATEGORY_COLORS[cat.slug] || 'from-emerald-400 to-green-700'} group-hover:scale-105 transition-transform duration-500`} />
                <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                  <span className="text-white text-2xl font-bold drop-shadow-lg">{cat.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-emerald-900">Productos Destacados</h2>
          {featuredProducts.length > 0 ? (
            <>
              <div className="grid md:grid-cols-4 gap-6">
                {featuredProducts.map(product => (
                  <Link
                    key={product.id}
                    href={`/products/${product.id}`}
                    className="border border-stone-200 rounded-xl p-4 hover:shadow-xl hover:border-emerald-200 transition-all duration-300 group bg-white"
                  >
                    <div className="bg-stone-100 h-48 rounded-lg mb-4 overflow-hidden">
                      {product.images?.[0] && (
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          width={400}
                          height={300}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      )}
                    </div>
                    <h3 className="font-semibold mb-2 text-emerald-900">{product.name}</h3>
                    <p className="text-emerald-700 font-bold">
                      ${(product.price / 100).toLocaleString('es-AR')}
                    </p>
                  </Link>
                ))}
              </div>
              <div className="text-center mt-8">
                <Link
                  href="/products"
                  className="inline-block border-2 border-emerald-700 text-emerald-700 px-6 py-2 rounded-lg font-semibold hover:bg-emerald-700 hover:text-white transition-colors"
                >
                  Ver Todos los Productos
                </Link>
              </div>
            </>
          ) : (
            <p className="text-center text-stone-400">No hay productos destacados disponibles.</p>
          )}
        </div>
      </section>
    </div>
  )
}
