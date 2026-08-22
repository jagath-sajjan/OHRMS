import type { Deduction, Payroll, User, Profile } from '@/db/schema'
import { Building2 } from 'lucide-react'
import DownloadSlipButton from './download-slip-button'

interface Props {
  user: Pick<User, 'employeeId'>
  profile: Profile | null
  latestPayroll: Payroll
  backHref?: string
}

export default function SalarySlip({ user, profile, latestPayroll, backHref }: Props) {
  let deductions: Deduction[] = []
  try {
    if (latestPayroll.deductionsJson) deductions = JSON.parse(latestPayroll.deductionsJson)
  } catch {}

  const name = profile ? `${profile.firstName} ${profile.lastName}` : user.employeeId
  const hra = latestPayroll.hra ?? 0
  const allowances = latestPayroll.allowances ?? 0
  const netSalary = latestPayroll.netSalary
  const today = new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long' })

  return (
    <div className="max-w-2xl mx-auto p-8">
      <div className="flex items-center justify-between mb-8 print:hidden">
        {backHref && (
          <a href={backHref} className="text-sm text-gray-500 hover:underline">← Back</a>
        )}
        <h1 className="text-xl font-semibold">Salary Slip</h1>
        <DownloadSlipButton name={name} />
      </div>

      <div id="salary-slip" className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-blue-600 text-white px-6 py-4 flex items-center gap-3">
          <Building2 size={24} />
          <div>
            <p className="font-bold text-lg">OHRMS</p>
            <p className="text-blue-200 text-sm">Open Human Resource Management System</p>
          </div>
        </div>

        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Employee Name</p>
              <p className="font-medium">{name}</p>
            </div>
            <div>
              <p className="text-gray-500">Employee ID</p>
              <p className="font-medium font-mono">{user.employeeId}</p>
            </div>
            <div>
              <p className="text-gray-500">Designation</p>
              <p className="font-medium">{profile?.designation ?? '—'}</p>
            </div>
            <div>
              <p className="text-gray-500">Department</p>
              <p className="font-medium">{profile?.department ?? '—'}</p>
            </div>
            <div>
              <p className="text-gray-500">Pay Period</p>
              <p className="font-medium">{today}</p>
            </div>
            <div>
              <p className="text-gray-500">Effective From</p>
              <p className="font-medium">{latestPayroll.effectiveFrom}</p>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 grid grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-sm mb-3 border-b pb-2">Earnings</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Basic Salary</span>
                <span>₹{latestPayroll.basicSalary.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">HRA ({latestPayroll.hraPercentage ?? 24}%)</span>
                <span>₹{hra.toLocaleString()}</span>
              </div>
              {allowances > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Allowances</span>
                  <span>₹{allowances.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between font-medium border-t pt-2 mt-2">
                <span>Gross Earnings</span>
                <span>₹{(latestPayroll.basicSalary + hra + allowances).toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-medium text-sm mb-3 border-b pb-2">Deductions</h3>
            <div className="space-y-2 text-sm">
              {deductions.length === 0 ? (
                <p className="text-gray-400">No deductions</p>
              ) : (
                deductions.map(d => (
                  <div key={d.id} className="flex justify-between">
                    <span className="text-gray-600">{d.title}{d.type === 'percentage' ? ` (${d.amount}%)` : ''}</span>
                    <span className="text-red-600">
                      ₹{(d.type === 'percentage' ? latestPayroll.basicSalary * d.amount / 100 : d.amount).toLocaleString()}
                    </span>
                  </div>
                ))
              )}
              <div className="flex justify-between font-medium border-t pt-2 mt-2">
                <span>Total Deductions</span>
                <span className="text-red-600">₹{(latestPayroll.deductions ?? 0).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-green-50 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-lg">Net Salary</span>
            <span className="font-bold text-2xl text-green-700">₹{netSalary.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
