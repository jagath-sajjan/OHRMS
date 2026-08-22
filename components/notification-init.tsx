'use client'

import { useEffect } from 'react'

// Requests desktop notification permission once on mount.
// Exposes window.__notify(title, body) for use anywhere client-side.
export default function NotificationInit() {
  useEffect(() => {
    if (!('Notification' in window)) return

    if (Notification.permission === 'default') {
      Notification.requestPermission()
    }

    ;(window as any).__notify = (title: string, body?: string) => {
      if (Notification.permission !== 'granted') return
      const n = new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: title // collapse duplicates
      })
      n.onclick = () => { window.focus(); n.close() }
    }
  }, [])

  return null
}

// Utility to fire a desktop notification from any client component
export function desktopNotify(title: string, body?: string) {
  if (typeof window !== 'undefined' && typeof (window as any).__notify === 'function') {
    ;(window as any).__notify(title, body)
  }
}
