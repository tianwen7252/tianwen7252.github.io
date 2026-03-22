/**
 * Records utility module for attendance display in calendar/table views.
 * Ported from V1 recordsUtils.ts with V2 schema adaptations.
 */

import dayjs from 'dayjs'
import type { Employee, Attendance } from '@/lib/schemas'

// ─── Types ──────────────────────────────────────────────────────────────────

export type CellDisplayType = 'normal' | 'clockInOnly' | 'noRecord' | 'vacation'

export interface EmployeeAttendanceCell {
  readonly employee: Employee
  readonly attendances: readonly Attendance[]
}

export interface DayRow {
  readonly date: string
  readonly displayDate: string
  readonly dayOfWeek: number
  readonly isWeekend: boolean
  readonly isToday: boolean
  readonly cells: readonly EmployeeAttendanceCell[]
}

export interface CalendarDay extends DayRow {
  readonly isCurrentMonth: boolean
}

// ─── Constants ──────────────────────────────────────────────────────────────

export const WEEKDAY_LABELS = [
  '週日',
  '週一',
  '週二',
  '週三',
  '週四',
  '週五',
  '週六',
] as const

export const WEEKDAY_SHORT = ['日', '一', '二', '三', '四', '五', '六'] as const

// ─── Utility Functions ──────────────────────────────────────────────────────

/** Check whether any cell in a DayRow has attendance records. */
export function dayRowHasAttendance(row: DayRow): boolean {
  return row.cells.some(cell => cell.attendances.length > 0)
}

/**
 * Build a lookup map from attendances, keyed by "employeeId-date".
 * Used to efficiently populate cells without repeated filtering.
 */
export function buildAttendanceMap(
  attendances: readonly Attendance[],
): ReadonlyMap<string, readonly Attendance[]> {
  const map = new Map<string, Attendance[]>()
  for (const att of attendances) {
    const key = `${att.employeeId}-${att.date}`
    const existing = map.get(key)
    if (existing !== undefined) {
      map.set(key, [...existing, att])
    } else {
      map.set(key, [att])
    }
  }
  return map
}

/** Format a clock timestamp as HH:mm, or "??:??" if missing/zero. */
export function formatClockTime(ts: number | undefined): string {
  if (ts === undefined || ts === 0) return '??:??'
  return dayjs(ts).format('HH:mm')
}

/**
 * Determine the display type for an attendance cell.
 * In V2, any non-'regular' type maps to 'vacation' display
 * (paid_leave, sick_leave, personal_leave, absent).
 */
export function getCellDisplayType(
  attendance: Attendance | undefined,
): CellDisplayType {
  if (attendance === undefined) return 'noRecord'
  if (attendance.type !== 'regular') return 'vacation'
  if (attendance.clockIn !== undefined && attendance.clockOut === undefined)
    return 'clockInOnly'
  return 'normal'
}

/** Filter employees by name with case-insensitive partial matching. */
export function filterEmployeesByName(
  employees: readonly Employee[],
  query: string,
): readonly Employee[] {
  if (!query) return employees
  const lowerQuery = query.toLowerCase()
  return employees.filter(emp => emp.name.toLowerCase().includes(lowerQuery))
}

/** Generate year options: 5 years centered on the given year. */
export function getYearOptions(
  currentYear: number,
): readonly { value: number; label: string }[] {
  return Array.from({ length: 5 }, (_, i) => {
    const year = currentYear - 2 + i
    return { value: year, label: `${year} 年` }
  })
}

/**
 * Generate month options (1-12).
 * When selectedYear matches currentYear, cap at currentMonth to hide future months.
 */
export function getMonthOptions(
  selectedYear?: number,
  currentYear?: number,
  currentMonth?: number,
): readonly { value: number; label: string }[] {
  const maxMonth =
    selectedYear != null &&
    currentYear != null &&
    currentMonth != null &&
    selectedYear === currentYear
      ? currentMonth
      : 12
  return Array.from({ length: maxMonth }, (_, i) => ({
    value: i + 1,
    label: `${i + 1} 月`,
  }))
}

// ─── Day Row / Calendar Builders ────────────────────────────────────────────

/** Build a single DayRow for one date. */
function buildSingleDayRow(
  dateStr: string,
  employees: readonly Employee[],
  attMap: ReadonlyMap<string, readonly Attendance[]>,
  todayStr: string,
): DayRow {
  const d = dayjs(dateStr)
  const dayOfWeek = d.day()
  const cells: readonly EmployeeAttendanceCell[] = employees.map(emp => ({
    employee: emp,
    attendances: attMap.get(`${emp.id}-${dateStr}`) ?? [],
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
 * Build day rows for a month in descending order (most recent first).
 * Filters out dates after todayStr.
 */
export function buildDayRows(
  year: number,
  month: number,
  employees: readonly Employee[],
  attendances: readonly Attendance[],
  todayStr: string,
): readonly DayRow[] {
  const daysInMonth = dayjs(
    `${year}-${String(month).padStart(2, '0')}-01`,
  ).daysInMonth()
  const attMap = buildAttendanceMap(attendances)
  return Array.from({ length: daysInMonth }, (_, i) => {
    const day = daysInMonth - i
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return buildSingleDayRow(dateStr, employees, attMap, todayStr)
  }).filter(row => row.date <= todayStr)
}

/**
 * Build a 6x7 calendar grid for a given month.
 * Days outside the current month have empty cells arrays.
 */
export function buildCalendarGrid(
  year: number,
  month: number,
  employees: readonly Employee[],
  attendances: readonly Attendance[],
  todayStr: string,
): readonly (readonly CalendarDay[])[] {
  const firstOfMonth = dayjs(`${year}-${String(month).padStart(2, '0')}-01`)
  const startDayOfWeek = firstOfMonth.day()
  const gridStart = firstOfMonth.subtract(startDayOfWeek, 'day')
  const attMap = buildAttendanceMap(attendances)
  const totalDays = 42

  const allDays: CalendarDay[] = Array.from({ length: totalDays }, (_, i) => {
    const current = gridStart.add(i, 'day')
    const dateStr = current.format('YYYY-MM-DD')
    const isCurrentMonth =
      current.month() + 1 === month && current.year() === year
    const dayOfWeek = current.day()
    const cells: readonly EmployeeAttendanceCell[] = isCurrentMonth
      ? employees.map(emp => ({
          employee: emp,
          attendances: attMap.get(`${emp.id}-${dateStr}`) ?? [],
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

  return Array.from({ length: 6 }, (_, rowIdx) =>
    allDays.slice(rowIdx * 7, rowIdx * 7 + 7),
  )
}
