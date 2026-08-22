'use client'

import { useState } from 'react'
import { sendSignInLinkToEmail } from 'firebase/auth'
import { firebaseAuth } from '@/lib/firebase'
import Link from 'next/link'
import { Mail, Loader2, Send } from 'lucide-react'

const actionCodeSettings = {
  url: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
  handleCodeInApp: true
}

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await sendSignInLinkToEmail(firebaseAuth, email, actionCodeSettings)
      window.localStorage.setItem('emailForSignIn', email)
      setSent(true)
    } catch (err: any) {
      setError(err.message ?? 'Failed to send link. Try again.')
    }
    setLoading(false)
  }

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card max-w-sm w-full text-center">
          <Mail size={32} className="mx-auto text-blue-600 mb-3" />
          <h2 className="font-semibold text-lg">Check your email</h2>
          <p className="text-sm text-gray-500 mt-2">Sign-in link sent to <span className="font-medium">{email}</span></p>
          <button
            onClick={() => { setSent(false); setEmail('') }}
            className="mt-4 text-sm text-blue-600 hover:underline"
          >
            Use a different email
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="card max-w-sm w-full">
        <div className="flex items-center gap-2 mb-6">
          <Mail size={20} />
          <h1 className="text-xl font-semibold">Sign in</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="input"
              required
              autoComplete="email"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            {loading ? 'Sending...' : 'Send sign-in link'}
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
