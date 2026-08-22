'use client'

import { useState, useTransition } from 'react'
import { checkIn, checkOut } from '@/app/actions/attendance'
import { Loader2, LogIn, LogOut } from 'lucide-react'
import type { Attendance } from '@/db/schema'

interface Props {
  userId: string
  todayRecord: Attendance | null
}

export default function CheckInButton({ userId, todayRecord }: Props) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')

  const canCheckIn = !todayRecord || (!todayRecord.checkIn)
  const canCheckOut = todayRecord?.checkIn && !todayRecord.checkOut

  function handleCheckIn() {
    startTransition(async () => {
      const result = await checkIn(userId)
      if (result?.error) setError(result.error)
    })
  }

  function handleCheckOut() {
    startTransition(async () => {
      const result = await checkOut(userId)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <div className="flex gap-2">
      {canCheckIn && (
        <button onClick={handleCheckIn} disabled={isPending} className="btn-primary w-auto px-4">
          {isPending ? <Loader2 size={14} className="animate-spin" /> : <LogIn size={14} />}
          Check In
        </button>
      )}
      {canCheckOut && (
        <button onClick={handleCheckOut} disabled={isPending} className="btn-secondary">
          {isPending ? <Loader2 size={14} className="animate-spin" /> : <LogOut size={14} />}
          Check Out
        </button>
      )}
      {!canCheckIn && !canCheckOut && (
        <p className="text-sm text-gray-500">Attendance recorded for today</p>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}
