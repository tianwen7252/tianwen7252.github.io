/**
 * Mock AttendanceApi adapter.
 * Thin delegation layer that wraps mockAttendanceService
 * to satisfy the AttendanceApi interface.
 */

import { mockAttendanceService } from '@/services/mock-data'
import type { AttendanceApi } from '../types'

export interface MockAttendanceApi extends AttendanceApi {
  /** Reset to initial sample data. Only available in mock backend. */
  reset(): void
}

export function createMockAttendanceApi(): MockAttendanceApi {
  return {
    getAll: () => mockAttendanceService.getAll(),
    getById: (id) => mockAttendanceService.getById(id),
    getByDate: (date) => mockAttendanceService.getByDate(date),
    getByMonth: (year, month) => mockAttendanceService.getByMonth(year, month),
    getByEmployeeId: (employeeId) =>
      mockAttendanceService.getByEmployeeId(employeeId),
    getByEmployeeAndDate: (employeeId, date) =>
      mockAttendanceService.getByEmployeeAndDate(employeeId, date),
    add: (data) => mockAttendanceService.add(data),
    update: (id, data) => mockAttendanceService.update(id, data),
    remove: (id) => mockAttendanceService.remove(id),
    reset: () => mockAttendanceService.reset(),
  }
}
