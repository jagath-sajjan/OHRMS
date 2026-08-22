import { auth } from '@/auth'
import { redirect, notFound } from 'next/navigation'
import { db } from '@/db/client'
import { users, profiles } from '@/db/schema'
import { eq } from 'drizzle-orm'
import EmployeeEditForm from './employee-edit-form'

export default async function EmployeeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (session?.user.role !== 'admin') redirect('/dashboard')

  const { id } = await params

  const user = await db.select().from(users).where(eq(users.id, id)).get()
  if (!user) notFound()

  const profile = await db.select().from(profiles).where(eq(profiles.userId, id)).get()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{profile ? `${profile.firstName} ${profile.lastName}` : user.employeeId}</h1>
        <p className="text-sm text-gray-500 font-mono mt-1">{user.employeeId} · {user.email}</p>
      </div>
      <EmployeeEditForm profile={profile ?? null} userId={id} />
    </div>
  )
}
