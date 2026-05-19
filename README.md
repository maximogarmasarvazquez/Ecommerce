# 🔥 GrillStore - E-commerce de Parrillas

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" alt="Next.js">
  <img src="https://img.shields.io/badge/Supabase-3FFCFE?style=for-the-badge&logo=supabase" alt="Supabase">
  <img src="https://img.shields.io/badge/Stripe-635BFF?style=for-the-badge&logo=stripe" alt="Stripe">
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tailwind-06B6D4?style=-for-the-badge&logo=tailwind-css" alt="Tailwind">
</p>

Tienda online completa para la venta de parrillas y accesorios, construida con tecnologías modernas y escalables.

## 🚀 Características

- **Catálogo de productos** con categorías, búsqueda y filtros
- **Carrito de compras** persistido en localStorage
- **Checkout con Stripe** para pagos seguros
- **Autenticación** de usuarios con Supabase Auth
- **Gestión de pedidos** y seguimiento
- **Panel de cuenta** para usuarios registrados
- **Reseñas y calificaciones** de productos
- **Diseño responsivo** mobile-first
- **Panel de administración** para gestión de productos (staff)

## 🛠️ Tech Stack

| Tecnología | Descripción |
|------------|-------------|
| [Next.js 16](https://nextjs.org) | Framework React con App Router |
| [Supabase](https://supabase.com) | Backend-as-a-Service: DB, Auth, Storage |
| [Stripe](https://stripe.com) | Procesamiento de pagos |
| [Tailwind CSS](https://tailwindcss.com) | Framework de estilos |
| [TypeScript](https://typescriptlang.org) | Tipado estático |
| [Lucide React](https://lucide.dev) | Iconos |

## 📦 Estructura del Proyecto

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
│   └── schema.sql          # Schema de base de datos
├── public/                 # Archivos estáticos
└── package.json
```

## 📋 Requisitos Previos

- Node.js 18+
- Cuenta de [Supabase](https://supabase.com)
- Cuenta de [Stripe](https://stripe.com)

## ⚙️ Instalación

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

Crea un archivo `.env.local` con:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=tu_stripe_publishable_key
STRIPE_SECRET_KEY=tu_stripe_secret_key
STRIPE_WEBHOOK_SECRET=tu_stripe_webhook_secret

# App
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

4. **Configurar Supabase:**

- Crear un nuevo proyecto en [supabase.com](https://supabase.com)
- Ejecutar el schema en el SQL Editor:
  ```bash
  # Copia el contenido de supabase/schema.sql y ejecútalo en el SQL Editor de Supabase
  ```

5. **Ejecutar el servidor de desarrollo:**
```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 🔧 Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia el servidor de desarrollo |
| `npm run build` | Construye la aplicación para producción |
| `npm run start` | Inicia el servidor de producción |
| `npm run lint` | Ejecuta el linter |

## 📱 Funcionalidades Detalladas

### 🛒 Carrito de Compras
- Persistencia en localStorage
- Agregar/eliminar productos
- Actualizar cantidades
- Cálculo automático de totales

### 💳 Checkout
- Integración con Stripe Checkout
- Redirección a página de éxito
- Almacenamiento de session_id para tracking

### 👤 Autenticación
- Registro e inicio de sesión
- Integración con Supabase Auth
- Protección de rutas via middleware

### 📦 Gestión de Pedidos
- Historial de pedidos por usuario
- Estados: pending, paid, shipped, delivered
- Tracking de payment en Stripe

### ⭐ Reseñas
- Sistema de rating 1-5 estrellas
- Comentarios en productos
- Política RLS: lectura pública, escritura autenticada

## 🔐 Seguridad

- **Row Level Security (RLS)** en todas las tablas
- Políticas separadas para clientes y staff
- Validación de datos en cliente y servidor

## 🚢 Despliegue

### Vercel (Recomendado)

1. Hacer push a GitHub
2. Importar proyecto en [Vercel](https://vercel.com)
3. Agregar las variables de entorno
4. Deploy automático en cada push

### Variables de producción necesarias:
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_SECRET_KEY
NEXT_PUBLIC_SITE_URL=https://tu-dominio.com
```

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue primero para discutir cambios importantes.

## 📄 Licencia

MIT License - ver archivo LICENSE para más detalles.

---

<p align="center">Construido con ❤️ usando Next.js + Supabase + Stripe</p>