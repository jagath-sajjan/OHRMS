'use server'

import { db } from '@/db/client'
import { leaves } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export async function applyLeave(formData: FormData) {
  const userId = formData.get('userId') as string
  const type = formData.get('type') as string
  const startDate = formData.get('startDate') as string
  const endDate = formData.get('endDate') as string
  const remarks = formData.get('remarks') as string

  if (!userId || !type || !startDate || !endDate) {
    return { error: 'All fields required' }
  }

  if (new Date(endDate) < new Date(startDate)) {
    return { error: 'End date must be after start date' }
  }

  await db.insert(leaves).values({
    userId,
    type: type as 'paid' | 'sick' | 'unpaid',
    startDate,
    endDate,
    remarks: remarks || null,
    status: 'pending'
  })

  revalidatePath('/leaves')
  return { success: true }
}

export async function updateLeaveStatus(leaveId: string, status: 'approved' | 'rejected', comment?: string) {
  await db.update(leaves)
    .set({ status, adminComment: comment ?? null })
    .where(eq(leaves.id, leaveId))

  revalidatePath('/admin/leaves')
  return { success: true }
}
