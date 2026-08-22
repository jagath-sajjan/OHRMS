import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { db } from '@/db/client'
import { profiles } from '@/db/schema'
import { eq } from 'drizzle-orm'
import Sidebar from '@/components/sidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect('/sign-in')

  const profile = await db.select().from(profiles).where(eq(profiles.userId, session.user.id)).get()
  const userName = profile ? `${profile.firstName} ${profile.lastName}` : session.user.email

  return (
    <div className="flex min-h-screen">
      <Sidebar
        role={session.user.role}
        userName={userName ?? undefined}
        employeeId={session.user.employeeId}
      />
      <main className="flex-1 min-w-0 flex flex-col">
        {/* Mobile top spacing for hamburger */}
        <div className="lg:hidden h-14 flex-shrink-0" />
        <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto page-fade">
          {children}
        </div>
      </main>
    </div>
  )
}
