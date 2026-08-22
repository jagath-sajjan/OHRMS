'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth'
import { firebaseAuth } from '@/lib/firebase'
import { signIn } from 'next-auth/react'
import { Loader2, XCircle } from 'lucide-react'
import Link from 'next/link'

export default function AuthCallbackPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function complete() {
      if (!isSignInWithEmailLink(firebaseAuth, window.location.href)) {
        setError('Invalid or expired sign-in link.')
        setLoading(false)
        return
      }

      let email = window.localStorage.getItem('emailForSignIn')
      if (!email) {
        email = window.prompt('Please enter your email to confirm sign-in')
      }
      if (!email) {
        setError('Email is required to complete sign-in.')
        setLoading(false)
        return
      }

      try {
        await signInWithEmailLink(firebaseAuth, email, window.location.href)
        window.localStorage.removeItem('emailForSignIn')

        const result = await signIn('credentials', { email, redirect: false })

        if (result?.error) {
          setError('Account not found. Please sign up first.')
        } else {
          router.push('/dashboard')
          router.refresh()
          return
        }
      } catch (err: any) {
        setError(err.message ?? 'Sign-in failed. The link may have expired.')
      }
      setLoading(false)
    }

    complete()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-500">
          <Loader2 size={20} className="animate-spin" />
          <span className="text-sm">Completing sign-in...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="card max-w-sm w-full text-center">
        <XCircle size={32} className="mx-auto text-red-500 mb-3" />
        <h2 className="font-semibold">Sign-in failed</h2>
        <p className="text-sm text-gray-500 mt-1">{error}</p>
        <Link href="/sign-in" className="mt-4 inline-block text-sm text-blue-600 hover:underline">Try again</Link>
      </div>
    </div>
  )
}
