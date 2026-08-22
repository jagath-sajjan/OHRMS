import { db } from '@/db/client'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'
import Link from 'next/link'
import { CheckCircle, XCircle } from 'lucide-react'

export default async function VerifyEmailPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card max-w-sm w-full text-center">
          <XCircle size={40} className="mx-auto text-red-500 mb-3" />
          <h2 className="font-semibold">Invalid link</h2>
          <Link href="/sign-in" className="mt-4 inline-block text-sm text-blue-600 hover:underline">Sign in</Link>
        </div>
      </div>
    )
  }

  const user = await db.select().from(users).where(eq(users.verificationToken, token)).get()

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card max-w-sm w-full text-center">
          <XCircle size={40} className="mx-auto text-red-500 mb-3" />
          <h2 className="font-semibold">Invalid or expired token</h2>
          <Link href="/sign-in" className="mt-4 inline-block text-sm text-blue-600 hover:underline">Sign in</Link>
        </div>
      </div>
    )
  }

  await db.update(users)
    .set({ emailVerified: true, verificationToken: null })
    .where(eq(users.id, user.id))

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="card max-w-sm w-full text-center">
        <CheckCircle size={40} className="mx-auto text-green-500 mb-3" />
        <h2 className="font-semibold">Email verified</h2>
        <p className="text-sm text-gray-500 mt-1">Your account is now active.</p>
        <Link href="/sign-in" className="mt-4 inline-block text-sm text-blue-600 hover:underline">Sign in</Link>
      </div>
    </div>
  )
}
