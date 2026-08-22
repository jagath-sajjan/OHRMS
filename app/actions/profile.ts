'use server'

import { auth } from '@/auth'
import { db } from '@/db/client'
import { profiles } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: FormData, targetUserId: string) {
  const session = await auth()
  if (!session) return { error: 'Unauthorized' }

  const isAdmin = session.user.role === 'admin'
  const isSelf = session.user.id === targetUserId

  if (!isAdmin && !isSelf) return { error: 'Unauthorized' }

  const data: Record<string, string | null> = {
    phone: (formData.get('phone') as string) || null,
    address: (formData.get('address') as string) || null,
    dateOfBirth: (formData.get('dateOfBirth') as string) || null,
  }

  if (isAdmin) {
    data.firstName = formData.get('firstName') as string
    data.lastName = formData.get('lastName') as string
    data.department = (formData.get('department') as string) || null
    data.designation = (formData.get('designation') as string) || null
    data.joiningDate = (formData.get('joiningDate') as string) || null
    data.photoUrl = (formData.get('photoUrl') as string) || null
  }

  await db.update(profiles).set(data).where(eq(profiles.userId, targetUserId))

  revalidatePath('/profile')
  revalidatePath('/admin/employees')
  return { success: true }
}
