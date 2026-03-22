/**
 * Mock API provider barrel export.
 * Assembles individual mock adapters into a unified ApiProvider.
 */

import type { ApiProvider } from '../types'
import { createMockEmployeeApi } from './employee-api'
import { createMockAttendanceApi } from './attendance-api'

export interface MockApiProvider extends ApiProvider {
  /** Reset all mock data to initial state. Test utility only. */
  reset(): void
}

export function createMockApiProvider(): MockApiProvider {
  const employees = createMockEmployeeApi()
  const attendances = createMockAttendanceApi()
  return {
    employees,
    attendances,
    reset() {
      employees.reset()
      attendances.reset()
    },
  }
}
