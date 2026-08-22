import { auth } from '@/auth'
import { db } from '@/db/client'
import { attendance } from '@/db/schema'
import { eq, desc } from 'drizzle-orm'
import { Clock } from 'lucide-react'
import CheckInButton from './check-in-button'
import AttendanceView from './attendance-view'

export default async function AttendancePage() {
  const session = await auth()
  if (!session) return null

  const today = new Date().toISOString().split('T')[0]

  const records = await db
    .select()
    .from(attendance)
    .where(eq(attendance.userId, session.user.id))
    .orderBy(desc(attendance.date))
    .limit(60)

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
          Status:{' '}
          <span className={`font-medium capitalize ${
            todayRecord?.status === 'present' ? 'text-green-600' : 'text-gray-400'
          }`}>
            {todayRecord?.status ?? 'Not checked in'}
          </span>
        </p>
        <CheckInButton userId={session.user.id} todayRecord={todayRecord ?? null} />
      </div>

      <AttendanceView records={records} />
    </div>
  )
}
