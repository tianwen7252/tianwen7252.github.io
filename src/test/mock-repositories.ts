/**
 * Mock repository implementations for testing.
 * Provides in-memory CRUD backed by seed data arrays,
 * with the same method signatures as real SQLite repositories.
 */

import { nanoid } from 'nanoid'
import { SEED_EMPLOYEES, buildSeedAttendances } from '@/lib/seed-data'
import type { Employee, CreateEmployee, Attendance, CreateAttendance } from '@/lib/schemas'

// ─── In-memory state ───────────────────────────────────────────────────────

let employees: Employee[] = []
let attendances: Attendance[] = []

function resetState(): void {
  employees = SEED_EMPLOYEES.map(e => ({ ...e }))
  attendances = [...buildSeedAttendances()]
}

// Initialize on load
resetState()

// ─── Mock Employee Repository ──────────────────────────────────────────────

export const mockEmployeeRepo = {
  findAll(): Employee[] {
    return [...employees]
  },

  findById(id: string): Employee | undefined {
    return employees.find(e => e.id === id)
  },

  findByStatus(status: 'active' | 'inactive'): Employee[] {
    return employees.filter(e => e.status === status)
  },

  findByEmployeeNo(employeeNo: string): Employee | undefined {
    return employees.find(e => e.employeeNo === employeeNo)
  },

  create(data: CreateEmployee): Employee {
    const now = Date.now()
    const newEmployee: Employee = {
      ...data,
      id: nanoid(),
      createdAt: now,
      updatedAt: now,
    }
    employees = [...employees, newEmployee]
    return newEmployee
  },

  update(id: string, data: Partial<CreateEmployee>): Employee | undefined {
    const index = employees.findIndex(e => e.id === id)
    if (index === -1) return undefined

    const updated: Employee = {
      ...employees[index]!,
      ...data,
      updatedAt: Date.now(),
    }
    employees = employees.map((e, i) => (i === index ? updated : e))
    return updated
  },

  remove(id: string): boolean {
    const before = employees.length
    employees = employees.filter(e => e.id !== id)
    return employees.length < before
  },
}

// ─── Mock Attendance Repository ────────────────────────────────────────────

export const mockAttendanceRepo = {
  findAll(): Attendance[] {
    return [...attendances]
  },

  findById(id: string): Attendance | undefined {
    return attendances.find(a => a.id === id)
  },

  findByEmployeeId(employeeId: string): Attendance[] {
    return attendances.filter(a => a.employeeId === employeeId)
  },

  findByDate(date: string): Attendance[] {
    return attendances.filter(a => a.date === date)
  },

  findByEmployeeAndDate(employeeId: string, date: string): Attendance | undefined {
    return attendances.find(a => a.employeeId === employeeId && a.date === date)
  },

  findByMonth(year: number, month: number): Attendance[] {
    const prefix = `${year}-${String(month).padStart(2, '0')}`
    return attendances.filter(a => a.date.startsWith(prefix))
  },

  create(data: CreateAttendance): Attendance {
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
}

// ─── Reset helper for tests ────────────────────────────────────────────────

export function resetMockRepositories(): void {
  resetState()
}

// ─── Provider mock functions ───────────────────────────────────────────────

export function getEmployeeRepo() {
  return mockEmployeeRepo
}

export function getAttendanceRepo() {
  return mockAttendanceRepo
}
