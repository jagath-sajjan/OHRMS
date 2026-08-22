import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { db } from '@/db/client'
import { payroll, users, profiles } from '@/db/schema'
import { eq, desc } from 'drizzle-orm'
import { DollarSign } from 'lucide-react'
import PayrollEditForm from './payroll-edit-form'

export default async function AdminPayrollPage() {
  const session = await auth()
  if (session?.user.role !== 'admin') redirect('/dashboard')

  const allEmployees = await db
    .select({
      id: users.id,
      employeeId: users.employeeId,
      firstName: profiles.firstName,
      lastName: profiles.lastName
    })
    .from(users)
    .leftJoin(profiles, eq(users.id, profiles.userId))

  const allPayroll = await db
    .select()
    .from(payroll)
    .orderBy(desc(payroll.createdAt))

  const payrollMap = new Map<string, typeof allPayroll[0]>()
  for (const p of allPayroll) {
    if (!payrollMap.has(p.userId)) payrollMap.set(p.userId, p)
  }

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
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {allEmployees.map(emp => {
              const p = payrollMap.get(emp.id)
              const name = emp.firstName && emp.lastName ? `${emp.firstName} ${emp.lastName}` : emp.employeeId
              return (
                <tr key={emp.id}>
                  <td className="px-4 py-3">
                    <p>{name}</p>
                    <p className="text-xs text-gray-400 font-mono">{emp.employeeId}</p>
                  </td>
                  <td className="px-4 py-3">{p ? `₹${p.basicSalary.toLocaleString()}` : '—'}</td>
                  <td className="px-4 py-3">{p ? `₹${(p.hra ?? 0).toLocaleString()}` : '—'}</td>
                  <td className="px-4 py-3">{p ? `₹${(p.allowances ?? 0).toLocaleString()}` : '—'}</td>
                  <td className="px-4 py-3 text-red-600">{p ? `₹${(p.deductions ?? 0).toLocaleString()}` : '—'}</td>
                  <td className="px-4 py-3 font-semibold text-green-600">{p ? `₹${p.netSalary.toLocaleString()}` : '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{p?.effectiveFrom ?? '—'}</td>
                  <td className="px-4 py-3">
                    <PayrollEditForm userId={emp.id} employeeName={name ?? emp.employeeId} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {allEmployees.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-8">No employees found</p>
        )}
      </div>
    </div>
  )
}
