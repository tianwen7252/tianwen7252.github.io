import { describe, it, expect } from 'vitest'
import dayjs from 'dayjs'

import {
  formatClockTime,
  getCellDisplayType,
  buildAttendanceMap,
  filterEmployeesByName,
  getYearOptions,
  getMonthOptions,
  buildDayRows,
  buildCalendarGrid,
} from '../recordsUtils'

// --- Test data factories ---

const makeEmployee = (
  overrides: Partial<RestaDB.Table.Employee> = {},
): RestaDB.Table.Employee => ({
  id: 1,
  name: 'Alice',
  avatar: 'images/animals/cat.png',
  status: 'active',
  shiftType: 'regular' as const,
  employeeNo: '001',
  isAdmin: false,
  ...overrides,
})

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
// formatClockTime
// =============================================
describe('formatClockTime', () => {
  it('returns HH:mm for a valid timestamp', () => {
    const ts = dayjs('2026-03-20 08:30').valueOf()
    expect(formatClockTime(ts)).toBe('08:30')
  })

  it('returns HH:mm for an afternoon timestamp', () => {
    const ts = dayjs('2026-03-20 17:05').valueOf()
    expect(formatClockTime(ts)).toBe('17:05')
  })

  it('returns ??:?? for undefined', () => {
    expect(formatClockTime(undefined)).toBe('??:??')
  })

  it('returns ??:?? for 0', () => {
    expect(formatClockTime(0)).toBe('??:??')
  })
})

// =============================================
// getCellDisplayType
// =============================================
describe('getCellDisplayType', () => {
  it('returns noRecord for undefined attendance', () => {
    expect(getCellDisplayType(undefined)).toBe('noRecord')
  })

  it('returns vacation when type is vacation', () => {
    const att = makeAttendance({ type: 'vacation' })
    expect(getCellDisplayType(att)).toBe('vacation')
  })

  it('returns clockInOnly when clockIn exists but no clockOut', () => {
    const att = makeAttendance({
      clockIn: dayjs('2026-03-20T09:00:00').valueOf(),
      clockOut: undefined,
      type: 'regular',
    })
    expect(getCellDisplayType(att)).toBe('clockInOnly')
  })

  it('returns normal when both clockIn and clockOut exist', () => {
    const att = makeAttendance({
      clockIn: dayjs('2026-03-20T09:00:00').valueOf(),
      clockOut: dayjs('2026-03-20T18:00:00').valueOf(),
      type: 'regular',
    })
    expect(getCellDisplayType(att)).toBe('normal')
  })
})

// =============================================
// buildAttendanceMap
// =============================================
describe('buildAttendanceMap', () => {
  it('creates correct lookup keys in employeeId-date format', () => {
    const att = makeAttendance({ employeeId: 5, date: '2026-03-20' })
    const map = buildAttendanceMap([att])
    expect(map.get('5-2026-03-20')).toEqual([att])
  })

  it('returns empty map for empty array', () => {
    const map = buildAttendanceMap([])
    expect(map.size).toBe(0)
  })

  it('handles multiple records with different keys', () => {
    const att1 = makeAttendance({ id: 1, employeeId: 1, date: '2026-03-20' })
    const att2 = makeAttendance({ id: 2, employeeId: 2, date: '2026-03-20' })
    const att3 = makeAttendance({ id: 3, employeeId: 1, date: '2026-03-21' })
    const map = buildAttendanceMap([att1, att2, att3])
    expect(map.size).toBe(3)
    expect(map.get('1-2026-03-20')).toEqual([att1])
    expect(map.get('2-2026-03-20')).toEqual([att2])
    expect(map.get('1-2026-03-21')).toEqual([att3])
  })

  it('groups multiple records under same key (multi-shift)', () => {
    const att1 = makeAttendance({ id: 1, employeeId: 1, date: '2026-03-20' })
    const att2 = makeAttendance({ id: 2, employeeId: 1, date: '2026-03-20' })
    const map = buildAttendanceMap([att1, att2])
    expect(map.size).toBe(1)
    expect(map.get('1-2026-03-20')).toEqual([att1, att2])
  })
})

// =============================================
// filterEmployeesByName
// =============================================
describe('filterEmployeesByName', () => {
  const employees = [
    makeEmployee({ id: 1, name: 'Alice' }),
    makeEmployee({ id: 2, name: 'Bob' }),
    makeEmployee({ id: 3, name: '王小明' }),
  ]

  it('returns all employees when query is empty string', () => {
    const result = filterEmployeesByName(employees, '')
    expect(result).toHaveLength(3)
  })

  it('filters by partial name match', () => {
    const result = filterEmployeesByName(employees, 'Ali')
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('Alice')
  })

  it('is case-insensitive', () => {
    const result = filterEmployeesByName(employees, 'alice')
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('Alice')
  })

  it('returns empty array when no match', () => {
    const result = filterEmployeesByName(employees, 'Charlie')
    expect(result).toHaveLength(0)
  })

  it('matches Chinese characters', () => {
    const result = filterEmployeesByName(employees, '小明')
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('王小明')
  })
})

// =============================================
// getYearOptions
// =============================================
describe('getYearOptions', () => {
  it('returns 5 options (current year +/- 2)', () => {
    const options = getYearOptions(2026)
    expect(options).toHaveLength(5)
  })

  it('options span from currentYear-2 to currentYear+2', () => {
    const options = getYearOptions(2026)
    const values = options.map(o => o.value)
    expect(values).toEqual([2024, 2025, 2026, 2027, 2028])
  })

  it('labels follow "YYYY 年" format', () => {
    const options = getYearOptions(2026)
    expect(options[0].label).toBe('2024 年')
    expect(options[2].label).toBe('2026 年')
    expect(options[4].label).toBe('2028 年')
  })
})

// =============================================
// getMonthOptions
// =============================================
describe('getMonthOptions', () => {
  it('returns 12 options', () => {
    const options = getMonthOptions()
    expect(options).toHaveLength(12)
  })

  it('values range from 1 to 12', () => {
    const options = getMonthOptions()
    const values = options.map(o => o.value)
    expect(values).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
  })

  it('labels follow "N 月" format', () => {
    const options = getMonthOptions()
    expect(options[0].label).toBe('1 月')
    expect(options[11].label).toBe('12 月')
  })

  it('filters out future months when selectedYear equals currentYear', () => {
    const options = getMonthOptions(2026, 2026, 3)
    expect(options).toHaveLength(3)
    const values = options.map(o => o.value)
    expect(values).toEqual([1, 2, 3])
  })

  it('returns all 12 months when selectedYear is before currentYear', () => {
    const options = getMonthOptions(2025, 2026, 3)
    expect(options).toHaveLength(12)
  })
})

// =============================================
// buildDayRows
// =============================================
describe('buildDayRows', () => {
  const employees = [
    makeEmployee({ id: 1, name: 'Alice' }),
    makeEmployee({ id: 2, name: 'Bob' }),
  ]

  const attendances = [
    makeAttendance({
      id: 1,
      employeeId: 1,
      date: '2026-03-20',
      clockIn: dayjs('2026-03-20T09:00:00').valueOf(),
      clockOut: dayjs('2026-03-20T18:00:00').valueOf(),
      type: 'regular',
    }),
    makeAttendance({
      id: 2,
      employeeId: 2,
      date: '2026-03-20',
      clockIn: dayjs('2026-03-20T10:00:00').valueOf(),
      type: 'vacation',
    }),
  ]

  it('returns only days up to today (future dates filtered out)', () => {
    const rows = buildDayRows(2026, 3, employees, attendances, '2026-03-20')
    // March has 31 days but today is 03/20, so only 20 days returned
    expect(rows).toHaveLength(20)
    expect(rows.every(r => r.date <= '2026-03-20')).toBe(true)
  })

  it('returns all days when today is last day of month', () => {
    const rows = buildDayRows(2026, 2, employees, [], '2026-02-28')
    expect(rows).toHaveLength(28)
  })

  it('rows are sorted newest (latest date) first', () => {
    const rows = buildDayRows(2026, 3, employees, attendances, '2026-03-20')
    // First row should be March 20 (today, no future)
    expect(rows[0].date).toBe('2026-03-20')
    // Last row should be March 1
    expect(rows[rows.length - 1].date).toBe('2026-03-01')
  })

  it('marks weekend days with isWeekend=true', () => {
    const rows = buildDayRows(2026, 3, employees, attendances, '2026-03-20')
    // March 1, 2026 is a Sunday (dayOfWeek=0)
    const march1 = rows.find(r => r.date === '2026-03-01')!
    expect(march1.isWeekend).toBe(true)
    expect(march1.dayOfWeek).toBe(0)

    // March 7, 2026 is a Saturday (dayOfWeek=6)
    const march7 = rows.find(r => r.date === '2026-03-07')!
    expect(march7.isWeekend).toBe(true)
    expect(march7.dayOfWeek).toBe(6)

    // March 2, 2026 is Monday (dayOfWeek=1)
    const march2 = rows.find(r => r.date === '2026-03-02')!
    expect(march2.isWeekend).toBe(false)
  })

  it('marks today correctly', () => {
    const rows = buildDayRows(2026, 3, employees, attendances, '2026-03-20')
    const todayRow = rows.find(r => r.date === '2026-03-20')!
    expect(todayRow.isToday).toBe(true)

    const otherRow = rows.find(r => r.date === '2026-03-19')!
    expect(otherRow.isToday).toBe(false)
  })

  it('displayDate format is MM/DD (週X)', () => {
    const rows = buildDayRows(2026, 3, employees, attendances, '2026-03-20')
    // March 20, 2026 is Friday => 五
    const march20 = rows.find(r => r.date === '2026-03-20')!
    expect(march20.displayDate).toBe('03/20 (五)')

    // March 1 is Sunday => 日
    const march1 = rows.find(r => r.date === '2026-03-01')!
    expect(march1.displayDate).toBe('03/01 (日)')
  })

  it('cells contain correct employee-attendance pairing', () => {
    const rows = buildDayRows(2026, 3, employees, attendances, '2026-03-20')
    const march20 = rows.find(r => r.date === '2026-03-20')!

    expect(march20.cells).toHaveLength(2)

    // Alice (id=1) should have attendances array with one record
    expect(march20.cells[0].employee.name).toBe('Alice')
    expect(march20.cells[0].attendances).toHaveLength(1)
    expect(march20.cells[0].attendances[0].employeeId).toBe(1)

    // Bob (id=2) should have vacation attendance
    expect(march20.cells[1].employee.name).toBe('Bob')
    expect(march20.cells[1].attendances).toHaveLength(1)
    expect(march20.cells[1].attendances[0].type).toBe('vacation')
  })

  it('cells have empty attendances array when no record exists', () => {
    const rows = buildDayRows(2026, 3, employees, attendances, '2026-03-20')
    // March 15 has no attendance records
    const march15 = rows.find(r => r.date === '2026-03-15')!
    expect(march15.cells[0].attendances).toHaveLength(0)
    expect(march15.cells[1].attendances).toHaveLength(0)
  })
})

// =============================================
// buildCalendarGrid
// =============================================
describe('buildCalendarGrid', () => {
  const employees = [makeEmployee({ id: 1, name: 'Alice' })]
  const attendances = [
    makeAttendance({
      id: 1,
      employeeId: 1,
      date: '2026-03-20',
      clockIn: dayjs('2026-03-20T09:00:00').valueOf(),
      clockOut: dayjs('2026-03-20T18:00:00').valueOf(),
      type: 'regular',
    }),
  ]

  it('returns 6 rows of 7 columns each', () => {
    const grid = buildCalendarGrid(2026, 3, employees, attendances, '2026-03-20')
    expect(grid).toHaveLength(6)
    grid.forEach(row => {
      expect(row).toHaveLength(7)
    })
  })

  it('first day of grid is a Sunday (dayOfWeek=0)', () => {
    const grid = buildCalendarGrid(2026, 3, employees, attendances, '2026-03-20')
    expect(grid[0][0].dayOfWeek).toBe(0)
  })

  it('marks current-month days with isCurrentMonth=true', () => {
    const grid = buildCalendarGrid(2026, 3, employees, attendances, '2026-03-20')
    // March 1, 2026 is Sunday => first cell of grid should be March 1 itself
    // since March starts on Sunday
    expect(grid[0][0].isCurrentMonth).toBe(true)
    expect(grid[0][0].date).toBe('2026-03-01')
  })

  it('marks outside-month days with isCurrentMonth=false', () => {
    const grid = buildCalendarGrid(2026, 3, employees, attendances, '2026-03-20')
    // March 2026 starts on Sunday and has 31 days.
    // So after March 31 (in row[4][2] = Tuesday), the remaining are April days
    // The 6th row should have April dates
    const lastRow = grid[5]
    // April days should be outside month
    const aprilDay = lastRow.find(d => d.date.startsWith('2026-04'))
    expect(aprilDay).toBeDefined()
    expect(aprilDay!.isCurrentMonth).toBe(false)
  })

  it('outside-month days have empty cells array', () => {
    const grid = buildCalendarGrid(2026, 3, employees, attendances, '2026-03-20')
    const lastRow = grid[5]
    const aprilDay = lastRow.find(d => d.date.startsWith('2026-04'))
    expect(aprilDay).toBeDefined()
    expect(aprilDay!.cells).toHaveLength(0)
  })

  it('current-month days include attendance cells', () => {
    const grid = buildCalendarGrid(2026, 3, employees, attendances, '2026-03-20')
    // Find March 20 in the grid
    const flatDays = grid.flat()
    const march20 = flatDays.find(d => d.date === '2026-03-20')!
    expect(march20.isCurrentMonth).toBe(true)
    expect(march20.cells).toHaveLength(1)
    expect(march20.cells[0].employee.name).toBe('Alice')
    expect(march20.cells[0].attendances).toHaveLength(1)
  })

  it('today is marked correctly', () => {
    const grid = buildCalendarGrid(2026, 3, employees, attendances, '2026-03-20')
    const flatDays = grid.flat()
    const todayDay = flatDays.find(d => d.date === '2026-03-20')!
    expect(todayDay.isToday).toBe(true)

    const otherDay = flatDays.find(d => d.date === '2026-03-19')!
    expect(otherDay.isToday).toBe(false)
  })

  it('handles a month that does not start on Sunday (e.g. April 2026 starts Wednesday)', () => {
    const grid = buildCalendarGrid(2026, 4, employees, [], '2026-04-15')
    // April 1, 2026 is Wednesday => first row should start with March 29 (Sunday)
    expect(grid[0][0].dayOfWeek).toBe(0)
    expect(grid[0][0].isCurrentMonth).toBe(false)
    expect(grid[0][0].date).toBe('2026-03-29')

    // April 1 should be at position [0][3] (Wednesday)
    expect(grid[0][3].date).toBe('2026-04-01')
    expect(grid[0][3].isCurrentMonth).toBe(true)
  })
})
