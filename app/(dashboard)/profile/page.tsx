import { auth } from '@/auth'
import { db } from '@/db/client'
import { profiles, users } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { User, Briefcase, Mail, Phone, MapPin, Calendar } from 'lucide-react'

export default async function ProfilePage() {
  const session = await auth()
  if (!session) return null

  const [user] = await db.select().from(users).where(eq(users.id, session.user.id))
  const profile = await db.select().from(profiles).where(eq(profiles.userId, session.user.id)).get()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <User size={20} />
        <h1 className="text-2xl font-semibold">Profile</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-3">
            <User size={36} className="text-blue-600" />
          </div>
          <p className="font-semibold text-lg">
            {profile ? `${profile.firstName} ${profile.lastName}` : 'N/A'}
          </p>
          <p className="text-sm text-gray-500 capitalize">{session.user.role}</p>
          <p className="text-xs text-gray-400 font-mono mt-1">{session.user.employeeId}</p>
        </div>

        <div className="card lg:col-span-2 space-y-4">
          <h2 className="font-medium border-b pb-2">Personal Information</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Mail size={14} className="text-gray-400" />
              <div>
                <p className="text-gray-400">Email</p>
                <p>{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Phone size={14} className="text-gray-400" />
              <div>
                <p className="text-gray-400">Phone</p>
                <p>{profile?.phone ?? 'Not set'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-gray-400" />
              <div>
                <p className="text-gray-400">Address</p>
                <p>{profile?.address ?? 'Not set'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-gray-400" />
              <div>
                <p className="text-gray-400">Date of Birth</p>
                <p>{profile?.dateOfBirth ?? 'Not set'}</p>
              </div>
            </div>
          </div>

          <h2 className="font-medium border-b pb-2 mt-4">Job Information</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Briefcase size={14} className="text-gray-400" />
              <div>
                <p className="text-gray-400">Department</p>
                <p>{profile?.department ?? 'Not set'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Briefcase size={14} className="text-gray-400" />
              <div>
                <p className="text-gray-400">Designation</p>
                <p>{profile?.designation ?? 'Not set'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-gray-400" />
              <div>
                <p className="text-gray-400">Joining Date</p>
                <p>{profile?.joiningDate ?? 'Not set'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
