'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { signUp } from '@/app/actions/auth'
import Link from 'next/link'
import { UserPlus, Loader2 } from 'lucide-react'
import { useToast } from '@/components/toast'
import { desktopNotify } from '@/components/notification-init'

interface Props {
  adminExists: boolean
}

export default function SignUpForm({ adminExists }: Props) {
  const router = useRouter()
  const toast = useToast()
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const result = await signUp(formData)
    if (result?.error) {
      toast(result.error, 'error')
      setLoading(false)
      return
    }

    // Auto sign-in after account creation
    const signInResult = await signIn('credentials', { email, password, redirect: false })
    if (signInResult?.error) {
      toast('Account created! Please sign in.', 'info')
      desktopNotify('Account created', 'Please sign in to continue.')
      setLoading(false)
      router.push('/sign-in')
    } else {
      toast('Account created! Welcome aboard.', 'success')
      desktopNotify('Welcome to OHRMS! 🎉', 'Your account has been created successfully.')
      router.push('/dashboard')
      router.refresh()
    }
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

          <div>
            <label className="label">Password</label>
            <input
              name="password"
              type="password"
              className="input"
              required
              autoComplete="new-password"
              minLength={8}
              placeholder="Min. 8 characters"
            />
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
