'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  LayoutDashboard, User, Clock, CalendarDays,
  DollarSign, Users, LogOut, Building2, BarChart2,
  Menu, X, ChevronRight
} from 'lucide-react'

const employeeLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/profile', label: 'Profile', icon: User },
  { href: '/attendance', label: 'Attendance', icon: Clock },
  { href: '/leaves', label: 'Leaves', icon: CalendarDays },
  { href: '/payroll', label: 'Payroll', icon: DollarSign },
  { href: '/analytics', label: 'Analytics', icon: BarChart2 },
]

const adminLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/employees', label: 'Employees', icon: Users },
  { href: '/admin/attendance', label: 'Attendance', icon: Clock },
  { href: '/admin/leaves', label: 'Leaves', icon: CalendarDays },
  { href: '/admin/payroll', label: 'Payroll', icon: DollarSign },
  { href: '/analytics', label: 'Analytics', icon: BarChart2 },
]

interface SidebarProps {
  role: string
  userName?: string
  employeeId?: string
}

const NAVY = '#1e3a5f'
const NAVY_DARK = '#152b47'

export default function Sidebar({ role, userName, employeeId }: SidebarProps) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const links = role === 'admin' ? adminLinks : employeeLinks

  useEffect(() => { setOpen(false) }, [pathname])

  // Close on Escape
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', fn)
    return () => document.removeEventListener('keydown', fn)
  }, [])

  function isActive(href: string) {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  const NavContent = () => (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Brand */}
      <div className="flex items-center gap-3 px-4 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#0d9488' }}>
          <Building2 size={15} color="#fff" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-white text-sm tracking-tight">OHRMS</p>
          <p className="text-xs capitalize" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {role === 'admin' ? 'Admin Portal' : 'Employee Portal'}
          </p>
        </div>
        <button
          onClick={() => setOpen(false)}
          className="lg:hidden p-1 rounded-md transition-colors"
          style={{ color: 'rgba(255,255,255,0.5)' }}
          onMouseOver={e => (e.currentTarget.style.color = '#fff')}
          onMouseOut={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
        >
          <X size={17} />
        </button>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-2 py-3 overflow-y-auto" style={{ gap: 2 }}>
        <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.25)' }}>
          Menu
        </p>
        {links.map(({ href, label, icon: Icon }) => {
          const active = isActive(href)
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 text-sm transition-all duration-150"
              style={{
                color: active ? '#fff' : 'rgba(255,255,255,0.55)',
                background: active ? 'rgba(255,255,255,0.1)' : 'transparent',
                fontWeight: active ? 600 : 400,
              }}
              onMouseOver={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; if (!active) e.currentTarget.style.color = 'rgba(255,255,255,0.85)' }}
              onMouseOut={e => { if (!active) e.currentTarget.style.background = 'transparent'; if (!active) e.currentTarget.style.color = 'rgba(255,255,255,0.55)' }}
            >
              <Icon size={16} style={{ color: active ? '#2dd4bf' : 'rgba(255,255,255,0.35)', flexShrink: 0 }} />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight size={13} style={{ color: '#2dd4bf' }} />}
            </Link>
          )
        })}
      </nav>

      {/* User Footer */}
      <div className="px-2 py-3" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        {userName && (
          <div className="px-3 py-2 mb-1">
            <p className="text-sm font-medium text-white truncate">{userName}</p>
            <p className="text-xs font-mono" style={{ color: 'rgba(255,255,255,0.35)' }}>{employeeId}</p>
          </div>
        )}
        <button
          onClick={() => signOut({ callbackUrl: '/sign-in' })}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm transition-all duration-150"
          style={{ color: 'rgba(255,255,255,0.5)' }}
          onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#fff' }}
          onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)' }}
        >
          <LogOut size={15} />
          Sign out
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Hamburger */}
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden fixed top-3.5 left-4 z-40 p-2 rounded-lg shadow-lg transition-transform active:scale-95"
        style={{ background: NAVY, color: '#fff' }}
        aria-label="Open menu"
      >
        <Menu size={19} />
      </button>

      {/* Mobile Backdrop */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-40"
          style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(2px)' }}
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className="lg:hidden fixed left-0 top-0 bottom-0 z-50 w-64 flex flex-col"
        style={{
          background: NAVY,
          transform: open ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.28s cubic-bezier(0.4,0,0.2,1)',
          boxShadow: open ? '4px 0 24px rgba(0,0,0,0.25)' : 'none',
        }}
      >
        <NavContent />
      </aside>

      {/* Desktop Sidebar */}
      <aside
        className="hidden lg:flex flex-col w-60 min-h-screen flex-shrink-0"
        style={{ background: NAVY }}
      >
        <NavContent />
      </aside>
    </>
  )
}
