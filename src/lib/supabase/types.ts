export type Profile = {
  id: string
  full_name: string | null
  email: string | null
  role: 'customer' | 'admin'
  created_at: string
  updated_at: string
}

export type Product = {
  id: string
  name: string
  description: string | null
  price: number
  category: string
  images: string[] | null
  inventory: number
  is_featured: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export type Customer = {
  id: string
  user_id: string
  full_name: string | null
  email: string | null
  phone: string | null
  shipping_address: {
    name?: string
    address?: string
    city?: string
    province?: string
    postal_code?: string
    phone?: string
  } | null
  created_at: string
  updated_at: string
}

export type Order = {
  id: string
  customer_id: string
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled'
  total_amount: number
  shipping_cost: number
  shipping_address: {
    name?: string
    address?: string
    city?: string
    province?: string
    postal_code?: string
    phone?: string
  } | null
  external_reference: string | null
  created_at: string
  updated_at: string
}

export type OrderItem = {
  id: string
  order_id: string
  product_id: string
  quantity: number
  unit_price: number
  created_at: string
}

export type OrderWithItems = Order & {
  order_items: (OrderItem & { product: Product })[]
}