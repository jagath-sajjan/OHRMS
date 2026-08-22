import { auth } from '@/auth'
import { db } from '@/db/client'
import { attendance, leaves, users, profiles } from '@/db/schema'
import { eq, and, count } from 'drizzle-orm'
import { BarChart2, TrendingUp, CalendarDays } from 'lucide-react'

export default async function AnalyticsPage() {
  const session = await auth()
  if (!session) return null

  const isAdmin = session.user.role === 'admin'

  if (isAdmin) {
    const allEmployees = await db
      .select({
        id: users.id,
        employeeId: users.employeeId,
        firstName: profiles.firstName,
        lastName: profiles.lastName
      })
      .from(users)
      .leftJoin(profiles, eq(users.id, profiles.userId))

    const attendanceCounts = await db
      .select({
        userId: attendance.userId,
        status: attendance.status,
        cnt: count()
      })
      .from(attendance)
      .groupBy(attendance.userId, attendance.status)

    const leaveCounts = await db
      .select({
        userId: leaves.userId,
        type: leaves.type,
        status: leaves.status,
        cnt: count()
      })
      .from(leaves)
      .groupBy(leaves.userId, leaves.type, leaves.status)

    const statsMap = new Map<string, { present: number; total: number }>()
    for (const row of attendanceCounts) {
      if (!statsMap.has(row.userId)) statsMap.set(row.userId, { present: 0, total: 0 })
      const s = statsMap.get(row.userId)!
      s.total += row.cnt
      if (row.status === 'present') s.present += row.cnt
    }

    const leaveMap = new Map<string, { approved: number; pending: number }>()
    for (const row of leaveCounts) {
      if (!leaveMap.has(row.userId)) leaveMap.set(row.userId, { approved: 0, pending: 0 })
      const l = leaveMap.get(row.userId)!
      if (row.status === 'approved') l.approved += row.cnt
      if (row.status === 'pending') l.pending += row.cnt
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <BarChart2 size={20} />
          <h1 className="text-2xl font-semibold">Analytics</h1>
        </div>

        <div className="card overflow-hidden p-0">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <h2 className="font-medium text-sm">Attendance Overview</h2>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Employee</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Present</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Total Days</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Attendance %</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Approved Leaves</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Pending Leaves</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {allEmployees.map(emp => {
                const stats = statsMap.get(emp.id) ?? { present: 0, total: 0 }
                const leaveStats = leaveMap.get(emp.id) ?? { approved: 0, pending: 0 }
                const pct = stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0
                const name = emp.firstName && emp.lastName ? `${emp.firstName} ${emp.lastName}` : emp.employeeId
                return (
                  <tr key={emp.id}>
                    <td className="px-4 py-3">
                      <p>{name}</p>
                      <p className="text-xs text-gray-400 font-mono">{emp.employeeId}</p>
                    </td>
                    <td className="px-4 py-3 text-green-600 font-medium">{stats.present}</td>
                    <td className="px-4 py-3">{stats.total}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-100 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full ${
                              pct >= 80 ? 'bg-green-500' : pct >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{pct}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-blue-600">{leaveStats.approved}</td>
                    <td className="px-4 py-3 text-yellow-600">{leaveStats.pending}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {allEmployees.length === 0 && <p className="text-sm text-gray-400 text-center py-8">No data</p>}
        </div>
      </div>
    )
  }

  const myAttendance = await db
    .select({
      status: attendance.status,
      cnt: count()
    })
    .from(attendance)
    .where(eq(attendance.userId, session.user.id))
    .groupBy(attendance.status)

  const myLeaves = await db
    .select({
      type: leaves.type,
      status: leaves.status,
      cnt: count()
    })
    .from(leaves)
    .where(eq(leaves.userId, session.user.id))
    .groupBy(leaves.type, leaves.status)

  const present = myAttendance.find(r => r.status === 'present')?.cnt ?? 0
  const totalDays = myAttendance.reduce((s, r) => s + r.cnt, 0)
  const pct = totalDays > 0 ? Math.round((present / totalDays) * 100) : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <BarChart2 size={20} />
        <h1 className="text-2xl font-semibold">My Analytics</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={16} className="text-green-600" />
            <p className="text-sm font-medium">Attendance Rate</p>
          </div>
          <p className="text-3xl font-bold text-green-600">{pct}%</p>
          <p className="text-xs text-gray-400 mt-1">{present} present of {totalDays} days</p>
          <div className="w-full bg-gray-100 rounded-full h-2 mt-3">
            <div
              className={`h-2 rounded-full ${
                pct >= 80 ? 'bg-green-500' : pct >= 60 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        <div className="card sm:col-span-2">
          <div className="flex items-center gap-2 mb-3">
            <CalendarDays size={16} className="text-blue-600" />
            <p className="text-sm font-medium">Leave Summary</p>
          </div>
          {myLeaves.length === 0 ? (
            <p className="text-sm text-gray-400">No leave records</p>
          ) : (
            <div className="space-y-2">
              {myLeaves.map((l, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="capitalize text-gray-600">{l.type} — {l.status}</span>
                  <span className={`font-medium ${
                    l.status === 'approved' ? 'text-green-600' :
                    l.status === 'rejected' ? 'text-red-500' : 'text-yellow-600'
                  }`}>{l.cnt} day(s)</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
