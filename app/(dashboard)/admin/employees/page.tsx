import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { db } from '@/db/client'
import { users, profiles } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { Users } from 'lucide-react'

export default async function AdminEmployeesPage() {
  const session = await auth()
  if (session?.user.role !== 'admin') redirect('/dashboard')

  const employees = await db
    .select({
      id: users.id,
      employeeId: users.employeeId,
      email: users.email,
      role: users.role,
      firstName: profiles.firstName,
      lastName: profiles.lastName,
      department: profiles.department,
      designation: profiles.designation
    })
    .from(users)
    .leftJoin(profiles, eq(users.id, profiles.userId))

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Users size={20} />
        <h1 className="text-2xl font-semibold">Employees</h1>
      </div>

      <div className="card overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Employee ID</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Department</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {employees.map(emp => (
              <tr key={emp.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono">{emp.employeeId}</td>
                <td className="px-4 py-3">{emp.firstName && emp.lastName ? `${emp.firstName} ${emp.lastName}` : '-'}</td>
                <td className="px-4 py-3 text-gray-500">{emp.email}</td>
                <td className="px-4 py-3">{emp.department ?? '-'}</td>
                <td className="px-4 py-3 capitalize">{emp.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {employees.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-8">No employees found</p>
        )}
      </div>
    </div>
  )
}
