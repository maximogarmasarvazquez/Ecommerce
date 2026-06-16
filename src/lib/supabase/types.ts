export type Profile = {
  id: string
  full_name: string | null
  email: string
  role: 'customer' | 'admin'
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

export type Product = {
  id: string
  name: string
  description: string | null
  price: number
  category: string
  images: string[] | null
  inventory: number
  weight_grams: number | null
  width_cm: number | null
  height_cm: number | null
  depth_cm: number | null
  is_featured: boolean
  is_active: boolean
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
  payment_status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'refunded'
  payment_id: string | null
  merchant_order_id: string | null
  external_reference: string | null
  paid_at: string | null
  cancelled_at: string | null
  shipped_at: string | null
  delivered_at: string | null
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