/**
 * Public API entry point.
 * Re-exports types and the singleton provider for consumer use.
 */

export type { EmployeeApi, AttendanceApi, ApiProvider } from './types'
export { api, resetApi } from './provider'
