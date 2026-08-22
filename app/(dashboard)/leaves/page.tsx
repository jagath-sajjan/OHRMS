import { auth } from '@/auth'
import { db } from '@/db/client'
import { leaves } from '@/db/schema'
import { eq, desc } from 'drizzle-orm'
import { CalendarDays } from 'lucide-react'
import LeaveForm from './leave-form'

export default async function LeavesPage() {
  const session = await auth()
  if (!session) return null

  const records = await db
    .select()
    .from(leaves)
    .where(eq(leaves.userId, session.user.id))
    .orderBy(desc(leaves.createdAt))

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <CalendarDays size={20} />
        <h1 className="text-2xl font-semibold">Leaves</h1>
      </div>

      <LeaveForm userId={session.user.id} />

      <div className="card overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Type</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">From</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">To</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Remarks</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {records.map(l => (
              <tr key={l.id}>
                <td className="px-4 py-3 capitalize">{l.type}</td>
                <td className="px-4 py-3">{l.startDate}</td>
                <td className="px-4 py-3">{l.endDate}</td>
                <td className="px-4 py-3 text-gray-500">{l.remarks ?? '-'}</td>
                <td className="px-4 py-3">
                  <span className={`capitalize font-medium ${
                    l.status === 'approved' ? 'text-green-600' :
                    l.status === 'rejected' ? 'text-red-500' : 'text-yellow-600'
                  }`}>{l.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {records.length === 0 && <p className="text-sm text-gray-400 text-center py-8">No leave requests yet</p>}
      </div>
    </div>
  )
}
