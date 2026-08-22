'use client'

import { useState, useTransition } from 'react'
import { applyLeave } from '@/app/actions/leaves'
import { Loader2, Plus, ChevronDown } from 'lucide-react'
import { useToast } from '@/components/toast'
import { desktopNotify } from '@/components/notification-init'

interface Props {
  userId: string
}

export default function LeaveForm({ userId }: Props) {
  const toast = useToast()
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    formData.append('userId', userId)
    startTransition(async () => {
      const result = await applyLeave(formData)
      if (result?.error) {
        toast(result.error, 'error')
        desktopNotify('Leave request failed', result.error)
      } else {
        toast('Leave request submitted successfully.', 'success')
        desktopNotify('Leave request submitted ✅', 'Your leave request is pending admin review.')
        setOpen(false)
        form.reset()
      }
    })
  }

  return (
    <div className="card">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
      >
        {open ? <ChevronDown size={16} /> : <Plus size={16} />}
        {open ? 'Cancel' : 'Apply for leave'}
      </button>

      {open && (
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="label">Leave Type</label>
            <select name="type" className="input">
              <option value="paid">Paid</option>
              <option value="sick">Sick</option>
              <option value="unpaid">Unpaid</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">From</label>
              <input type="date" name="startDate" className="input" required />
            </div>
            <div>
              <label className="label">To</label>
              <input type="date" name="endDate" className="input" required />
            </div>
          </div>
          <div>
            <label className="label">Remarks</label>
            <textarea name="remarks" className="input" rows={2} />
          </div>
          <button type="submit" className="btn-primary w-auto px-4" disabled={isPending}>
            {isPending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            Submit
          </button>
        </form>
      )}
    </div>
  )
}
