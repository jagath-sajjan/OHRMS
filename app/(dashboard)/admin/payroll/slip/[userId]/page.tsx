import { auth } from '@/auth'
import { redirect, notFound } from 'next/navigation'
import { db } from '@/db/client'
import { users, profiles, payroll } from '@/db/schema'
import { eq, desc } from 'drizzle-orm'
import SalarySlip from '@/components/salary-slip'

export default async function AdminSalarySlipPage({ params }: { params: Promise<{ userId: string }> }) {
  const session = await auth()
  if (!session || session.user.role !== 'admin') redirect('/dashboard')

  const { userId } = await params
  const user = await db.select().from(users).where(eq(users.id, userId)).get()
  if (!user) notFound()

  const profile = await db.select().from(profiles).where(eq(profiles.userId, userId)).get()
  const latestPayroll = await db
    .select()
    .from(payroll)
    .where(eq(payroll.userId, userId))
    .orderBy(desc(payroll.createdAt))
    .get()

  if (!latestPayroll) {
    return (
      <div className="p-8">
        <p className="text-gray-500">No payroll record found for this employee.</p>
      </div>
    )
  }

  return (
    <SalarySlip
      user={user}
      profile={profile ?? null}
      latestPayroll={latestPayroll}
      backHref="/admin/payroll"
    />
  )
}
