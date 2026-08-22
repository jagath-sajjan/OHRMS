import { auth } from '@/auth'
import { redirect, notFound } from 'next/navigation'
import { db } from '@/db/client'
import { users, profiles } from '@/db/schema'
import { eq } from 'drizzle-orm'
import EmployeeEditForm from './employee-edit-form'
import AdminActions from './admin-actions'

export default async function EmployeeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (session?.user.role !== 'admin') redirect('/dashboard')

  const { id } = await params

  const user = await db.select().from(users).where(eq(users.id, id)).get()
  if (!user) notFound()

  const profile = await db.select().from(profiles).where(eq(profiles.userId, id)).get()

  const name = profile ? `${profile.firstName} ${profile.lastName}` : user.employeeId

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{name}</h1>
        <p className="text-sm text-gray-500 font-mono mt-1">
          {user.employeeId} · {user.email} · <span className="capitalize">{user.role}</span>
          {user.isMainAdmin && <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">Main Admin</span>}
        </p>
      </div>

      <AdminActions
        targetUserId={id}
        currentStatus={user.status}
        currentRole={user.role}
        warnings={user.warnings ?? 0}
        isMainAdmin={user.isMainAdmin ?? false}
        viewerIsMainAdmin={session.user.isMainAdmin}
      />

      <EmployeeEditForm profile={profile ?? null} userId={id} />
    </div>
  )
}
