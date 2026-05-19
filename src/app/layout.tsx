import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/ui/navbar";
import { CartProvider } from "@/hooks/use-cart";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Parillas Store - Las mejores parillas del mercado",
  description: "Tienda online de parillas premium",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full">
      <body className={`${inter.className} min-h-full flex flex-col bg-gray-50`}>
        <CartProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <footer className="bg-gray-900 text-white py-8 mt-16">
            <div className="container mx-auto px-4">
              <p className="text-center text-gray-400">
                © 2026 Parillas Store. Todos los derechos reservados.
              </p>
            </div>
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}