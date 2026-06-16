import { createAdminClient } from '@/lib/supabase/admin'
import { getProvinceFromPostalCode, calcularEnvio } from '@/lib/shipping-data'

export interface ShippingItem {
  id: string
  quantity: number
}

export interface ShippingRate {
  productType: string
  productName: string
  price: number
  deliveryTimeMin: string
  deliveryTimeMax: string
}

export async function calculateShipping(
  items: ShippingItem[],
  postalCode: string,
  province?: string
): Promise<{ rates: ShippingRate[] }> {
  const supabase = createAdminClient()

  const productIds = items.map((i) => i.id)
  const { data: products } = await supabase
    .from('products')
    .select('id, weight_grams, width_cm, height_cm, depth_cm')
    .in('id', productIds)

  if (!products || products.length === 0) {
    throw new Error('No se encontraron los productos')
  }

  const itemMap = new Map(items.map((i) => [i.id, i.quantity]))

  let totalWeightKg = 0
  let totalVolumeCm3 = 0

  for (const product of products) {
    const qty = itemMap.get(product.id) ?? 1

    if (product.weight_grams) {
      totalWeightKg += (product.weight_grams * qty) / 1000
    }

    if (product.width_cm && product.height_cm && product.depth_cm) {
      const itemVolume = product.width_cm * product.height_cm * product.depth_cm
      totalVolumeCm3 += itemVolume * qty
    }
  }

  const provinceInfo = province
    ? { name: province, zone: 1 }
    : getProvinceFromPostalCode(postalCode)

  const envio = calcularEnvio(totalWeightKg, totalVolumeCm3, provinceInfo.name)

  return {
    rates: [
      {
        productType: 'estandar',
        productName: envio.zoneName,
        price: envio.price / 100,
        deliveryTimeMin: String(envio.deliveryMin),
        deliveryTimeMax: String(envio.deliveryMax),
      },
    ],
  }
}
