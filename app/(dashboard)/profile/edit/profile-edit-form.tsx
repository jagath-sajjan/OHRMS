'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateProfile } from '@/app/actions/profile'
import type { Profile } from '@/db/schema'
import { Save, Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface Props {
  profile: Profile | null
  userId: string
  isAdmin: boolean
}

export default function ProfileEditForm({ profile, userId, isAdmin }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await updateProfile(formData, userId)
      if (result?.error) {
        setError(result.error)
      } else {
        router.push('/profile')
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/profile" className="p-1.5 rounded hover:bg-gray-100">
          <ArrowLeft size={18} />
        </Link>
        <h1 className="text-2xl font-semibold">Edit Profile</h1>
      </div>

      <form onSubmit={handleSubmit} className="card max-w-2xl space-y-4">
        {isAdmin && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">First Name</label>
                <input name="firstName" defaultValue={profile?.firstName ?? ''} className="input" required />
              </div>
              <div>
                <label className="label">Last Name</label>
                <input name="lastName" defaultValue={profile?.lastName ?? ''} className="input" required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Department</label>
                <input name="department" defaultValue={profile?.department ?? ''} className="input" />
              </div>
              <div>
                <label className="label">Designation</label>
                <input name="designation" defaultValue={profile?.designation ?? ''} className="input" />
              </div>
            </div>
            <div>
              <label className="label">Joining Date</label>
              <input type="date" name="joiningDate" defaultValue={profile?.joiningDate ?? ''} className="input" />
            </div>
          </>
        )}

        <div>
          <label className="label">Phone</label>
          <input name="phone" defaultValue={profile?.phone ?? ''} className="input" />
        </div>
        <div>
          <label className="label">Address</label>
          <textarea name="address" defaultValue={profile?.address ?? ''} className="input" rows={2} />
        </div>
        <div>
          <label className="label">Date of Birth</label>
          <input type="date" name="dateOfBirth" defaultValue={profile?.dateOfBirth ?? ''} className="input" />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-3">
          <button type="submit" className="btn-primary w-auto px-5" disabled={isPending}>
            {isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Save
          </button>
          <Link href="/profile" className="btn-secondary">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
