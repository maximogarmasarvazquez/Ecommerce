# Botanic Store - E-commerce de Plantas

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" alt="Next.js">
  <img src="https://img.shields.io/badge/Supabase-3FFCFE?style=for-the-badge&logo=supabase" alt="Supabase">
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tailwind-06B6D4?style=-for-the-badge&logo=tailwind-css" alt="Tailwind">
</p>

Tienda online de plantas y macetas construida con Next.js 16, Supabase y Tailwind CSS. Demo portfolio con autenticación, carrito de compras y checkout simulado.

## Características

- **Catálogo de productos** con categorías (interior, exterior, suculentas, macetas)
- **Carrito de compras** persistido en localStorage
- **Checkout simulado** con pago mock y registro de orden en base de datos
- **Autenticación** de usuarios con Supabase Auth (email verification)
- **Historial de pedidos** por usuario
- **Panel de cuenta** para usuarios registrados
- **Panel de administración** para gestión de productos
- **Diseño responsivo** mobile-first con tema emerald/stone

## Tech Stack

| Tecnología | Descripción |
|------------|-------------|
| [Next.js 16](https://nextjs.org) | Framework React con App Router |
| [Supabase](https://supabase.com) | Backend-as-a-Service: DB, Auth, Storage |
| [Tailwind CSS](https://tailwindcss.com) | Framework de estilos |
| [TypeScript](https://typescriptlang.org) | Tipado estático |
| [Lucide React](https://lucide.dev) | Iconos |

## Estructura del Proyecto

```
mi-ecommerce/
├── src/
│   ├── app/                 # Páginas y rutas (App Router)
│   │   ├── page.tsx        # Home
│   │   ├── products/       # Catálogo de productos
│   │   ├── cart/           # Carrito de compras
│   │   ├── checkout/       # Checkout y éxito
│   │   ├── account/        # Panel de cuenta
│   │   └── login/          # Autenticación
│   ├── components/         # Componentes reutilizables
│   ├── hooks/              # Custom hooks (use-cart)
│   ├── lib/supabase/       # Cliente y servidor Supabase
│   └── middleware.ts       # Autenticación SSR
├── supabase/
│   ├── schema.sql          # Schema de base de datos
│   └── seed.sql            # Datos de ejemplo (17 productos, 5 categorías)
├── public/                 # Archivos estáticos
└── package.json
```

## Requisitos Previos

- Node.js 18+
- Cuenta de [Supabase](https://supabase.com)

## Instalación

1. **Clonar el repositorio:**
```bash
git clone <tu-repositorio>
cd mi-ecommerce
```

2. **Instalar dependencias:**
```bash
npm install
```

3. **Configurar variables de entorno:**

Crear un archivo `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

4. **Configurar Supabase:**

- Crear un nuevo proyecto en [supabase.com](https://supabase.com)
- Ejecutar `supabase/schema.sql` en el SQL Editor
- (Opcional) Ejecutar `supabase/seed.sql` para cargar datos de ejemplo
- En Authentication → Settings, configurar Site URL como `http://localhost:3000`

5. **Ejecutar el servidor de desarrollo:**
```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000).

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia el servidor de desarrollo |
| `npm run build` | Construye la aplicación para producción |
| `npm run start` | Inicia el servidor de producción |
| `npm run lint` | Ejecuta el linter |

## Funcionalidades

### Carrito de Compras
- Persistencia en localStorage
- Agregar/eliminar productos
- Actualizar cantidades
- Cálculo automático de totales

### Checkout
- Formulario con datos de envío
- Pago mock que marca la orden como pagada
- Página de éxito con detalle de la orden (productos, total, dirección)

### Autenticación
- Registro con verificación de email (Supabase Auth)
- Reenvío de email de confirmación
- Protección de rutas via middleware

### Gestión de Pedidos
- Historial de pedidos por usuario
- Estados: pending, paid, shipped, delivered
- Detalle de items con nombres de productos

## Seguridad

- **Row Level Security (RLS)** en todas las tablas
- Políticas separadas para clientes y staff
- Validación de datos en cliente y servidor

## Despliegue

### Vercel

1. Hacer push a GitHub
2. Importar proyecto en [Vercel](https://vercel.com)
3. Agregar las variables de entorno en Project Settings → Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL` (opcional, se auto-detecta)
4. En Supabase Dashboard → Authentication → Settings, configurar Site URL como `https://tu-dominio.vercel.app`

## Licencia

MIT
