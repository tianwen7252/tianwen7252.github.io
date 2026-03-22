/**
 * Repository provider — singleton access to repository instances.
 * Call initRepositories(db) once at app startup, then use
 * getEmployeeRepo() / getAttendanceRepo() anywhere.
 */

import type { AsyncDatabase } from '@/lib/worker-database'
import {
  createEmployeeRepository,
  type EmployeeRepository,
} from './employee-repository'
import {
  createAttendanceRepository,
  type AttendanceRepository,
} from './attendance-repository'

let employeeRepo: EmployeeRepository | null = null
let attendanceRepo: AttendanceRepository | null = null

/**
 * Initialize both repositories with the given async database instance.
 * Must be called before any getXxxRepo() calls.
 */
export function initRepositories(db: AsyncDatabase): void {
  employeeRepo = createEmployeeRepository(db)
  attendanceRepo = createAttendanceRepository(db)
}

/**
 * Get the EmployeeRepository singleton.
 * Throws if initRepositories() has not been called.
 */
export function getEmployeeRepo(): EmployeeRepository {
  if (!employeeRepo) {
    throw new Error(
      'Repositories not initialized. Call initRepositories(db) first.',
    )
  }
  return employeeRepo
}

/**
 * Get the AttendanceRepository singleton.
 * Throws if initRepositories() has not been called.
 */
export function getAttendanceRepo(): AttendanceRepository {
  if (!attendanceRepo) {
    throw new Error(
      'Repositories not initialized. Call initRepositories(db) first.',
    )
  }
  return attendanceRepo
}

/**
 * Reset both repository singletons to null.
 * Useful for testing or app teardown.
 */
export function resetRepositories(): void {
  employeeRepo = null
  attendanceRepo = null
}
