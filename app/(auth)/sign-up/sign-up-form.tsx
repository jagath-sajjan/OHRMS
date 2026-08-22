'use client'

import { useState } from 'react'
import { sendSignInLinkToEmail } from 'firebase/auth'
import { firebaseAuth } from '@/lib/firebase'
import { signUp } from '@/app/actions/auth'
import Link from 'next/link'
import { UserPlus, Mail, Loader2 } from 'lucide-react'

const actionCodeSettings = {
  url: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
  handleCodeInApp: true
}

interface Props {
  adminExists: boolean
}

export default function SignUpForm({ adminExists }: Props) {
  const [error, setError] = useState('')
  const [sentTo, setSentTo] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string

    const result = await signUp(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    try {
      await sendSignInLinkToEmail(firebaseAuth, email, actionCodeSettings)
      window.localStorage.setItem('emailForSignIn', email)
      setSentTo(email)
    } catch {
      setError('Account created. Go to sign in to receive your link.')
    }
    setLoading(false)
  }

  if (sentTo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card max-w-md w-full text-center">
          <Mail size={32} className="mx-auto text-blue-600 mb-3" />
          <h2 className="text-xl font-semibold">Account created</h2>
          <p className="text-sm text-gray-500 mt-2">Sign-in link sent to <span className="font-medium">{sentTo}</span></p>
          <Link href="/sign-in" className="mt-4 inline-block text-sm text-blue-600 hover:underline">Back to sign in</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="card max-w-md w-full">
        <div className="flex items-center gap-2 mb-6">
          <UserPlus size={20} />
          <h1 className="text-xl font-semibold">Create account</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">First name</label>
              <input name="firstName" className="input" required />
            </div>
            <div>
              <label className="label">Last name</label>
              <input name="lastName" className="input" required />
            </div>
          </div>

          <div>
            <label className="label">Employee ID</label>
            <input name="employeeId" className="input" required />
          </div>

          <div>
            <label className="label">Email</label>
            <input name="email" type="email" className="input" required autoComplete="email" />
          </div>

          {!adminExists && (
            <div>
              <label className="label">Role</label>
              <select name="role" className="input">
                <option value="employee">Employee</option>
                <option value="admin">Admin</option>
              </select>
              <p className="text-xs text-gray-400 mt-1">Admin option available for first account only</p>
            </div>
          )}

          {adminExists && <input type="hidden" name="role" value="employee" />}

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
            {loading ? 'Creating...' : 'Create account'}
          </button>

          <p className="text-sm text-center text-gray-500">
            Already have an account?{' '}
            <Link href="/sign-in" className="text-blue-600 hover:underline">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
