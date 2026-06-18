import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/ui/navbar";
import { CartProvider } from "@/hooks/use-cart";
import { Leaf } from "lucide-react";
import { Suspense } from "react";

const inter = Inter({ subsets: ["latin"] });
const playfair = Playfair_Display({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Botanic Store - Tu tienda de plantas favorita",
  description: "Descubrí la mejor selección de plantas y macetas para tu hogar",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full">
      <body className={`${inter.className} min-h-full flex flex-col bg-stone-50`}>
        <CartProvider>
          <Suspense fallback={null}><Navbar /></Suspense>
          <main className="flex-1">{children}</main>
          <footer className="bg-emerald-950 text-white py-12 mt-16">
            <div className="container mx-auto px-4">
              <div className="grid md:grid-cols-3 gap-8 mb-8">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Leaf className="w-6 h-6 text-emerald-400" />
                    <h3 className={`${playfair.className} text-xl font-bold`}>Botanic Store</h3>
                  </div>
                  <p className="text-emerald-200 text-sm">
                    Tu tienda de confianza para transformar tu hogar con las mejores plantas.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-3 text-emerald-100">Navegación</h4>
                  <ul className="space-y-2 text-sm text-emerald-200">
                    <li><a href="/products" className="hover:text-white transition-colors">Productos</a></li>
                    <li><a href="/account" className="hover:text-white transition-colors">Mi Cuenta</a></li>
                    <li><a href="/cart" className="hover:text-white transition-colors">Carrito</a></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3 text-emerald-100">Contacto</h4>
                  <ul className="space-y-2 text-sm text-emerald-200">
                    <li>hola@botanicstore.com</li>
                    <li>11 2345-6789</li>
                  </ul>
                </div>
              </div>
              <div className="border-t border-emerald-800 pt-8">
                <p className="text-center text-emerald-300 text-sm">
                  © 2026 Botanic Store. Todos los derechos reservados.
                </p>
              </div>
            </div>
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}