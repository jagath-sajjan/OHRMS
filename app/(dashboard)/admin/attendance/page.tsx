import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { db } from '@/db/client'
import { attendance, users, profiles } from '@/db/schema'
import { eq, desc } from 'drizzle-orm'
import { Clock } from 'lucide-react'

export default async function AdminAttendancePage() {
  const session = await auth()
  if (session?.user.role !== 'admin') redirect('/dashboard')

  const records = await db
    .select({
      id: attendance.id,
      date: attendance.date,
      checkIn: attendance.checkIn,
      checkOut: attendance.checkOut,
      status: attendance.status,
      employeeId: users.employeeId,
      firstName: profiles.firstName,
      lastName: profiles.lastName
    })
    .from(attendance)
    .leftJoin(users, eq(attendance.userId, users.id))
    .leftJoin(profiles, eq(attendance.userId, profiles.userId))
    .orderBy(desc(attendance.date))
    .limit(100)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Clock size={20} />
        <h1 className="text-2xl font-semibold">All Attendance</h1>
      </div>

      <div className="card overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Employee</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Check In</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Check Out</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {records.map(r => (
              <tr key={r.id}>
                <td className="px-4 py-3">
                  <p>{r.firstName && r.lastName ? `${r.firstName} ${r.lastName}` : r.employeeId}</p>
                  <p className="text-xs text-gray-400 font-mono">{r.employeeId}</p>
                </td>
                <td className="px-4 py-3">{r.date}</td>
                <td className="px-4 py-3">{r.checkIn ?? '-'}</td>
                <td className="px-4 py-3">{r.checkOut ?? '-'}</td>
                <td className="px-4 py-3">
                  <span className={`capitalize font-medium ${
                    r.status === 'present' ? 'text-green-600' :
                    r.status === 'absent' ? 'text-red-500' :
                    r.status === 'half-day' ? 'text-yellow-600' : 'text-blue-600'
                  }`}>{r.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {records.length === 0 && <p className="text-sm text-gray-400 text-center py-8">No records</p>}
      </div>
    </div>
  )
}
