'use client'

import { useState, useTransition } from 'react'
import { upsertPayroll } from '@/app/actions/payroll'
import { Loader2, Plus, X } from 'lucide-react'

interface Props {
  userId: string
  employeeName: string
}

export default function PayrollEditForm({ userId, employeeName }: Props) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    formData.append('userId', userId)
    startTransition(async () => {
      const result = await upsertPayroll(formData)
      if (result?.error) {
        setError(result.error)
      } else {
        setSaved(true)
        setOpen(false)
        ;(e.target as HTMLFormElement).reset()
      }
    })
  }

  if (!open) {
    return (
      <button
        onClick={() => { setOpen(true); setSaved(false) }}
        className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
      >
        <Plus size={12} />
        Set salary
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg border border-gray-200 p-6 w-full max-w-sm shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium">Set Salary — {employeeName}</h3>
          <button onClick={() => setOpen(false)} className="p-1 hover:bg-gray-100 rounded">
            <X size={16} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="label">Basic Salary</label>
            <input type="number" name="basicSalary" className="input" placeholder="0" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">HRA</label>
              <input type="number" name="hra" className="input" placeholder="0" />
            </div>
            <div>
              <label className="label">Allowances</label>
              <input type="number" name="allowances" className="input" placeholder="0" />
            </div>
          </div>
          <div>
            <label className="label">Deductions</label>
            <input type="number" name="deductions" className="input" placeholder="0" />
          </div>
          <div>
            <label className="label">Effective From</label>
            <input type="date" name="effectiveFrom" className="input" defaultValue={new Date().toISOString().split('T')[0]} required />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" className="btn-primary" disabled={isPending}>
            {isPending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            Save
          </button>
        </form>
      </div>
    </div>
  )
}
