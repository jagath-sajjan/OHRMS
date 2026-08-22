import type { Metadata } from 'next'
import './globals.css'
import { ToastProvider } from '@/components/toast'
import NotificationInit from '@/components/notification-init'

export const metadata: Metadata = {
  title: 'OHRMS',
  description: 'Open Human Resource Management System'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 antialiased">
        <ToastProvider>
          <NotificationInit />
          {children}
        </ToastProvider>
      </body>
    </html>
  )
}
