'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LogIn, Loader2 } from 'lucide-react'
import { useToast } from '@/components/toast'
import { desktopNotify } from '@/components/notification-init'

export default function SignInPage() {
  const router = useRouter()
  const toast = useToast()
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const result = await signIn('credentials', { email, password, redirect: false })

    if (result?.error) {
      toast('Invalid email or password.', 'error')
      desktopNotify('Sign-in failed', 'Invalid email or password.')
      setLoading(false)
    } else {
      toast('Welcome back!', 'success')
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="card max-w-sm w-full">
        <div className="flex items-center gap-2 mb-6">
          <LogIn size={20} />
          <h1 className="text-xl font-semibold">Sign in</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Email</label>
            <input
              name="email"
              type="email"
              className="input"
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label className="label">Password</label>
            <input
              name="password"
              type="password"
              className="input"
              required
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />}
            {loading ? 'Signing in...' : 'Sign in'}
          </button>

          <p className="text-sm text-center text-gray-500">
            No account?{' '}
            <Link href="/sign-up" className="text-blue-600 hover:underline">Sign up</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
