'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { warnEmployee, deleteEmployee, toggleSuspend, toggleAdminRole } from '@/app/actions/admin'
import { AlertTriangle, Trash2, ShieldCheck, ShieldOff, Loader2, UserX, UserCheck } from 'lucide-react'

interface Props {
  targetUserId: string
  currentStatus: string
  currentRole: string
  warnings: number
  isMainAdmin: boolean
  viewerIsMainAdmin: boolean
}

export default function AdminActions({
  targetUserId,
  currentStatus,
  currentRole,
  warnings,
  isMainAdmin,
  viewerIsMainAdmin
}: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [warnMsg, setWarnMsg] = useState('')
  const [showWarn, setShowWarn] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [error, setError] = useState('')
  const [status, setStatus] = useState(currentStatus)
  const [role, setRole] = useState(currentRole)

  function handleWarn() {
    if (!warnMsg.trim()) return
    startTransition(async () => {
      const result = await warnEmployee(targetUserId, warnMsg)
      if (result?.error) {
        setError(result.error)
      } else {
        setShowWarn(false)
        setWarnMsg('')
        router.refresh()
      }
    })
  }

  function handleSuspend() {
    startTransition(async () => {
      const result = await toggleSuspend(targetUserId)
      if (result?.error) {
        setError(result.error)
      } else {
        setStatus(result.newStatus ?? (status === 'active' ? 'suspended' : 'active'))
      }
    })
  }

  function handleToggleRole() {
    startTransition(async () => {
      const result = await toggleAdminRole(targetUserId)
      if (result?.error) {
        setError(result.error)
      } else {
        setRole(result.newRole ?? (role === 'admin' ? 'employee' : 'admin'))
      }
    })
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteEmployee(targetUserId)
      if (result?.error) {
        setError(result.error)
        setShowDelete(false)
      } else {
        router.push('/admin/employees')
      }
    })
  }

  return (
    <div className="card space-y-4">
      <h2 className="font-medium">Admin Actions</h2>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center gap-2 text-sm">
        <span className="text-gray-500">Status:</span>
        <span className={`font-medium capitalize ${
          status === 'active' ? 'text-green-600' : 'text-red-600'
        }`}>{status}</span>
        <span className="text-gray-400">·</span>
        <span className="text-gray-500">Warnings: <span className="font-medium text-orange-600">{warnings}</span></span>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setShowWarn(!showWarn)}
          disabled={isPending}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm border border-yellow-300 text-yellow-700 hover:bg-yellow-50"
        >
          <AlertTriangle size={14} />
          Warn
        </button>

        <button
          onClick={handleSuspend}
          disabled={isPending || isMainAdmin}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm border ${
            status === 'active'
              ? 'border-orange-300 text-orange-700 hover:bg-orange-50'
              : 'border-green-300 text-green-700 hover:bg-green-50'
          } disabled:opacity-40`}
        >
          {isPending ? <Loader2 size={14} className="animate-spin" /> : status === 'active' ? <UserX size={14} /> : <UserCheck size={14} />}
          {status === 'active' ? 'Suspend' : 'Reactivate'}
        </button>

        {viewerIsMainAdmin && (
          <button
            onClick={handleToggleRole}
            disabled={isPending}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm border border-blue-300 text-blue-700 hover:bg-blue-50"
          >
            {role === 'admin' ? <ShieldOff size={14} /> : <ShieldCheck size={14} />}
            {role === 'admin' ? 'Remove Admin' : 'Make Admin'}
          </button>
        )}

        <button
          onClick={() => setShowDelete(true)}
          disabled={isPending || isMainAdmin}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm border border-red-300 text-red-700 hover:bg-red-50 disabled:opacity-40"
        >
          <Trash2 size={14} />
          Delete
        </button>
      </div>

      {showWarn && (
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Warning message..."
            value={warnMsg}
            onChange={e => setWarnMsg(e.target.value)}
            className="input text-sm flex-1"
          />
          <button
            onClick={handleWarn}
            disabled={isPending || !warnMsg.trim()}
            className="px-3 py-1.5 bg-yellow-500 text-white text-sm rounded hover:bg-yellow-600 disabled:opacity-50"
          >
            {isPending ? <Loader2 size={12} className="animate-spin" /> : 'Send'}
          </button>
        </div>
      )}

      {showDelete && (
        <div className="border border-red-200 rounded p-3 bg-red-50">
          <p className="text-sm text-red-700 mb-3">This will permanently delete the employee and all their records. This cannot be undone.</p>
          <div className="flex gap-2">
            <button
              onClick={handleDelete}
              disabled={isPending}
              className="px-3 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50"
            >
              {isPending ? <Loader2 size={12} className="animate-spin" /> : 'Confirm Delete'}
            </button>
            <button onClick={() => setShowDelete(false)} className="px-3 py-1.5 text-sm border rounded hover:bg-gray-50">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
