'use client'

import { useState } from 'react'
import { List, CalendarDays } from 'lucide-react'
import type { Attendance } from '@/db/schema'

interface Props {
  records: Attendance[]
}

function getWeekDates(): string[] {
  const now = new Date()
  const day = now.getDay()
  const diffToMon = day === 0 ? -6 : 1 - day
  const monday = new Date(now)
  monday.setDate(now.getDate() + diffToMon)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d.toISOString().split('T')[0]
  })
}

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const statusColor = (status: string) =>
  status === 'present' ? 'text-green-600' :
  status === 'absent' ? 'text-red-500' :
  status === 'half-day' ? 'text-yellow-600' : 'text-blue-600'

export default function AttendanceView({ records }: Props) {
  const [view, setView] = useState<'list' | 'week'>('list')
  const weekDates = getWeekDates()
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          onClick={() => setView('list')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
            view === 'list' ? 'bg-blue-600 text-white' : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
          }`}
        >
          <List size={14} />
          List
        </button>
        <button
          onClick={() => setView('week')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
            view === 'week' ? 'bg-blue-600 text-white' : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
          }`}
        >
          <CalendarDays size={14} />
          Week
        </button>
      </div>

      {view === 'week' ? (
        <div className="card">
          <p className="text-sm font-medium mb-4">Current Week</p>
          <div className="grid grid-cols-7 gap-2">
            {weekDates.map((date, i) => {
              const record = records.find(r => r.date === date)
              const isToday = date === today
              return (
                <div
                  key={date}
                  className={`rounded-lg p-2 text-center border ${
                    isToday ? 'border-blue-300 bg-blue-50' : 'border-gray-100 bg-gray-50'
                  }`}
                >
                  <p className="text-xs text-gray-500">{DAY_NAMES[i]}</p>
                  <p className="text-sm font-semibold">{date.split('-')[2]}</p>
                  <div className="mt-2">
                    {record ? (
                      <span className={`text-xs font-medium capitalize ${statusColor(record.status)}`}>
                        {record.status}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-300">—</span>
                    )}
                  </div>
                  {record?.checkIn && (
                    <p className="text-xs text-gray-400 mt-1">{record.checkIn}</p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Check In</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Check Out</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {records.map(r => (
                <tr key={r.id}>
                  <td className="px-4 py-3">{r.date}</td>
                  <td className="px-4 py-3">{r.checkIn ?? '—'}</td>
                  <td className="px-4 py-3">{r.checkOut ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`capitalize font-medium ${statusColor(r.status)}`}>{r.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {records.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-8">No records yet</p>
          )}
        </div>
      )}
    </div>
  )
}
