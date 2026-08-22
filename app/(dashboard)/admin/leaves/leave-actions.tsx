'use client'

import { useState, useTransition } from 'react'
import { updateLeaveStatus } from '@/app/actions/leaves'
import { Check, X, Loader2 } from 'lucide-react'
import { useToast } from '@/components/toast'
import { desktopNotify } from '@/components/notification-init'

interface Props {
  leaveId: string
  employeeName: string
}

export default function LeaveActions({ leaveId, employeeName }: Props) {
  const toast = useToast()
  const [isPending, startTransition] = useTransition()
  const [comment, setComment] = useState('')

  function handle(status: 'approved' | 'rejected') {
    startTransition(async () => {
      await updateLeaveStatus(leaveId, status, comment)
      const label = status === 'approved' ? 'approved' : 'rejected'
      const toastType = status === 'approved' ? 'success' : 'warning'
      toast(`Leave ${label} for ${employeeName}.`, toastType)
      desktopNotify(
        `Leave ${label} ✅`,
        `You ${label} the leave request for ${employeeName}.`
      )
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
        title="Approve"
      >
        {isPending ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
      </button>
      <button
        onClick={() => handle('rejected')}
        disabled={isPending}
        className="p-1.5 rounded bg-red-50 text-red-600 hover:bg-red-100"
        title="Reject"
      >
        {isPending ? <Loader2 size={12} className="animate-spin" /> : <X size={12} />}
      </button>
    </div>
  )
}
