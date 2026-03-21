/**
 * Attendance utility functions for calculating work hours and formatting timestamps.
 * Ported from V1 (src/components/Settings/Staff/attendanceUtils.ts) with V2 adaptations.
 */

import dayjs from 'dayjs'
import type { Attendance } from '@/lib/schemas'

/**
 * Build a Unix timestamp (ms) by combining a date string with the h/m/s from a dayjs object.
 * Returns undefined when timeValue is null or undefined.
 */
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
 * Calculate total worked hours from an array of attendance records.
 * Only 'regular' type records with both clockIn and clockOut are counted.
 */
export const calcTotalHours = (
  shifts: readonly Attendance[],
): number => {
  const totalMs = shifts.reduce((sum, shift) => {
    if (shift.type !== 'regular') return sum
    if (shift.clockIn == null || shift.clockOut == null) return sum
    return sum + (shift.clockOut - shift.clockIn)
  }, 0)
  return totalMs / (1000 * 60 * 60)
}

/**
 * Format a total-hours number into a human-readable string.
 * - 0 or negative -> '0h'
 * - < 1 hour      -> minutes format (e.g. '30m'), minimum '1m'
 * - >= 1 hour     -> hours format with up to 1 decimal (e.g. '8h', '4.5h')
 */
export const formatTotalHours = (hours: number): string => {
  if (hours <= 0) return '0h'
  if (hours < 1) {
    const minutes = Math.round(hours * 60)
    return `${Math.max(minutes, 1)}m`
  }
  return `${Math.round(hours * 10) / 10}h`
}
