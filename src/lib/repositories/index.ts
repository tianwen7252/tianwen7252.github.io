export type { Repository } from './types'
export {
  createEmployeeRepository,
  type EmployeeRepository,
} from './employee-repository'
export {
  createAttendanceRepository,
  type AttendanceRepository,
} from './attendance-repository'
export {
  initRepositories,
  getEmployeeRepo,
  getAttendanceRepo,
  resetRepositories,
} from './provider'
