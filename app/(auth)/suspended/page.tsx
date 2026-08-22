import Link from 'next/link'
import { ShieldOff } from 'lucide-react'

export default function SuspendedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="card max-w-sm w-full text-center space-y-4">
        <ShieldOff size={40} className="mx-auto text-red-500" />
        <h1 className="text-xl font-semibold text-gray-900">Account Suspended</h1>
        <p className="text-sm text-gray-500">
          Your account has been suspended. Please contact your administrator for more information.
        </p>
        <Link
          href="/sign-in"
          className="inline-block text-sm text-blue-600 hover:underline"
        >
          Back to sign in
        </Link>
      </div>
    </div>
  )
}
