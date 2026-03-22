/**
 * Unified API data access layer interfaces.
 * Backend-agnostic contracts for employee and attendance operations.
 * Implementations can be mock (in-memory) or sqlite (future).
 */

import type {
  Employee,
  CreateEmployee,
  Attendance,
  CreateAttendance,
} from '@/lib/schemas'

export interface EmployeeApi {
  getAll(): readonly Employee[]
  getActive(): readonly Employee[]
  getById(id: string): Employee | undefined
  add(data: CreateEmployee): Employee
  update(id: string, data: Partial<CreateEmployee>): Employee | undefined
  remove(id: string): boolean
}

export interface AttendanceApi {
  getAll(): readonly Attendance[]
  getById(id: string): Attendance | undefined
  getByDate(date: string): readonly Attendance[]
  getByMonth(year: number, month: number): readonly Attendance[]
  getByEmployeeId(employeeId: string): readonly Attendance[]
  getByEmployeeAndDate(
    employeeId: string,
    date: string,
  ): readonly Attendance[]
  add(data: CreateAttendance): Attendance
  update(
    id: string,
    data: Partial<Pick<Attendance, 'clockIn' | 'clockOut' | 'type'>>,
  ): Attendance | undefined
  remove(id: string): boolean
}

export interface ApiProvider {
  readonly employees: EmployeeApi
  readonly attendances: AttendanceApi
}
