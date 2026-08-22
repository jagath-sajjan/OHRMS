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
}

export default function EmployeeEditForm({ profile, userId }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await updateProfile(formData, userId)
      if (result?.error) {
        setError(result.error)
      } else {
        setSaved(true)
        router.refresh()
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="card max-w-2xl space-y-4">
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

      {error && <p className="text-sm text-red-600">{error}</p>}
      {saved && <p className="text-sm text-green-600">Saved successfully</p>}

      <div className="flex gap-3">
        <button type="submit" className="btn-primary w-auto px-5" disabled={isPending}>
          {isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          Save
        </button>
        <Link href="/admin/employees" className="btn-secondary">
          <ArrowLeft size={14} />
          Back
        </Link>
      </div>
    </form>
  )
}
