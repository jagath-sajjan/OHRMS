'use server'

import { db } from '@/db/client'
import { users, profiles } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

const signUpSchema = z.object({
  employeeId: z.string().min(3),
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.enum(['employee', 'admin'])
})

export async function checkAdminExists(): Promise<boolean> {
  const admin = await db.select({ id: users.id }).from(users).where(eq(users.role, 'admin')).get()
  return !!admin
}

export async function signUp(formData: FormData) {
  const raw = {
    employeeId: formData.get('employeeId') as string,
    email: formData.get('email') as string,
    firstName: formData.get('firstName') as string,
    lastName: formData.get('lastName') as string,
    role: formData.get('role') as string
  }

  const parsed = signUpSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.errors[0].message }

  const { employeeId, email, firstName, lastName, role } = parsed.data

  const adminAlreadyExists = await checkAdminExists()
  if (role === 'admin' && adminAlreadyExists) return { error: 'Admin account already exists' }

  const existing = await db.select().from(users).where(eq(users.email, email)).get()
  if (existing) return { error: 'Email already registered' }

  const existingId = await db.select().from(users).where(eq(users.employeeId, employeeId)).get()
  if (existingId) return { error: 'Employee ID already taken' }

  const isFirstAdmin = role === 'admin' && !adminAlreadyExists

  const [user] = await db.insert(users).values({
    employeeId,
    email,
    role: role as 'employee' | 'admin',
    isMainAdmin: isFirstAdmin
  }).returning()

  await db.insert(profiles).values({
    userId: user.id,
    firstName,
    lastName,
    joiningDate: new Date().toISOString().split('T')[0]
  })

  return { success: true }
}
