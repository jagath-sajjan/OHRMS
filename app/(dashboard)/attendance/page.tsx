import { auth } from '@/auth'
import { db } from '@/db/client'
import { attendance } from '@/db/schema'
import { eq, desc } from 'drizzle-orm'
import { Clock } from 'lucide-react'
import CheckInButton from './check-in-button'

export default async function AttendancePage() {
  const session = await auth()
  if (!session) return null

  const today = new Date().toISOString().split('T')[0]

  const records = await db
    .select()
    .from(attendance)
    .where(eq(attendance.userId, session.user.id))
    .orderBy(desc(attendance.date))
    .limit(30)

  const todayRecord = records.find(r => r.date === today)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Clock size={20} />
        <h1 className="text-2xl font-semibold">Attendance</h1>
      </div>

      <div className="card max-w-sm">
        <p className="text-sm text-gray-500 mb-1">Today: {today}</p>
        <p className="text-sm mb-4">
          Status: <span className={`font-medium capitalize ${
            todayRecord?.status === 'present' ? 'text-green-600' : 'text-gray-400'
          }`}>{todayRecord?.status ?? 'Not checked in'}</span>
        </p>
        <CheckInButton userId={session.user.id} todayRecord={todayRecord ?? null} />
      </div>

      <div className="card overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Check In</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Check Out</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {records.map(r => (
              <tr key={r.id}>
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
        {records.length === 0 && <p className="text-sm text-gray-400 text-center py-8">No records yet</p>}
      </div>
    </div>
  )
}
