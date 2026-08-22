import { auth } from '@/auth'
import { db } from '@/db/client'
import { profiles } from '@/db/schema'
import { eq } from 'drizzle-orm'
import ProfileEditForm from './profile-edit-form'

export default async function ProfileEditPage() {
  const session = await auth()
  if (!session) return null

  const profile = await db.select().from(profiles).where(eq(profiles.userId, session.user.id)).get()

  return (
    <ProfileEditForm
      profile={profile ?? null}
      userId={session.user.id}
      isAdmin={session.user.role === 'admin'}
    />
  )
}
