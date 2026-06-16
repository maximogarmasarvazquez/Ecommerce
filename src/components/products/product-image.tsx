'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Leaf, Flower2, Trees, FlowerIcon, Wrench } from 'lucide-react'

const CATEGORY_STYLES: Record<string, { gradient: string; Icon: typeof Leaf }> = {
  interior: { gradient: 'from-emerald-400/20 via-green-500/10 to-emerald-700/20', Icon: Leaf },
  exterior: { gradient: 'from-green-400/20 via-emerald-500/10 to-emerald-800/20', Icon: Trees },
  suculentas: { gradient: 'from-lime-400/20 via-green-400/10 to-green-600/20', Icon: Flower2 },
  macetas: { gradient: 'from-amber-400/20 via-orange-300/10 to-amber-800/20', Icon: FlowerIcon },
  accesorios: { gradient: 'from-stone-400/20 via-stone-300/10 to-stone-700/20', Icon: Wrench },
}

export function ProductImage({
  src,
  alt,
  category,
  priority,
}: {
  src?: string
  alt: string
  category?: string
  priority?: boolean
}) {
  const [error, setError] = useState(false)
  const style = CATEGORY_STYLES[category ?? ''] ?? CATEGORY_STYLES.interior
  const showFallback = !src || error

  if (showFallback) {
    return (
      <div className={`flex items-center justify-center bg-gradient-to-br ${style.gradient} w-full h-full`}>
        <style.Icon className="w-12 h-12 text-emerald-600/40" />
      </div>
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      className="object-cover group-hover:scale-105 transition-transform duration-500"
      onError={() => setError(true)}
      priority={priority}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    />
  )
}
