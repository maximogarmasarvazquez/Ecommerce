export const ORIGIN_PROVINCE_LETTER = process.env.SHIPPING_ORIGIN_PROVINCE || 'C'

interface ProvinceInfo {
  name: string
  zone: 1 | 2 | 3 | 4
}

const PROVINCE_LETTERS: Record<string, ProvinceInfo> = {
  C: { name: 'Capital Federal', zone: 1 },
  B: { name: 'Buenos Aires', zone: 1 },
  S: { name: 'Santa Fe', zone: 2 },
  E: { name: 'Entre Ríos', zone: 2 },
  X: { name: 'Córdoba', zone: 2 },
  L: { name: 'La Pampa', zone: 2 },
  D: { name: 'San Luis', zone: 2 },
  M: { name: 'Mendoza', zone: 3 },
  J: { name: 'San Juan', zone: 3 },
  F: { name: 'La Rioja', zone: 3 },
  K: { name: 'Catamarca', zone: 3 },
  T: { name: 'Tucumán', zone: 3 },
  G: { name: 'Santiago del Estero', zone: 3 },
  A: { name: 'Salta', zone: 3 },
  Y: { name: 'Jujuy', zone: 3 },
  W: { name: 'Corrientes', zone: 3 },
  H: { name: 'Chaco', zone: 3 },
  P: { name: 'Formosa', zone: 3 },
  N: { name: 'Misiones', zone: 3 },
  Q: { name: 'Neuquén', zone: 4 },
  R: { name: 'Río Negro', zone: 4 },
  U: { name: 'Chubut', zone: 4 },
  Z: { name: 'Santa Cruz', zone: 4 },
  V: { name: 'Tierra del Fuego', zone: 4 },
}

const NUMERIC_POSTAL_RANGES: [number, number, string][] = [
  [1000, 1999, 'C'],
  [2000, 2999, 'S'],
  [3000, 3999, 'S'],
  [4000, 4999, 'T'],
  [5000, 5999, 'X'],
  [6000, 6999, 'B'],
  [7000, 7999, 'B'],
  [8000, 8999, 'B'],
  [9000, 9999, 'R'],
]

interface WeightTier {
  maxKg: number
  label: string
}

export const WEIGHT_TIERS: WeightTier[] = [
  { maxKg: 1, label: 'hasta 1kg' },
  { maxKg: 3, label: '1-3kg' },
  { maxKg: 5, label: '3-5kg' },
  { maxKg: 10, label: '5-10kg' },
  { maxKg: 20, label: '10-20kg' },
  { maxKg: 30, label: '20-30kg' },
  { maxKg: Infinity, label: '30kg+' },
]

interface ZoneConfig {
  name: string
  deliveryMin: number
  deliveryMax: number
  rates: number[]
}

export const ZONES: Record<number, ZoneConfig> = {
  1: {
    name: 'AMBA',
    deliveryMin: 1,
    deliveryMax: 3,
    rates: [2500, 3500, 4500, 5500, 7500, 9500, 12000],
  },
  2: {
    name: 'Cercanía',
    deliveryMin: 2,
    deliveryMax: 5,
    rates: [3500, 5000, 6500, 8500, 12000, 15000, 19000],
  },
  3: {
    name: 'Resto del país',
    deliveryMin: 4,
    deliveryMax: 8,
    rates: [5000, 7000, 10000, 13000, 18000, 23000, 30000],
  },
  4: {
    name: 'Patagonia',
    deliveryMin: 5,
    deliveryMax: 12,
    rates: [7000, 10000, 14000, 19000, 26000, 33000, 42000],
  },
}

export function getProvinceFromPostalCode(postalCode: string): ProvinceInfo {
  const code = postalCode.trim().toUpperCase()

  const firstChar = code.charAt(0)
  if (firstChar >= 'A' && firstChar <= 'Z') {
    const province = PROVINCE_LETTERS[firstChar]
    if (province) return province
  }

  const numericMatch = code.match(/^(\d{4})/)
  if (numericMatch) {
    const num = parseInt(numericMatch[1], 10)
    for (const [start, end, letter] of NUMERIC_POSTAL_RANGES) {
      if (num >= start && num <= end) {
        const province = PROVINCE_LETTERS[letter]
        if (province) return province
      }
    }
  }

  throw new Error(`No se pudo determinar la provincia desde el código postal: ${postalCode}`)
}

export function getProvinceFromLetter(letter: string): ProvinceInfo | undefined {
  return PROVINCE_LETTERS[letter.toUpperCase()]
}

export function getWeightTierIndex(weightKg: number): number {
  for (let i = 0; i < WEIGHT_TIERS.length; i++) {
    if (weightKg <= WEIGHT_TIERS[i].maxKg) return i
  }
  return WEIGHT_TIERS.length - 1
}

export function calcularPesoVolumetrico(
  widthCm: number,
  heightCm: number,
  depthCm: number
): number {
  return (widthCm * heightCm * depthCm) / 6000
}

export function calcularEnvio(
  pesoKg: number,
  volumenCm3: number,
  provincia: string
): { price: number; zone: number; zoneName: string; deliveryMin: number; deliveryMax: number } {
  const pesoVolumetrico = volumenCm3 / 6000
  const pesoAforado = Math.max(pesoKg, pesoVolumetrico)

  const provinceInfo =
    getProvinceFromLetter(provincia) ||
    (provincia.length === 1 ? getProvinceFromLetter(provincia) : undefined)

  if (!provinceInfo) {
    throw new Error(`Provincia no válida: ${provincia}`)
  }

  const zone = ZONES[provinceInfo.zone]
  const tierIndex = getWeightTierIndex(pesoAforado)
  const price = zone.rates[tierIndex]

  return {
    price,
    zone: provinceInfo.zone,
    zoneName: zone.name,
    deliveryMin: zone.deliveryMin,
    deliveryMax: zone.deliveryMax,
  }
}
