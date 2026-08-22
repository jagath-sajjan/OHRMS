import { auth } from '@/auth'
import { db } from '@/db/client'
import { profiles, attendance, leaves, users } from '@/db/schema'
import { eq, desc, and, count } from 'drizzle-orm'
import { User, Clock, CalendarDays, Users, CheckCircle, AlertCircle } from 'lucide-react'

export default async function DashboardPage() {
  const session = await auth()
  if (!session) return null

  const isAdmin = session.user.role === 'admin'
  const today = new Date().toISOString().split('T')[0]

  if (isAdmin) {
    const [{ value: totalEmployees }] = await db.select({ value: count() }).from(users)
    const [{ value: presentToday }] = await db
      .select({ value: count() })
      .from(attendance)
      .where(and(eq(attendance.date, today), eq(attendance.status, 'present')))
    const [{ value: pendingLeaves }] = await db
      .select({ value: count() })
      .from(leaves)
      .where(eq(leaves.status, 'pending'))

    const recentLeaves = await db
      .select({
        id: leaves.id,
        type: leaves.type,
        status: leaves.status,
        startDate: leaves.startDate,
        firstName: profiles.firstName,
        lastName: profiles.lastName
      })
      .from(leaves)
      .leftJoin(profiles, eq(leaves.userId, profiles.userId))
      .orderBy(desc(leaves.createdAt))
      .limit(5)

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Admin overview</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <Users size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Employees</p>
              <p className="text-2xl font-bold">{totalEmployees}</p>
            </div>
          </div>
          <div className="card flex items-center gap-4">
            <div className="p-3 bg-green-50 rounded-lg">
              <CheckCircle size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Present Today</p>
              <p className="text-2xl font-bold">{presentToday}</p>
            </div>
          </div>
          <div className="card flex items-center gap-4">
            <div className="p-3 bg-yellow-50 rounded-lg">
              <AlertCircle size={20} className="text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pending Leaves</p>
              <p className="text-2xl font-bold">{pendingLeaves}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <CalendarDays size={16} className="text-gray-500" />
            <h2 className="font-medium">Recent Leave Requests</h2>
          </div>
          {recentLeaves.length === 0 ? (
            <p className="text-sm text-gray-400">No requests</p>
          ) : (
            <div className="space-y-2">
              {recentLeaves.map(l => (
                <div key={l.id} className="flex justify-between text-sm">
                  <span className="text-gray-700">
                    {l.firstName && l.lastName ? `${l.firstName} ${l.lastName}` : 'Unknown'} — <span className="capitalize">{l.type}</span>
                  </span>
                  <span className={`capitalize font-medium ${
                    l.status === 'approved' ? 'text-green-600' :
                    l.status === 'rejected' ? 'text-red-500' : 'text-yellow-600'
                  }`}>{l.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  const profile = await db.select().from(profiles).where(eq(profiles.userId, session.user.id)).get()

  const recentAttendance = await db
    .select()
    .from(attendance)
    .where(eq(attendance.userId, session.user.id))
    .orderBy(desc(attendance.date))
    .limit(5)

  const recentLeaves = await db
    .select()
    .from(leaves)
    .where(eq(leaves.userId, session.user.id))
    .orderBy(desc(leaves.createdAt))
    .limit(3)

  const [{ value: presentCount }] = await db
    .select({ value: count() })
    .from(attendance)
    .where(and(eq(attendance.userId, session.user.id), eq(attendance.status, 'present')))

  const [{ value: pendingCount }] = await db
    .select({ value: count() })
    .from(leaves)
    .where(and(eq(leaves.userId, session.user.id), eq(leaves.status, 'pending')))

  const name = profile ? `${profile.firstName} ${profile.lastName}` : session.user.email

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome back, {name}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-lg">
            <User size={20} className="text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Employee ID</p>
            <p className="font-semibold">{session.user.employeeId}</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="p-3 bg-green-50 rounded-lg">
            <Clock size={20} className="text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Days Present</p>
            <p className="text-2xl font-bold">{presentCount}</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="p-3 bg-yellow-50 rounded-lg">
            <CalendarDays size={20} className="text-yellow-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Pending Leaves</p>
            <p className="text-2xl font-bold">{pendingCount}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Clock size={16} className="text-gray-500" />
            <h2 className="font-medium">Recent Attendance</h2>
          </div>
          {recentAttendance.length === 0 ? (
            <p className="text-sm text-gray-400">No records yet</p>
          ) : (
            <div className="space-y-2">
              {recentAttendance.map(a => (
                <div key={a.id} className="flex justify-between text-sm">
                  <span className="text-gray-600">{a.date}</span>
                  <span className={`capitalize font-medium ${
                    a.status === 'present' ? 'text-green-600' :
                    a.status === 'absent' ? 'text-red-500' :
                    a.status === 'half-day' ? 'text-yellow-600' : 'text-blue-600'
                  }`}>{a.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <CalendarDays size={16} className="text-gray-500" />
            <h2 className="font-medium">Recent Leave Requests</h2>
          </div>
          {recentLeaves.length === 0 ? (
            <p className="text-sm text-gray-400">No requests yet</p>
          ) : (
            <div className="space-y-2">
              {recentLeaves.map(l => (
                <div key={l.id} className="flex justify-between text-sm">
                  <span className="text-gray-600 capitalize">{l.type}</span>
                  <span className={`capitalize font-medium ${
                    l.status === 'approved' ? 'text-green-600' :
                    l.status === 'rejected' ? 'text-red-500' : 'text-yellow-600'
                  }`}>{l.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
