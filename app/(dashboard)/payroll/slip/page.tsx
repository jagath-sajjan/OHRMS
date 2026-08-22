import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { db } from '@/db/client'
import { payroll, users, profiles } from '@/db/schema'
import { eq, desc } from 'drizzle-orm'
import SalarySlip from '@/components/salary-slip'

export default async function EmployeeSalarySlipPage() {
  const session = await auth()
  if (!session) redirect('/sign-in')

  const user = await db.select().from(users).where(eq(users.id, session.user.id)).get()
  if (!user) redirect('/sign-in')

  const profile = await db.select().from(profiles).where(eq(profiles.userId, session.user.id)).get()
  const latestPayroll = await db
    .select()
    .from(payroll)
    .where(eq(payroll.userId, session.user.id))
    .orderBy(desc(payroll.createdAt))
    .get()

  if (!latestPayroll) {
    return (
      <div className="p-8">
        <p className="text-gray-500">No payroll record found. Please contact your admin.</p>
      </div>
    )
  }

  return (
    <SalarySlip
      user={user}
      profile={profile ?? null}
      latestPayroll={latestPayroll}
      backHref="/payroll"
    />
  )
}
