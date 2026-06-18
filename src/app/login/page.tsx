'use client'

import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Leaf, RefreshCw } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/account')
    }
  }

  const handleResend = async () => {
    if (!email) return
    setResending(true)
    setError('')
    setSuccess('')

    const { error } = await supabase.auth.resend({ type: 'signup', email })

    if (error) {
      setError(error.message)
    } else {
      setSuccess('Email de confirmación reenviado. Revisá tu casilla.')
    }
    setResending(false)
  }

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-xl shadow-lg border border-stone-200 p-8">
          <div className="flex items-center justify-center gap-2 mb-8">
            <Leaf className="w-6 h-6 text-emerald-600" />
            <h1 className="text-3xl font-bold text-emerald-900">Iniciar Sesión</h1>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
              {(error.toLowerCase().includes('email not confirmed') || error.includes('Email no confirmado')) && (
                <button
                  onClick={handleResend}
                  disabled={resending}
                  className="mt-2 w-full bg-emerald-600 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-500 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${resending ? 'animate-spin' : ''}`} />
                  {resending ? 'Reenviando...' : 'Reenviar email de confirmación'}
                </button>
              )}
            </div>
          )}

          {success && (
            <div className="bg-emerald-100 border border-emerald-400 text-emerald-700 px-4 py-3 rounded-lg mb-6 text-sm">
              {success}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 border-2 border-stone-200 rounded-lg focus:border-emerald-500 focus:ring-0 text-stone-800"
                placeholder="tu@email.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-2">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 border-2 border-stone-200 rounded-lg focus:border-emerald-500 focus:ring-0 text-stone-800"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-700 text-white py-4 rounded-lg font-bold text-lg hover:bg-emerald-600 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Ingresando...' : 'Entrar'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-stone-600">
              ¿No tenés cuenta?{' '}
              <Link href="/register" className="text-emerald-700 font-semibold hover:underline">
                Registrate aquí
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-stone-500 hover:text-emerald-700 text-sm">
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  )
}