'use server'

import { auth } from '@/auth'
import { db } from '@/db/client'
import { payroll } from '@/db/schema'
import type { Deduction } from '@/db/schema'
import { revalidatePath } from 'next/cache'

export async function upsertPayroll(formData: FormData) {
  const session = await auth()
  if (!session || session.user.role !== 'admin') return { error: 'Unauthorized' }

  const userId = formData.get('userId') as string
  const basicSalary = parseFloat(formData.get('basicSalary') as string) || 0
  const hraPercentage = parseFloat(formData.get('hraPercentage') as string) || 24
  const allowances = parseFloat(formData.get('allowances') as string) || 0
  const effectiveFrom = (formData.get('effectiveFrom') as string) || new Date().toISOString().split('T')[0]
  const deductionsJsonRaw = formData.get('deductionsJson') as string

  let deductionsList: Deduction[] = []
  try {
    deductionsList = JSON.parse(deductionsJsonRaw)
  } catch {
    deductionsList = []
  }

  const hra = basicSalary * hraPercentage / 100
  const totalDeductions = deductionsList.reduce((sum, d) => {
    return sum + (d.type === 'percentage' ? basicSalary * d.amount / 100 : d.amount)
  }, 0)
  const netSalary = basicSalary + hra + allowances - totalDeductions

  await db.insert(payroll).values({
    userId,
    basicSalary,
    hraPercentage,
    hra,
    allowances,
    deductions: totalDeductions,
    deductionsJson: JSON.stringify(deductionsList),
    netSalary,
    effectiveFrom
  })

  revalidatePath('/admin/payroll')
  revalidatePath(`/payroll`)
  return { success: true }
}
