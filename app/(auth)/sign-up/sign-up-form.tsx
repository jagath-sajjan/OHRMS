'use client'

import { useState } from 'react'
import { signUp } from '@/app/actions/auth'
import Link from 'next/link'
import { UserPlus, Loader2 } from 'lucide-react'

interface Props {
  adminExists: boolean
}

export default function SignUpForm({ adminExists }: Props) {
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [verifyUrl, setVerifyUrl] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const formData = new FormData(e.currentTarget)
    const result = await signUp(formData)
    setLoading(false)
    if (result?.error) {
      setError(result.error)
    } else {
      if (result.verifyUrl) setVerifyUrl(result.verifyUrl)
      setSuccess(true)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card max-w-md w-full text-center">
          <h2 className="text-xl font-semibold mb-2">Account created</h2>
          <p className="text-gray-500 text-sm">A verification link has been sent to your email.</p>
          {verifyUrl && (
            <div className="mt-4 p-3 bg-blue-50 rounded-md text-left">
              <p className="text-xs text-gray-500 mb-1">Or verify directly:</p>
              <a href={verifyUrl} className="text-sm text-blue-600 hover:underline break-all">
                Click here to verify your email
              </a>
            </div>
          )}
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
            <input name="email" type="email" className="input" required />
          </div>

          <div>
            <label className="label">Password</label>
            <input name="password" type="password" className="input" required />
            <p className="text-xs text-gray-400 mt-1">Min 8 chars, one uppercase, one number</p>
          </div>

          {!adminExists && (
            <div>
              <label className="label">Role</label>
              <select name="role" className="input">
                <option value="employee">Employee</option>
                <option value="admin">Admin</option>
              </select>
              <p className="text-xs text-gray-400 mt-1">Admin option available only for first account</p>
            </div>
          )}

          {adminExists && (
            <input type="hidden" name="role" value="employee" />
          )}

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
