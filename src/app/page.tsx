import Link from 'next/link'
import { Leaf, Truck, Shield, Sprout, ChevronRight, Star, Mail } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { ProductImage } from '@/components/products/product-image'
import { NewsletterForm } from '@/components/ui/newsletter-form'

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

const CATEGORY_STYLES: Record<string, { gradient: string; pattern: string }> = {
  interior: { gradient: 'from-emerald-400 to-green-700', pattern: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)' },
  exterior: { gradient: 'from-green-500 to-emerald-800', pattern: 'radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)' },
  suculentas: { gradient: 'from-lime-400 to-green-600', pattern: 'radial-gradient(circle at 50% 80%, rgba(255,255,255,0.15) 0%, transparent 50%)' },
  macetas: { gradient: 'from-amber-500 to-amber-800', pattern: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.1) 0%, transparent 50%)' },
  accesorios: { gradient: 'from-stone-400 to-stone-700', pattern: 'radial-gradient(circle at 70% 60%, rgba(255,255,255,0.1) 0%, transparent 50%)' },
}

const CATEGORY_ICONS: Record<string, typeof Leaf> = {
  interior: Leaf,
  exterior: Sprout,
  suculentas: Star,
  macetas: Shield,
  accesorios: Truck,
}

export default async function Home() {
  const [featuredProducts, categories] = await Promise.all([
    getFeaturedProducts(),
    getCategories(),
  ])

  return (
    <div>
      <section className="relative bg-gradient-to-br from-emerald-950 via-emerald-900 to-green-900 text-white py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-green-300/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-full text-sm text-emerald-200 mb-6 hover:bg-white/15 transition-colors">
            <Sprout className="w-4 h-4" />
            Bienvenido a Botanic Store
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight tracking-tight">
            Dale Vida a tu{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-green-200">
              Hogar
            </span>
          </h1>
          <p className="text-lg md:text-xl text-emerald-200/80 mb-8 max-w-2xl mx-auto leading-relaxed">
            Descubrí la mejor selección de plantas y macetas para transformar cada rincón en un espacio único
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/products"
              className="bg-emerald-500 hover:bg-emerald-400 text-white px-8 py-3 rounded-lg font-semibold text-lg inline-flex items-center justify-center gap-2 transition-all hover:shadow-lg hover:shadow-emerald-500/25 active:scale-95"
            >
              Explorar Tienda
              <ChevronRight className="w-5 h-5" />
            </Link>
            <Link
              href="/products"
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white px-8 py-3 rounded-lg font-semibold text-lg inline-flex items-center justify-center gap-2 transition-all"
            >
              Ver Categorías
            </Link>
          </div>
          <div className="mt-12 flex items-center justify-center gap-8 text-sm text-emerald-300/60">
            <span className="flex items-center gap-1.5">
              <Leaf className="w-4 h-4" /> +50 especies
            </span>
            <span className="flex items-center gap-1.5">
              <Truck className="w-4 h-4" /> Envío a todo el país
            </span>
            <span className="flex items-center gap-1.5">
              <Shield className="w-4 h-4" /> Compra segura
            </span>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-emerald-900 mb-4">¿Por qué elegirnos?</h2>
            <p className="text-stone-500 max-w-xl mx-auto">Todo lo que necesitás para que tus plantas crezcan saludables</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="group text-center p-8 rounded-2xl hover:bg-emerald-50/50 transition-colors">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform">
                <Leaf className="w-8 h-8 text-emerald-700" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-emerald-900">Plantas Saludables</h3>
              <p className="text-stone-500 leading-relaxed">Cada planta pasa por un riguroso control de calidad antes de llegar a tu hogar, garantizando ejemplares fuertes y vigorosos.</p>
            </div>
            <div className="group text-center p-8 rounded-2xl hover:bg-emerald-50/50 transition-colors">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform">
                <Truck className="w-8 h-8 text-emerald-700" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-emerald-900">Envío Cuidado</h3>
              <p className="text-stone-500 leading-relaxed">Empacamos tus plantas con amor y materiales especializados para que lleguen en perfectas condiciones a cualquier parte del país.</p>
            </div>
            <div className="group text-center p-8 rounded-2xl hover:bg-emerald-50/50 transition-colors">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform">
                <Shield className="w-8 h-8 text-emerald-700" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-emerald-900">Asesoría Experta</h3>
              <p className="text-stone-500 leading-relaxed">Te guiamos en el cuidado de cada planta con consejos personalizados para que crezcan fuertes y sanas en tu hogar.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-stone-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-emerald-900 mb-4">Nuestras Categorías</h2>
            <p className="text-stone-500 max-w-xl mx-auto">Explorá nuestra selección organizada por tipo de planta y accesorios</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {categories.slice(0, 6).map(cat => {
              const style = CATEGORY_STYLES[cat.slug] ?? CATEGORY_STYLES.interior
              const Icon = CATEGORY_ICONS[cat.slug] ?? Leaf
              return (
                <Link
                  key={cat.slug}
                  href={`/products?category=${cat.slug}`}
                  className="group relative h-64 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-500"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${style.gradient} transition-transform duration-500 group-hover:scale-105`} />
                  <div className="absolute inset-0" style={{ backgroundImage: style.pattern }} />
                  <div className="absolute inset-0 bg-black/10 flex flex-col items-center justify-center gap-3 group-hover:bg-black/20 transition-colors">
                    <Icon className="w-10 h-10 text-white/80 group-hover:scale-110 transition-transform" />
                    <span className="text-white text-2xl font-bold drop-shadow-lg">{cat.name}</span>
                    <span className="text-white/60 text-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      Explorar <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-emerald-900 mb-4">Productos Destacados</h2>
            <p className="text-stone-500 max-w-xl mx-auto">Lo más elegido por nuestra comunidad para darle vida a sus espacios</p>
          </div>
          {featuredProducts.length > 0 ? (
            <>
              <div className="grid md:grid-cols-4 gap-6">
                {featuredProducts.map(product => (
                  <Link
                    key={product.id}
                    href={`/products/${product.id}`}
                    className="group border border-stone-200 rounded-xl overflow-hidden hover:shadow-xl hover:border-emerald-200 transition-all duration-300 bg-white"
                  >
                    <div className="relative h-52 overflow-hidden">
                      <ProductImage src={product.images?.[0]} alt={product.name} category={product.category} />
                    </div>
                    <div className="p-4">
                      <span className="text-xs text-emerald-600 uppercase tracking-wider font-medium">{product.category}</span>
                      <h3 className="font-semibold text-lg mt-1 text-emerald-900 group-hover:text-emerald-700 transition-colors">{product.name}</h3>
                      <p className="text-emerald-700 font-bold text-xl mt-2">
                        ${(product.price / 100).toLocaleString('es-AR')}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="text-center mt-12">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-600 text-white px-8 py-3 rounded-lg font-semibold transition-all hover:shadow-lg hover:shadow-emerald-700/25 active:scale-95"
                >
                  Ver Todos los Productos
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </>
          ) : (
            <p className="text-center text-stone-400 py-12">No hay productos destacados disponibles.</p>
          )}
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-emerald-900 to-green-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <Mail className="w-12 h-12 mx-auto mb-6 text-emerald-300" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Recibí Ofertas Exclusivas</h2>
          <p className="text-emerald-200/80 mb-8 max-w-lg mx-auto">
            Suscribite a nuestro newsletter y recibí 10% de descuento en tu primera compra, tips de cuidado y novedades
          </p>
          <NewsletterForm />
        </div>
      </section>
    </div>
  )
}
