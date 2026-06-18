'use client'

import { useState, FormEvent } from 'react'
import { Mail, Check } from 'lucide-react'

export function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'success'>('idle')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!email) return
    setStatus('success')
    setEmail('')
  }

  if (status === 'success') {
    return (
      <div className="flex items-center justify-center gap-2 text-emerald-300 py-3">
        <Check className="w-5 h-5" />
        <span>¡Gracias por suscribirte! Revisá tu email.</span>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="tu@email.com"
        required
        className="flex-1 px-4 py-3 rounded-lg text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
      />
      <button
        type="submit"
        className="bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-3 rounded-lg font-semibold transition-all hover:shadow-lg hover:shadow-emerald-500/25 active:scale-95"
      >
        Suscribirme
      </button>
    </form>
  )
}