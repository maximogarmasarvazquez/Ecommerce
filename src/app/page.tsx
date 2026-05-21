import Image from 'next/image'
import Link from 'next/link'
import { ChevronRight, Flame, Shield, Truck } from 'lucide-react'

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-gray-900 to-gray-800 text-white py-20 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Las Mejores Parrillas del Mercado
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Encuentra la parrilla perfecta para tus reuniones familiares y asados irresistibles
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/products"
              className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-lg font-semibold text-lg inline-flex items-center justify-center gap-2"
            >
              Ver Catálogo
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Flame className="w-7 h-7 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Calidad Premium</h3>
              <p className="text-gray-600">Materiales de alta resistencia para una durabilidad excepcional</p>
            </div>
            <div className="text-center p-6">
              <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="w-7 h-7 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Envío Seguro</h3>
              <p className="text-gray-600">Entrega a todo el país con packaging especial para parillas</p>
            </div>
            <div className="text-center p-6">
              <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-7 h-7 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Garantía Extendida</h3>
              <p className="text-gray-600">Todos nuestros productos cuentan con garantía oficial</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Nuestras Categorías</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'Parrillas de Gas', slug: 'gas', image: '/category-gas.jpg' },
              { name: 'Parrillas de Carbón', slug: 'carbon', image: '/category-carbon.jpg' },
              { name: 'Accesorios', slug: 'accesorios', image: '/category-accessories.jpg' },
            ].map(cat => (
              <Link
                key={cat.slug}
                href={`/products?category=${cat.slug}`}
                className="group relative h-64 rounded-xl overflow-hidden"
              >
                <div className="absolute inset-0 bg-gray-300 group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">{cat.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Productos Destacados</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                <div className="bg-gray-200 h-48 rounded-lg mb-4" />
                <h3 className="font-semibold mb-2">Parrilla Premium {i}</h3>
                <p className="text-orange-600 font-bold">$XXX.XXX</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link
              href="/products"
              className="inline-block border-2 border-orange-600 text-orange-600 px-6 py-2 rounded-lg font-semibold hover:bg-orange-600 hover:text-white transition-colors"
            >
              Ver Todos los Productos
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}