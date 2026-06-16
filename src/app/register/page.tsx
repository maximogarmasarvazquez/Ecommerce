'use client'

import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Leaf } from 'lucide-react'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: 'customer'
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      }
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-xl shadow-lg border border-stone-200 p-8 text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Leaf className="w-7 h-7 text-emerald-600" />
            </div>
            <h1 className="text-2xl font-bold text-emerald-900 mb-4">Revisá tu email</h1>
            <p className="text-stone-600 mb-6">
              Te enviamos un link de confirmación a <strong>{email}</strong>.<br />
              Hace clic en el link para activar tu cuenta y después iniciá sesión.
            </p>
            <Link
              href="/login"
              className="inline-block bg-emerald-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-600 transition-colors"
            >
              Ir a Iniciar Sesión
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-xl shadow-lg border border-stone-200 p-8">
          <div className="flex items-center justify-center gap-2 mb-8">
            <Leaf className="w-6 h-6 text-emerald-600" />
            <h1 className="text-3xl font-bold text-emerald-900">Crear Cuenta</h1>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-2">Nombre Completo</label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full px-4 py-3 border-2 border-stone-200 rounded-lg focus:border-emerald-500 focus:ring-0 text-stone-800"
                placeholder="Juan Pérez"
                required
              />
            </div>
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
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-2">Confirmar Contraseña</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
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
              {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-stone-600">
              ¿Ya tenés cuenta?{' '}
              <Link href="/login" className="text-emerald-700 font-semibold hover:underline">
                Iniciá sesión
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