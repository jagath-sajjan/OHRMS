import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { db } from '@/db/client'
import { payroll, users, profiles } from '@/db/schema'
import { eq, desc } from 'drizzle-orm'
import { DollarSign, FileText } from 'lucide-react'
import Link from 'next/link'

export default async function PayrollPage() {
  const session = await auth()
  if (!session) redirect('/sign-in')

  const records = await db
    .select()
    .from(payroll)
    .where(eq(payroll.userId, session.user.id))
    .orderBy(desc(payroll.createdAt))

  const latest = records[0]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DollarSign size={20} />
          <h1 className="text-2xl font-semibold">Payroll</h1>
        </div>
        {latest && (
          <Link
            href="/payroll/slip"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
          >
            <FileText size={14} />
            Download Salary Slip
          </Link>
        )}
      </div>

      {latest ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {([
            { label: 'Basic Salary', value: latest.basicSalary },
            { label: 'HRA', value: latest.hra ?? 0 },
            { label: 'Allowances', value: latest.allowances ?? 0 },
            { label: 'Deductions', value: -(latest.deductions ?? 0) }
          ] as { label: string; value: number }[]).map(({ label, value }) => (
            <div key={label} className="card">
              <p className="text-sm text-gray-500">{label}</p>
              <p className={`text-xl font-semibold mt-1 ${value < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                ₹{Math.abs(value).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="card">
          <p className="text-sm text-gray-400">No payroll records found</p>
        </div>
      )}

      {latest && (
        <div className="card max-w-xs">
          <p className="text-sm text-gray-500">Net Salary</p>
          <p className="text-3xl font-bold text-green-600 mt-1">₹{latest.netSalary.toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-1">Effective from: {latest.effectiveFrom}</p>
        </div>
      )}
    </div>
  )
}
