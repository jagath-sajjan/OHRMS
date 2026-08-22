'use client'

import { useState, useTransition } from 'react'
import { upsertPayroll } from '@/app/actions/payroll'
import type { Deduction } from '@/db/schema'
import { Loader2, Plus, X, Trash2 } from 'lucide-react'

interface Props {
  userId: string
  employeeName: string
}

const DEFAULT_DEDUCTIONS: Deduction[] = [
  { id: 'pf', title: 'PF', amount: 12, type: 'percentage' },
  { id: 'fines', title: 'Fines', amount: 0, type: 'fixed' }
]

export default function PayrollEditForm({ userId, employeeName }: Props) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const [basicSalary, setBasicSalary] = useState(0)
  const [hraPercentage, setHraPercentage] = useState(24)
  const [allowances, setAllowances] = useState(0)
  const [deductions, setDeductions] = useState<Deduction[]>(DEFAULT_DEDUCTIONS)

  const hra = basicSalary * hraPercentage / 100
  const totalDeductions = deductions.reduce((sum, d) => {
    return sum + (d.type === 'percentage' ? basicSalary * d.amount / 100 : d.amount)
  }, 0)
  const netSalary = basicSalary + hra + allowances - totalDeductions

  function addDeduction() {
    setDeductions(prev => [
      ...prev,
      { id: crypto.randomUUID(), title: '', amount: 0, type: 'fixed' }
    ])
  }

  function removeDeduction(id: string) {
    setDeductions(prev => prev.filter(d => d.id !== id))
  }

  function updateDeduction(id: string, field: keyof Deduction, value: string | number) {
    setDeductions(prev => prev.map(d => d.id === id ? { ...d, [field]: value } : d))
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    formData.append('userId', userId)
    formData.set('basicSalary', String(basicSalary))
    formData.set('hraPercentage', String(hraPercentage))
    formData.set('allowances', String(allowances))
    formData.set('deductionsJson', JSON.stringify(deductions))
    startTransition(async () => {
      const result = await upsertPayroll(formData)
      if (result?.error) {
        setError(result.error)
      } else {
        setOpen(false)
        setError('')
      }
    })
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
      >
        <Plus size={12} />
        Set salary
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg border border-gray-200 p-6 w-full max-w-md shadow-lg max-h-screen overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium">Set Salary — {employeeName}</h3>
          <button onClick={() => setOpen(false)} className="p-1 hover:bg-gray-100 rounded">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Basic Salary (₹)</label>
            <input
              type="number"
              className="input"
              value={basicSalary || ''}
              onChange={e => setBasicSalary(parseFloat(e.target.value) || 0)}
              required
            />
          </div>

          <div>
            <label className="label">HRA (%)</label>
            <input
              type="number"
              step="0.1"
              className="input"
              value={hraPercentage}
              onChange={e => setHraPercentage(parseFloat(e.target.value) || 0)}
            />
            {basicSalary > 0 && (
              <p className="text-xs text-gray-400 mt-1">= ₹{hra.toLocaleString()}</p>
            )}
          </div>

          <div>
            <label className="label">Allowances (₹)</label>
            <input
              type="number"
              className="input"
              value={allowances || ''}
              onChange={e => setAllowances(parseFloat(e.target.value) || 0)}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="label mb-0">Deductions</label>
              <button type="button" onClick={addDeduction} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700">
                <Plus size={12} />
                Add
              </button>
            </div>
            <div className="space-y-2">
              {deductions.map(d => (
                <div key={d.id} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Title"
                    value={d.title}
                    onChange={e => updateDeduction(d.id, 'title', e.target.value)}
                    className="input text-xs flex-1"
                  />
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Amount"
                    value={d.amount || ''}
                    onChange={e => updateDeduction(d.id, 'amount', parseFloat(e.target.value) || 0)}
                    className="input text-xs w-20"
                  />
                  <select
                    value={d.type}
                    onChange={e => updateDeduction(d.id, 'type', e.target.value as 'fixed' | 'percentage')}
                    className="input text-xs w-24"
                  >
                    <option value="fixed">₹ Fixed</option>
                    <option value="percentage">% of Basic</option>
                  </select>
                  {d.id !== 'pf' && d.id !== 'fines' && (
                    <button type="button" onClick={() => removeDeduction(d.id)} className="p-1 text-red-400 hover:text-red-600">
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="border-t pt-3 space-y-1 text-sm">
            <div className="flex justify-between text-gray-500">
              <span>Gross Earnings</span>
              <span>₹{(basicSalary + hra + allowances).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-red-500">
              <span>Total Deductions</span>
              <span>₹{totalDeductions.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-semibold text-green-600">
              <span>Net Salary</span>
              <span>₹{netSalary.toLocaleString()}</span>
            </div>
          </div>

          <div>
            <label className="label">Effective From</label>
            <input
              type="date"
              name="effectiveFrom"
              className="input"
              defaultValue={new Date().toISOString().split('T')[0]}
              required
            />
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
