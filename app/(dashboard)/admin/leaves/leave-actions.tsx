'use client'

import { useState, useTransition } from 'react'
import { updateLeaveStatus } from '@/app/actions/leaves'
import { Check, X, Loader2 } from 'lucide-react'

interface Props {
  leaveId: string
}

export default function LeaveActions({ leaveId }: Props) {
  const [isPending, startTransition] = useTransition()
  const [comment, setComment] = useState('')

  function handle(status: 'approved' | 'rejected') {
    startTransition(async () => {
      await updateLeaveStatus(leaveId, status, comment)
    })
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        placeholder="Comment"
        value={comment}
        onChange={e => setComment(e.target.value)}
        className="input text-xs w-28"
      />
      <button
        onClick={() => handle('approved')}
        disabled={isPending}
        className="p-1.5 rounded bg-green-50 text-green-600 hover:bg-green-100"
      >
        {isPending ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
      </button>
      <button
        onClick={() => handle('rejected')}
        disabled={isPending}
        className="p-1.5 rounded bg-red-50 text-red-600 hover:bg-red-100"
      >
        {isPending ? <Loader2 size={12} className="animate-spin" /> : <X size={12} />}
      </button>
    </div>
  )
}
