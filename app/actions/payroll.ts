'use server'

import { auth } from '@/auth'
import { db } from '@/db/client'
import { payroll } from '@/db/schema'
import { revalidatePath } from 'next/cache'

export async function upsertPayroll(formData: FormData) {
  const session = await auth()
  if (!session || session.user.role !== 'admin') return { error: 'Unauthorized' }

  const userId = formData.get('userId') as string
  const basicSalary = parseFloat(formData.get('basicSalary') as string) || 0
  const hra = parseFloat(formData.get('hra') as string) || 0
  const allowances = parseFloat(formData.get('allowances') as string) || 0
  const deductions = parseFloat(formData.get('deductions') as string) || 0
  const effectiveFrom = (formData.get('effectiveFrom') as string) || new Date().toISOString().split('T')[0]
  const netSalary = basicSalary + hra + allowances - deductions

  await db.insert(payroll).values({
    userId,
    basicSalary,
    hra,
    allowances,
    deductions,
    netSalary,
    effectiveFrom
  })

  revalidatePath('/admin/payroll')
  return { success: true }
}
