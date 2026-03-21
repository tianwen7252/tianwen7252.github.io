import dayjs from 'dayjs'
import { ATTENDANCE_TYPES } from 'src/constants/defaults/attendanceTypes'

// Build a timestamp by combining a date string with time from a dayjs value
export const buildTimestamp = (
  dateStr: string,
  timeValue: dayjs.Dayjs | null | undefined,
): number | undefined => {
  if (!timeValue) return undefined
  return dayjs(dateStr)
    .hour(timeValue.hour())
    .minute(timeValue.minute())
    .second(timeValue.second())
    .valueOf()
}

/**
 * Calculate total work hours from an array of shifts.
 * Only counts shifts with both clockIn and clockOut. Skips vacation records.
 * Returns hours rounded to 1 decimal place.
 */
export const calcTotalHours = (
  shifts: readonly RestaDB.Table.Attendance[],
): number => {
  const totalMs = shifts.reduce((sum, shift) => {
    if (shift.type === ATTENDANCE_TYPES.VACATION) return sum
    if (shift.clockIn == null || shift.clockOut == null) return sum
    return sum + (shift.clockOut - shift.clockIn)
  }, 0)
  return Math.round((totalMs / (1000 * 60 * 60)) * 10) / 10
}

/** Format total hours as a display string. Uses minutes when < 1h. */
export const formatTotalHours = (hours: number): string => {
  if (hours <= 0) return '0h'
  if (hours < 1) {
    const minutes = Math.round(hours * 60)
    return `${Math.max(minutes, 1)}m`
  }
  return `${hours}h`
}
