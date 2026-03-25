/**
 * Mock repository implementations for testing.
 * Provides in-memory CRUD backed by seed data arrays,
 * with the same async method signatures as real SQLite repositories.
 */

import { nanoid } from 'nanoid'
import dayjs from 'dayjs'
import { DEFAULT_EMPLOYEES } from '@/lib/default-data'
import type { Employee, CreateEmployee, Attendance, CreateAttendance } from '@/lib/schemas'
import type {
  StatisticsRepository,
  ProductKpis,
  DateRange,
} from '@/lib/repositories/statistics-repository'

// ─── Test attendance patterns ──────────────────────────────────────────────

/**
 * Build sample attendance records for today (based on current Date.now()).
 * Used by tests that rely on attendance state (clocked-in, vacation, etc.).
 * Returns a new array on each call (immutable).
 */
function buildTestAttendances(): readonly Attendance[] {
  const today = dayjs().format('YYYY-MM-DD')
  const base = dayjs(today)
  return [
    // Alex: clocked in at 08:00, clocked out at 17:00
    {
      id: 'att-001',
      employeeId: 'emp-001',
      date: today,
      clockIn: base.hour(8).minute(0).valueOf(),
      clockOut: base.hour(17).minute(0).valueOf(),
      type: 'regular' as const,
    },
    // Mia: clocked in at 09:00, still working
    {
      id: 'att-002',
      employeeId: 'emp-002',
      date: today,
      clockIn: base.hour(9).minute(0).valueOf(),
      type: 'regular' as const,
    },
    // David: on paid leave
    {
      id: 'att-003',
      employeeId: 'emp-003',
      date: today,
      clockIn: base.hour(8).minute(0).valueOf(),
      type: 'paid_leave' as const,
    },
    // Jason: clocked in at 10:00, clocked out at 14:30
    {
      id: 'att-004',
      employeeId: 'emp-006',
      date: today,
      clockIn: base.hour(10).minute(0).valueOf(),
      clockOut: base.hour(14).minute(30).valueOf(),
      type: 'regular' as const,
    },
  ]
}

// ─── In-memory state ───────────────────────────────────────────────────────

let employees: Employee[] = []
let attendances: Attendance[] = []

function resetState(): void {
  employees = DEFAULT_EMPLOYEES.map(e => ({ ...e }))
  attendances = [...buildTestAttendances()]
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

// ─── Mock Statistics Repository ────────────────────────────────────────────

const ZERO_PRODUCT_KPIS: ProductKpis = {
  totalRevenue: 0,
  orderCount: 0,
  morningRevenue: 0,
  afternoonRevenue: 0,
  totalQuantity: 0,
  bentoQuantity: 0,
}

export const mockStatisticsRepo: StatisticsRepository = {
  async getProductKpis(_range: DateRange): Promise<ProductKpis> {
    return { ...ZERO_PRODUCT_KPIS }
  },
  async getHourlyOrderDistribution(_range: DateRange) {
    return []
  },
  async getTopProducts(_range: DateRange, _limit: number, _orderBy: 'quantity' | 'revenue') {
    return []
  },
  async getBottomBentos(_range: DateRange, _limit: number) {
    return []
  },
  async getDailyRevenue(_range: DateRange) {
    return []
  },
  async getAvgOrderValue(_range: DateRange) {
    return []
  },
  async getStaffKpis(_range: DateRange) {
    return {
      activeEmployeeCount: 0,
      totalAttendanceDays: 0,
      avgMonthlyHours: 0,
      leaveCount: 0,
    }
  },
  async getEmployeeHours(_range: DateRange) {
    return []
  },
  async getDailyHeadcount(_range: DateRange) {
    return []
  },
  async getDailyAttendeeList(_date: string) {
    return []
  },
}

// ─── Provider mock functions ───────────────────────────────────────────────

export function getEmployeeRepo() {
  return mockEmployeeRepo
}

export function getAttendanceRepo() {
  return mockAttendanceRepo
}

export function getStatisticsRepo() {
  return mockStatisticsRepo
}
