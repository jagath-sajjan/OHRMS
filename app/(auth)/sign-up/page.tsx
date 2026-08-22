import { db } from '@/db/client'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'
import SignUpForm from './sign-up-form'

export default async function SignUpPage() {
  const adminExists = !!(await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.role, 'admin'))
    .get())

  return <SignUpForm adminExists={adminExists} />
}
