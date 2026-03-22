/**
 * Mock repository implementations for testing.
 * Provides in-memory CRUD backed by seed data arrays,
 * with the same async method signatures as real SQLite repositories.
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
  async findAll(): Promise<Employee[]> {
    return [...employees]
  },

  async findById(id: string): Promise<Employee | undefined> {
    return employees.find(e => e.id === id)
  },

  async findByStatus(status: 'active' | 'inactive'): Promise<Employee[]> {
    return employees.filter(e => e.status === status)
  },

  async findByEmployeeNo(employeeNo: string): Promise<Employee | undefined> {
    return employees.find(e => e.employeeNo === employeeNo)
  },

  async create(data: CreateEmployee): Promise<Employee> {
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

  async update(id: string, data: Partial<CreateEmployee>): Promise<Employee | undefined> {
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

  async remove(id: string): Promise<boolean> {
    const before = employees.length
    employees = employees.filter(e => e.id !== id)
    return employees.length < before
  },
}

// ─── Mock Attendance Repository ────────────────────────────────────────────

export const mockAttendanceRepo = {
  async findAll(): Promise<Attendance[]> {
    return [...attendances]
  },

  async findById(id: string): Promise<Attendance | undefined> {
    return attendances.find(a => a.id === id)
  },

  async findByEmployeeId(employeeId: string): Promise<Attendance[]> {
    return attendances.filter(a => a.employeeId === employeeId)
  },

  async findByDate(date: string): Promise<Attendance[]> {
    return attendances.filter(a => a.date === date)
  },

  async findByEmployeeAndDate(employeeId: string, date: string): Promise<Attendance | undefined> {
    return attendances.find(a => a.employeeId === employeeId && a.date === date)
  },

  async findByMonth(year: number, month: number): Promise<Attendance[]> {
    const prefix = `${year}-${String(month).padStart(2, '0')}`
    return attendances.filter(a => a.date.startsWith(prefix))
  },

  async create(data: CreateAttendance): Promise<Attendance> {
    const newAttendance: Attendance = {
      ...data,
      id: nanoid(),
    }
    attendances = [...attendances, newAttendance]
    return newAttendance
  },

  async update(
    id: string,
    data: Partial<Pick<Attendance, 'clockIn' | 'clockOut' | 'type'>>,
  ): Promise<Attendance | undefined> {
    const index = attendances.findIndex(a => a.id === id)
    if (index === -1) return undefined

    const updated: Attendance = {
      ...attendances[index]!,
      ...data,
    }
    attendances = attendances.map((a, i) => (i === index ? updated : a))
    return updated
  },

  async remove(id: string): Promise<boolean> {
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
