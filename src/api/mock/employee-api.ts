/**
 * Mock EmployeeApi adapter.
 * Thin delegation layer that wraps mockEmployeeService
 * to satisfy the EmployeeApi interface.
 */

import { mockEmployeeService } from '@/services/mock-data'
import type { EmployeeApi } from '../types'

export interface MockEmployeeApi extends EmployeeApi {
  /** Reset to initial sample data. Only available in mock backend. */
  reset(): void
}

export function createMockEmployeeApi(): MockEmployeeApi {
  return {
    getAll: () => mockEmployeeService.getAll(),
    getActive: () => mockEmployeeService.getActive(),
    getById: (id) => mockEmployeeService.getById(id),
    add: (data) => mockEmployeeService.add(data),
    update: (id, data) => mockEmployeeService.update(id, data),
    remove: (id) => mockEmployeeService.remove(id),
    reset: () => mockEmployeeService.reset(),
  }
}
