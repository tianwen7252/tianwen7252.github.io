/**
 * Mock attendance data service for development.
 * Provides in-memory CRUD operations with sample data.
 * All mutations return new arrays/objects (immutable pattern).
 */

import dayjs from 'dayjs'
import { nanoid } from 'nanoid'
import type { Attendance, CreateAttendance } from '@/lib/schemas'

// Build sample attendance records for today
function buildInitialAttendances(): Attendance[] {
  const today = dayjs().format('YYYY-MM-DD')
  const baseTime = dayjs(today)

  return [
    // emp-001: clocked in at 08:00, clocked out at 17:00 (full day)
    {
      id: 'att-001',
      employeeId: 'emp-001',
      date: today,
      clockIn: baseTime.hour(8).minute(0).valueOf(),
      clockOut: baseTime.hour(17).minute(0).valueOf(),
      type: 'regular',
    },
    // emp-002: clocked in at 09:00, still working
    {
      id: 'att-002',
      employeeId: 'emp-002',
      date: today,
      clockIn: baseTime.hour(9).minute(0).valueOf(),
      type: 'regular',
    },
    // emp-003: on paid leave
    {
      id: 'att-003',
      employeeId: 'emp-003',
      date: today,
      clockIn: baseTime.hour(8).minute(0).valueOf(),
      type: 'paid_leave',
    },
    // emp-004: no record for today (not clocked in yet)
    // emp-006: clocked in at 10:00, clocked out at 14:30 (half day)
    {
      id: 'att-004',
      employeeId: 'emp-006',
      date: today,
      clockIn: baseTime.hour(10).minute(0).valueOf(),
      clockOut: baseTime.hour(14).minute(30).valueOf(),
      type: 'regular',
    },
  ]
}

// In-memory state
let attendances: Attendance[] = buildInitialAttendances()

export const mockAttendanceService = {
  getAll(): readonly Attendance[] {
    return [...attendances]
  },

  getById(id: string): Attendance | undefined {
    return attendances.find(a => a.id === id)
  },

  getByDate(date: string): readonly Attendance[] {
    return attendances.filter(a => a.date === date)
  },

  getByMonth(year: number, month: number): readonly Attendance[] {
    const prefix = `${year}-${String(month).padStart(2, '0')}`
    return attendances.filter(a => a.date.startsWith(prefix))
  },

  getByEmployeeId(employeeId: string): readonly Attendance[] {
    return attendances.filter(a => a.employeeId === employeeId)
  },

  getByEmployeeAndDate(
    employeeId: string,
    date: string,
  ): readonly Attendance[] {
    return attendances.filter(
      a => a.employeeId === employeeId && a.date === date,
    )
  },

  add(data: CreateAttendance): Attendance {
    const newAttendance: Attendance = {
      ...data,
      id: nanoid(),
    }
    attendances = [...attendances, newAttendance]
    return newAttendance
  },

  update(
    id: string,
    data: Partial<Pick<Attendance, 'clockIn' | 'clockOut' | 'type'>>,
  ): Attendance | undefined {
    const index = attendances.findIndex(a => a.id === id)
    if (index === -1) return undefined

    const updated: Attendance = {
      ...attendances[index]!,
      ...data,
    }
    attendances = attendances.map((a, i) => (i === index ? updated : a))
    return updated
  },

  remove(id: string): boolean {
    const before = attendances.length
    attendances = attendances.filter(a => a.id !== id)
    return attendances.length < before
  },

  /** Reset to initial sample data (useful for testing) */
  reset(): void {
    attendances = buildInitialAttendances()
  },
}
