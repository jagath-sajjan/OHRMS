import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/sidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect('/sign-in')

  return (
    <div className="flex min-h-screen">
      <Sidebar role={session.user.role} />
      <main className="flex-1 p-8 overflow-auto">
        {children}
      </main>
    </div>
  )
}
