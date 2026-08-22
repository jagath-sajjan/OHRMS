'use server'

import { db } from '@/db/client'
import { attendance } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export async function checkIn(userId: string) {
  const today = new Date().toISOString().split('T')[0]
  const now = new Date().toTimeString().split(' ')[0].slice(0, 5)

  const existing = await db
    .select()
    .from(attendance)
    .where(and(eq(attendance.userId, userId), eq(attendance.date, today)))
    .get()

  if (existing?.checkIn) return { error: 'Already checked in today' }

  if (existing) {
    await db.update(attendance)
      .set({ checkIn: now, status: 'present' })
      .where(eq(attendance.id, existing.id))
  } else {
    await db.insert(attendance).values({
      userId,
      date: today,
      checkIn: now,
      status: 'present'
    })
  }

  revalidatePath('/attendance')
  return { success: true }
}

export async function checkOut(userId: string) {
  const today = new Date().toISOString().split('T')[0]
  const now = new Date().toTimeString().split(' ')[0].slice(0, 5)

  const existing = await db
    .select()
    .from(attendance)
    .where(and(eq(attendance.userId, userId), eq(attendance.date, today)))
    .get()

  if (!existing?.checkIn) return { error: 'Not checked in yet' }
  if (existing.checkOut) return { error: 'Already checked out' }

  await db.update(attendance)
    .set({ checkOut: now })
    .where(eq(attendance.id, existing.id))

  revalidatePath('/attendance')
  return { success: true }
}
