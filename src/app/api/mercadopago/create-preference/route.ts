import { NextResponse } from 'next/server'
import { MercadoPagoConfig, Preference } from 'mercadopago'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const client = new MercadoPagoConfig({
      accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
    })

    const preference = new Preference(client)

    const result = await preference.create({
      body: {
        items: body.items,
        payer: body.payer,
        back_urls: body.back_urls,
        external_reference: body.external_reference || '',
        auto_return: 'approved',
      },
    })

    return NextResponse.json({
      init_point: result.init_point,
      id: result.id,
    })
  } catch (error) {
    console.error('MercadoPago error:', error)
    return NextResponse.json(
      { error: 'Error creating payment preference' },
      { status: 500 }
    )
  }
}