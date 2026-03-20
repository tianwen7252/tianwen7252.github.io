import dayjs from 'dayjs'
import { ATTENDANCE_TYPES } from 'src/constants/defaults/attendanceTypes'

// ---- Types ----

export type CellDisplayType = 'normal' | 'clockInOnly' | 'noRecord' | 'vacation'

export interface EmployeeAttendanceCell {
  readonly employee: RestaDB.Table.Employee
  readonly attendance: RestaDB.Table.Attendance | undefined
}

export interface DayRow {
  readonly date: string // 'YYYY-MM-DD'
  readonly displayDate: string // 'MM/DD (週X)'
  readonly dayOfWeek: number // 0=Sunday, 6=Saturday
  readonly isWeekend: boolean
  readonly isToday: boolean
  readonly cells: readonly EmployeeAttendanceCell[]
}

export interface CalendarDay extends DayRow {
  readonly isCurrentMonth: boolean
}

// ---- Constants ----

export const WEEKDAY_LABELS = [
  '週日',
  '週一',
  '週二',
  '週三',
  '週四',
  '週五',
  '週六',
] as const

const WEEKDAY_SHORT = ['日', '一', '二', '三', '四', '五', '六'] as const

// ---- Functions ----

/**
 * Build attendance lookup map.
 * Key format: `${employeeId}-${date}`
 */
export function buildAttendanceMap(
  attendances: readonly RestaDB.Table.Attendance[],
): ReadonlyMap<string, RestaDB.Table.Attendance> {
  const entries: [string, RestaDB.Table.Attendance][] = attendances.map(att => [
    `${att.employeeId}-${att.date}`,
    att,
  ])
  return new Map(entries)
}

/**
 * Format clock time from timestamp.
 * Returns 'HH:mm' for valid timestamps, '??:??' otherwise.
 */
export function formatClockTime(ts: number | undefined): string {
  if (ts === undefined || ts === 0) {
    return '??:??'
  }
  return dayjs(ts).format('HH:mm')
}

/**
 * Determine how to display a cell based on attendance record.
 */
export function getCellDisplayType(
  attendance: RestaDB.Table.Attendance | undefined,
): CellDisplayType {
  if (attendance === undefined) {
    return 'noRecord'
  }
  if (attendance.type === ATTENDANCE_TYPES.VACATION) {
    return 'vacation'
  }
  if (attendance.clockIn !== undefined && attendance.clockOut === undefined) {
    return 'clockInOnly'
  }
  return 'normal'
}

/**
 * Filter employees by name (partial match, case-insensitive).
 */
export function filterEmployeesByName(
  employees: readonly RestaDB.Table.Employee[],
  query: string,
): readonly RestaDB.Table.Employee[] {
  if (!query) {
    return employees
  }
  const lowerQuery = query.toLowerCase()
  return employees.filter(emp => emp.name.toLowerCase().includes(lowerQuery))
}

/**
 * Generate year options: current year +/- 2.
 */
export function getYearOptions(
  currentYear: number,
): readonly { value: number; label: string }[] {
  return Array.from({ length: 5 }, (_, i) => {
    const year = currentYear - 2 + i
    return { value: year, label: `${year} 年` }
  })
}

/**
 * Generate month options: 1-12.
 */
export function getMonthOptions(): readonly { value: number; label: string }[] {
  return Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: `${i + 1} 月`,
  }))
}

/**
 * Build a single DayRow for a given date string.
 */
function buildSingleDayRow(
  dateStr: string,
  employees: readonly RestaDB.Table.Employee[],
  attMap: ReadonlyMap<string, RestaDB.Table.Attendance>,
  todayStr: string,
): DayRow {
  const d = dayjs(dateStr)
  const dayOfWeek = d.day()

  const cells: readonly EmployeeAttendanceCell[] = employees.map(emp => ({
    employee: emp,
    attendance: attMap.get(`${emp.id}-${dateStr}`),
  }))

  return {
    date: dateStr,
    displayDate: `${d.format('MM/DD')} (${WEEKDAY_SHORT[dayOfWeek]})`,
    dayOfWeek,
    isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
    isToday: dateStr === todayStr,
    cells,
  }
}

/**
 * Build array of DayRow for a given year-month (sorted newest first).
 */
export function buildDayRows(
  year: number,
  month: number, // 1-based
  employees: readonly RestaDB.Table.Employee[],
  attendances: readonly RestaDB.Table.Attendance[],
  todayStr: string,
): readonly DayRow[] {
  const daysInMonth = dayjs(`${year}-${String(month).padStart(2, '0')}-01`).daysInMonth()
  const attMap = buildAttendanceMap(attendances)

  // Build rows newest first (descending date order)
  return Array.from({ length: daysInMonth }, (_, i) => {
    const day = daysInMonth - i
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return buildSingleDayRow(dateStr, employees, attMap, todayStr)
  })
}

/**
 * Build 6-week calendar grid (6 rows x 7 cols).
 * Each week starts on Sunday.
 */
export function buildCalendarGrid(
  year: number,
  month: number, // 1-based
  employees: readonly RestaDB.Table.Employee[],
  attendances: readonly RestaDB.Table.Attendance[],
  todayStr: string,
): readonly (readonly CalendarDay[])[] {
  const firstOfMonth = dayjs(`${year}-${String(month).padStart(2, '0')}-01`)
  const startDayOfWeek = firstOfMonth.day() // 0=Sunday

  // Pad backwards to reach Sunday
  const gridStart = firstOfMonth.subtract(startDayOfWeek, 'day')

  const attMap = buildAttendanceMap(attendances)
  const totalDays = 42 // 6 weeks * 7 days

  const allDays: CalendarDay[] = Array.from({ length: totalDays }, (_, i) => {
    const current = gridStart.add(i, 'day')
    const dateStr = current.format('YYYY-MM-DD')
    const isCurrentMonth = current.month() + 1 === month && current.year() === year

    const dayOfWeek = current.day()

    // For outside-month days, cells are empty
    const cells: readonly EmployeeAttendanceCell[] = isCurrentMonth
      ? employees.map(emp => ({
          employee: emp,
          attendance: attMap.get(`${emp.id}-${dateStr}`),
        }))
      : []

    return {
      date: dateStr,
      displayDate: `${current.format('MM/DD')} (${WEEKDAY_SHORT[dayOfWeek]})`,
      dayOfWeek,
      isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
      isToday: dateStr === todayStr,
      cells,
      isCurrentMonth,
    }
  })

  // Split into 6 rows of 7
  return Array.from({ length: 6 }, (_, rowIdx) =>
    allDays.slice(rowIdx * 7, rowIdx * 7 + 7),
  )
}
