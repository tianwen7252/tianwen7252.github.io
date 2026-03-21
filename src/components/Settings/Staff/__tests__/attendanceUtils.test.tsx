import { describe, it, expect } from 'vitest'
import dayjs from 'dayjs'

import {
  formatTotalHours,
  calcTotalHours,
  buildTimestamp,
} from '../attendanceUtils'

// --- Test data factory ---

const makeAttendance = (
  overrides: Partial<RestaDB.Table.Attendance> = {},
): RestaDB.Table.Attendance => ({
  id: 101,
  employeeId: 1,
  date: '2026-03-20',
  clockIn: dayjs('2026-03-20T09:00:00').valueOf(),
  type: 'regular',
  ...overrides,
})

// =============================================
// formatTotalHours
// =============================================
describe('formatTotalHours', () => {
  it('returns "0h" for 0', () => {
    expect(formatTotalHours(0)).toBe('0h')
  })

  it('returns "0h" for negative value', () => {
    expect(formatTotalHours(-1)).toBe('0h')
  })

  it('returns hours format for >= 1 hour', () => {
    expect(formatTotalHours(1.5)).toBe('1.5h')
  })

  it('returns hours format for exactly 1 hour', () => {
    expect(formatTotalHours(1)).toBe('1h')
  })

  it('returns hours format for large values', () => {
    expect(formatTotalHours(8)).toBe('8h')
  })

  it('returns minutes for < 1 hour', () => {
    expect(formatTotalHours(0.5)).toBe('30m')
  })

  it('returns minutes for 0.75 hours', () => {
    expect(formatTotalHours(0.75)).toBe('45m')
  })

  it('returns "1m" minimum for very small values', () => {
    // 0.01 * 60 = 0.6, rounds to 1
    expect(formatTotalHours(0.01)).toBe('1m')
  })

  it('returns minutes for 0.1 hours', () => {
    // 0.1 * 60 = 6
    expect(formatTotalHours(0.1)).toBe('6m')
  })
})

// =============================================
// calcTotalHours
// =============================================
describe('calcTotalHours', () => {
  it('returns 0 for empty array', () => {
    expect(calcTotalHours([])).toBe(0)
  })

  it('returns correct hours for a complete shift', () => {
    const shifts = [
      makeAttendance({
        clockIn: dayjs('2026-03-20T09:00:00').valueOf(),
        clockOut: dayjs('2026-03-20T17:00:00').valueOf(),
      }),
    ]
    // 8 hours
    expect(calcTotalHours(shifts)).toBe(8)
  })

  it('skips vacation records', () => {
    const shifts = [
      makeAttendance({
        clockIn: dayjs('2026-03-20T09:00:00').valueOf(),
        clockOut: dayjs('2026-03-20T17:00:00').valueOf(),
        type: 'vacation',
      }),
    ]
    expect(calcTotalHours(shifts)).toBe(0)
  })

  it('skips shifts without clockOut', () => {
    const shifts = [
      makeAttendance({
        clockIn: dayjs('2026-03-20T09:00:00').valueOf(),
        clockOut: undefined,
      }),
    ]
    expect(calcTotalHours(shifts)).toBe(0)
  })
})

// =============================================
// buildTimestamp
// =============================================
describe('buildTimestamp', () => {
  it('returns undefined for null timeValue', () => {
    expect(buildTimestamp('2026-03-20', null)).toBeUndefined()
  })

  it('returns correct timestamp for valid inputs', () => {
    const timeValue = dayjs('2026-03-20T14:30:00')
    const result = buildTimestamp('2026-03-20', timeValue)
    const expected = dayjs('2026-03-20')
      .hour(14)
      .minute(30)
      .second(0)
      .valueOf()
    expect(result).toBe(expected)
  })
})
