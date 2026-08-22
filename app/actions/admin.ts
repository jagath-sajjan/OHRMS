'use server'

import { auth } from '@/auth'
import { db } from '@/db/client'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export async function warnEmployee(targetUserId: string, _message: string) {
  const session = await auth()
  if (!session || session.user.role !== 'admin') return { error: 'Unauthorized' }

  const user = await db.select().from(users).where(eq(users.id, targetUserId)).get()
  if (!user) return { error: 'User not found' }

  await db.update(users)
    .set({ warnings: (user.warnings ?? 0) + 1 })
    .where(eq(users.id, targetUserId))

  revalidatePath(`/admin/employees/${targetUserId}`)
  return { success: true }
}

export async function deleteEmployee(targetUserId: string) {
  const session = await auth()
  if (!session || session.user.role !== 'admin') return { error: 'Unauthorized' }
  if (session.user.id === targetUserId) return { error: 'Cannot delete your own account' }

  const target = await db.select().from(users).where(eq(users.id, targetUserId)).get()
  if (target?.isMainAdmin) return { error: 'Cannot delete the main admin' }

  await db.delete(users).where(eq(users.id, targetUserId))

  revalidatePath('/admin/employees')
  return { success: true, redirect: true }
}

export async function toggleSuspend(targetUserId: string) {
  const session = await auth()
  if (!session || session.user.role !== 'admin') return { error: 'Unauthorized' }
  if (session.user.id === targetUserId) return { error: 'Cannot suspend yourself' }

  const user = await db.select().from(users).where(eq(users.id, targetUserId)).get()
  if (!user) return { error: 'User not found' }
  if (user.isMainAdmin) return { error: 'Cannot suspend the main admin' }

  const newStatus = user.status === 'active' ? 'suspended' : 'active'
  await db.update(users).set({ status: newStatus }).where(eq(users.id, targetUserId))

  revalidatePath(`/admin/employees/${targetUserId}`)
  revalidatePath('/admin/employees')
  return { success: true, newStatus }
}

export async function toggleAdminRole(targetUserId: string) {
  const session = await auth()
  if (!session || !session.user.isMainAdmin) return { error: 'Only the main admin can change roles' }
  if (session.user.id === targetUserId) return { error: 'Cannot change your own role' }

  const user = await db.select().from(users).where(eq(users.id, targetUserId)).get()
  if (!user) return { error: 'User not found' }

  const newRole = user.role === 'admin' ? 'employee' : 'admin'
  await db.update(users).set({ role: newRole }).where(eq(users.id, targetUserId))

  revalidatePath(`/admin/employees/${targetUserId}`)
  revalidatePath('/admin/employees')
  return { success: true, newRole }
}
