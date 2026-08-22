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
    <div className="max-w-3xl mx-auto p-4 sm:p-8">
      <div className="flex items-center justify-between mb-8 print:hidden">
        {backHref && (
          <a href={backHref} className="text-sm text-gray-500 hover:text-gray-900 transition-colors">← Back to Payroll</a>
        )}
        <h1 className="text-xl font-bold tracking-tight text-gray-900">Salary Slip</h1>
        <DownloadSlipButton name={name} />
      </div>

      <div id="salary-slip" className="bg-white border border-gray-300 rounded-xl shadow-sm overflow-hidden print:border-none print:shadow-none">
        {/* Header */}
        <div className="bg-[#1e3a5f] text-white p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-4 border-[#0d9488]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-lg">
              <Building2 size={28} className="text-[#2dd4bf]" />
            </div>
            <div>
              <h2 className="font-extrabold text-xl tracking-tight">OHRMS</h2>
              <p className="text-white/70 text-xs uppercase tracking-wider font-semibold">Open HR Management System</p>
            </div>
          </div>
          <div className="sm:text-right">
            <p className="text-xs uppercase tracking-widest text-[#2dd4bf] font-bold">Official Salary Slip</p>
            <p className="text-sm font-medium text-white/90">{today}</p>
          </div>
        </div>

        {/* Employee Info Block */}
        <div className="bg-gray-50 border-b border-gray-200 px-6 sm:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-sm">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Employee Name</p>
              <p className="font-bold text-gray-800 mt-0.5">{name}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Employee ID</p>
              <p className="font-mono font-bold text-gray-800 mt-0.5">{user.employeeId}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Designation</p>
              <p className="font-medium text-gray-800 mt-0.5">{profile?.designation ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Department</p>
              <p className="font-medium text-gray-800 mt-0.5">{profile?.department ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Effective From</p>
              <p className="font-medium text-gray-800 mt-0.5">{latestPayroll.effectiveFrom}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Pay Frequency</p>
              <p className="font-medium text-gray-800 mt-0.5">Monthly</p>
            </div>
          </div>
        </div>

        {/* Earnings & Deductions Tables */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200">
          {/* Earnings */}
          <div className="p-6 sm:p-8">
            <h3 className="text-xs font-bold text-[#1e3a5f] uppercase tracking-wider mb-4 border-b border-gray-200 pb-2">Earnings</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center py-0.5">
                <span className="text-gray-600 font-medium">Basic Salary</span>
                <span className="font-semibold text-gray-900">₹{latestPayroll.basicSalary.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span className="text-gray-600 font-medium">HRA ({latestPayroll.hraPercentage ?? 24}%)</span>
                <span className="font-semibold text-gray-900">₹{hra.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              {allowances > 0 && (
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-gray-600 font-medium">Allowances</span>
                  <span className="font-semibold text-gray-900">₹{allowances.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              )}
              <div className="border-t border-dashed border-gray-200 pt-3 mt-4 flex justify-between items-center font-bold text-gray-800">
                <span>Gross Earnings</span>
                <span>₹{(latestPayroll.basicSalary + hra + allowances).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          {/* Deductions */}
          <div className="p-6 sm:p-8">
            <h3 className="text-xs font-bold text-[#1e3a5f] uppercase tracking-wider mb-4 border-b border-gray-200 pb-2">Deductions</h3>
            <div className="space-y-3 text-sm">
              {deductions.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <p className="text-gray-400 text-xs italic">No deductions applied</p>
                </div>
              ) : (
                deductions.map(d => (
                  <div key={d.id} className="flex justify-between items-center py-0.5">
                    <span className="text-gray-600 font-medium">{d.title || 'Other Deduction'}{d.type === 'percentage' ? ` (${d.amount}%)` : ''}</span>
                    <span className="font-semibold text-red-600">
                      - ₹{(d.type === 'percentage' ? latestPayroll.basicSalary * d.amount / 100 : d.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))
              )}
              <div className="border-t border-dashed border-gray-200 pt-3 mt-4 flex justify-between items-center font-bold text-gray-800">
                <span>Total Deductions</span>
                <span className="text-red-600">₹{(latestPayroll.deductions ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Net Salary Banner */}
        <div className="bg-[#ecfdf5] border-t border-gray-200 px-6 sm:px-8 py-6 flex flex-row items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-[#065f46] font-bold">Net Payable Salary</p>
            <p className="text-xs text-gray-500 mt-0.5">Rounded and disbursed to bank account</p>
          </div>
          <div className="text-right">
            <span className="font-extrabold text-2xl sm:text-3xl text-[#065f46]">₹{netSalary.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>

      {/* Print instructions or signature block */}
      <div className="mt-8 flex justify-between text-xs text-gray-400 px-4">
        <p>This is a computer-generated slip and requires no physical signature.</p>
        <p>© OHRMS, {new Date().getFullYear()}</p>
      </div>
    </div>
  )
}
