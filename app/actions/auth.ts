'use server'

import { db } from '@/db/client'
import { users, profiles } from '@/db/schema'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import { Resend } from 'resend'
import { z } from 'zod'

const resend = new Resend(process.env.RESEND_API_KEY)

const signUpSchema = z.object({
  employeeId: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(8).regex(/[A-Z]/, 'Password must have uppercase').regex(/[0-9]/, 'Password must have number'),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.enum(['employee', 'admin'])
})

export async function signUp(formData: FormData) {
  const raw = {
    employeeId: formData.get('employeeId') as string,
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    firstName: formData.get('firstName') as string,
    lastName: formData.get('lastName') as string,
    role: formData.get('role') as string
  }

  const parsed = signUpSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message }
  }

  const { employeeId, email, password, firstName, lastName, role } = parsed.data

  const existing = await db.select().from(users).where(eq(users.email, email)).get()
  if (existing) return { error: 'Email already registered' }

  const existingId = await db.select().from(users).where(eq(users.employeeId, employeeId)).get()
  if (existingId) return { error: 'Employee ID already taken' }

  const hashed = await bcrypt.hash(password, 10)
  const token = crypto.randomUUID()

  const [user] = await db.insert(users).values({
    employeeId,
    email,
    password: hashed,
    role: role as 'employee' | 'admin',
    verificationToken: token
  }).returning()

  await db.insert(profiles).values({
    userId: user.id,
    firstName,
    lastName,
    joiningDate: new Date().toISOString().split('T')[0]
  })

  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`

  await resend.emails.send({
    from: 'OHRMS <onboarding@resend.dev>',
    to: email,
    subject: 'Verify your email',
    html: `<p>Click <a href="${verifyUrl}">here</a> to verify your email.</p>`
  })

  return { success: true }
}
