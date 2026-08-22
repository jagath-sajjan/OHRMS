import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { db } from '@/db/client'
import { payroll, users, profiles } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { DollarSign } from 'lucide-react'

export default async function AdminPayrollPage() {
  const session = await auth()
  if (session?.user.role !== 'admin') redirect('/dashboard')

  const records = await db
    .select({
      id: payroll.id,
      basicSalary: payroll.basicSalary,
      hra: payroll.hra,
      allowances: payroll.allowances,
      deductions: payroll.deductions,
      netSalary: payroll.netSalary,
      effectiveFrom: payroll.effectiveFrom,
      employeeId: users.employeeId,
      firstName: profiles.firstName,
      lastName: profiles.lastName
    })
    .from(payroll)
    .leftJoin(users, eq(payroll.userId, users.id))
    .leftJoin(profiles, eq(payroll.userId, profiles.userId))

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <DollarSign size={20} />
        <h1 className="text-2xl font-semibold">Payroll</h1>
      </div>

      <div className="card overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Employee</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Basic</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">HRA</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Allowances</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Deductions</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Net</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Effective</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {records.map(r => (
              <tr key={r.id}>
                <td className="px-4 py-3">
                  <p>{r.firstName && r.lastName ? `${r.firstName} ${r.lastName}` : r.employeeId}</p>
                  <p className="text-xs text-gray-400 font-mono">{r.employeeId}</p>
                </td>
                <td className="px-4 py-3">₹{r.basicSalary.toLocaleString()}</td>
                <td className="px-4 py-3">₹{(r.hra ?? 0).toLocaleString()}</td>
                <td className="px-4 py-3">₹{(r.allowances ?? 0).toLocaleString()}</td>
                <td className="px-4 py-3 text-red-600">₹{(r.deductions ?? 0).toLocaleString()}</td>
                <td className="px-4 py-3 font-semibold text-green-600">₹{r.netSalary.toLocaleString()}</td>
                <td className="px-4 py-3 text-gray-500">{r.effectiveFrom}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {records.length === 0 && <p className="text-sm text-gray-400 text-center py-8">No payroll records</p>}
      </div>
    </div>
  )
}
