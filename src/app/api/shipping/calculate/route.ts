import { NextResponse } from 'next/server'
import { calculateShipping } from '@/lib/shipping'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { items, postal_code, province } = body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Carrito vacio' }, { status: 400 })
    }

    if (!postal_code) {
      return NextResponse.json({ error: 'Codigo postal requerido' }, { status: 400 })
    }

    const result = await calculateShipping(items, postal_code, province)

    return NextResponse.json({ rates: result.rates })
  } catch (error: any) {
    console.error('Shipping calculate error:', error)
    const message = error?.message || 'Error al calcular el envio'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
