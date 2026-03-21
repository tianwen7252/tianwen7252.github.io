// Attendance type definitions for classifying attendance records
export const ATTENDANCE_TYPES = {
  REGULAR: 'regular',
  VACATION: 'vacation',
} as const

export type AttendanceType = (typeof ATTENDANCE_TYPES)[keyof typeof ATTENDANCE_TYPES]
