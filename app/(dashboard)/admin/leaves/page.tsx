import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { db } from '@/db/client'
import { leaves, users, profiles } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { CalendarDays } from 'lucide-react'
import LeaveActions from './leave-actions'

export default async function AdminLeavesPage() {
  const session = await auth()
  if (session?.user.role !== 'admin') redirect('/dashboard')

  const records = await db
    .select({
      id: leaves.id,
      type: leaves.type,
      startDate: leaves.startDate,
      endDate: leaves.endDate,
      remarks: leaves.remarks,
      status: leaves.status,
      adminComment: leaves.adminComment,
      employeeId: users.employeeId,
      firstName: profiles.firstName,
      lastName: profiles.lastName
    })
    .from(leaves)
    .leftJoin(users, eq(leaves.userId, users.id))
    .leftJoin(profiles, eq(leaves.userId, profiles.userId))

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <CalendarDays size={20} />
        <h1 className="text-2xl font-semibold">Leave Requests</h1>
      </div>

      <div className="card overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Employee</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Type</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">From</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">To</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {records.map(l => (
              <tr key={l.id}>
                <td className="px-4 py-3">
                  <p>{l.firstName && l.lastName ? `${l.firstName} ${l.lastName}` : l.employeeId}</p>
                  <p className="text-xs text-gray-400 font-mono">{l.employeeId}</p>
                </td>
                <td className="px-4 py-3 capitalize">{l.type}</td>
                <td className="px-4 py-3">{l.startDate}</td>
                <td className="px-4 py-3">{l.endDate}</td>
                <td className="px-4 py-3">
                  <span className={`capitalize font-medium ${
                    l.status === 'approved' ? 'text-green-600' :
                    l.status === 'rejected' ? 'text-red-500' : 'text-yellow-600'
                  }`}>{l.status}</span>
                </td>
                <td className="px-4 py-3">
                  {l.status === 'pending' && <LeaveActions leaveId={l.id} />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {records.length === 0 && <p className="text-sm text-gray-400 text-center py-8">No leave requests</p>}
      </div>
    </div>
  )
}
