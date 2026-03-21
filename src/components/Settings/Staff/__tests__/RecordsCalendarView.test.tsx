import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeAll } from 'vitest'
import dayjs from 'dayjs'
import React from 'react'
import type { CalendarDay, EmployeeAttendanceCell } from '../recordsUtils'

// Mock AvatarImage to simplify rendering
vi.mock('src/components/AvatarImage', () => ({
  AvatarImage: ({ size }: { size: number }) => (
    <div data-testid="avatar" style={{ width: size }} />
  ),
}))

// --- Test data factories ---

const mockEmployee = (id: number, name: string): RestaDB.Table.Employee => ({
  id,
  name,
  avatar: undefined,
})

const mockAttendance = (
  employeeId: number,
  date: string,
  clockIn?: number,
  clockOut?: number,
  type?: string,
  id?: number,
): RestaDB.Table.Attendance => ({
  id: id ?? employeeId * 100,
  employeeId,
  date,
  clockIn,
  clockOut,
  type: (type ?? 'regular') as any,
})

const emp1 = mockEmployee(1, 'Ryan')
const emp2 = mockEmployee(2, '\u9673\u5c0f\u660e')

// Helper to create a CalendarDay with sensible defaults
function createCalendarDay(
  overrides: Partial<CalendarDay> & { date: string },
): CalendarDay {
  const d = dayjs(overrides.date)
  return {
    displayDate: `${d.format('MM/DD')} (${['\u65e5', '\u4e00', '\u4e8c', '\u4e09', '\u56db', '\u4e94', '\u516d'][d.day()]})`,
    dayOfWeek: d.day(),
    isWeekend: d.day() === 0 || d.day() === 6,
    isToday: false,
    isCurrentMonth: true,
    cells: [],
    ...overrides,
  }
}

// Helper to wrap days into a single-week grid
function createTestGrid(
  days: CalendarDay[],
): readonly (readonly CalendarDay[])[] {
  return [days]
}

// Lazily import component after mocks are set up
let RecordsCalendarView: React.FC<any>

beforeAll(async () => {
  const mod = await import('../RecordsCalendarView')
  RecordsCalendarView = mod.RecordsCalendarView
})

describe('RecordsCalendarView', () => {
  // --------------------------------------------------------
  // 1. Renders 7 weekday headers
  // --------------------------------------------------------
  describe('header rendering', () => {
    it('renders all 7 weekday headers from Sunday to Saturday', () => {
      render(
        <RecordsCalendarView
          calendarGrid={[]}
          onEditRecord={vi.fn()}
          onAddRecord={vi.fn()}
        />,
      )

      const expectedLabels = ['\u9031\u65e5', '\u9031\u4e00', '\u9031\u4e8c', '\u9031\u4e09', '\u9031\u56db', '\u9031\u4e94', '\u9031\u516d']
      for (const label of expectedLabels) {
        expect(screen.getByText(label)).toBeInTheDocument()
      }
    })
  })

  // --------------------------------------------------------
  // 2. Weekend cells show "\u4f11" text
  // --------------------------------------------------------
  describe('weekend cells', () => {
    it('shows "\u4f11" text for Saturday in current month', () => {
      // 2026-03-21 is Saturday
      const saturday = createCalendarDay({
        date: '2026-03-21',
        isWeekend: true,
        isCurrentMonth: true,
        cells: [],
      })

      render(
        <RecordsCalendarView
          calendarGrid={createTestGrid([saturday])}
          onEditRecord={vi.fn()}
          onAddRecord={vi.fn()}
        />,
      )

      expect(screen.getByText('\u4f11')).toBeInTheDocument()
    })

    it('shows "\u4f11" text for Sunday in current month', () => {
      // 2026-03-22 is Sunday
      const sunday = createCalendarDay({
        date: '2026-03-22',
        isWeekend: true,
        isCurrentMonth: true,
        cells: [],
      })

      render(
        <RecordsCalendarView
          calendarGrid={createTestGrid([sunday])}
          onEditRecord={vi.fn()}
          onAddRecord={vi.fn()}
        />,
      )

      expect(screen.getByText('\u4f11')).toBeInTheDocument()
    })
  })

  // --------------------------------------------------------
  // 3. Today cell shows "\u4eca\u65e5" badge
  // --------------------------------------------------------
  describe('today badge', () => {
    it('shows "\u4eca\u65e5" badge for today cell', () => {
      const todayDay = createCalendarDay({
        date: '2026-03-20',
        isToday: true,
        isCurrentMonth: true,
        isWeekend: false,
        cells: [],
      })

      render(
        <RecordsCalendarView
          calendarGrid={createTestGrid([todayDay])}
          onEditRecord={vi.fn()}
          onAddRecord={vi.fn()}
        />,
      )

      expect(screen.getByText('\u4eca\u65e5')).toBeInTheDocument()
    })

    it('does not show "\u4eca\u65e5" badge for non-today cell', () => {
      const normalDay = createCalendarDay({
        date: '2026-03-18',
        isToday: false,
        isCurrentMonth: true,
        isWeekend: false,
        cells: [],
      })

      render(
        <RecordsCalendarView
          calendarGrid={createTestGrid([normalDay])}
          onEditRecord={vi.fn()}
          onAddRecord={vi.fn()}
        />,
      )

      expect(screen.queryByText('\u4eca\u65e5')).not.toBeInTheDocument()
    })
  })

  // --------------------------------------------------------
  // 4. Outside-month cells have muted date label
  // --------------------------------------------------------
  describe('outside-month cells', () => {
    it('renders outside-month cells with muted styling', () => {
      const outsideDay = createCalendarDay({
        date: '2026-02-28',
        isCurrentMonth: false,
        isWeekend: false,
        cells: [],
      })

      render(
        <RecordsCalendarView
          calendarGrid={createTestGrid([outsideDay])}
          onEditRecord={vi.fn()}
          onAddRecord={vi.fn()}
        />,
      )

      // The date label should be present with MM/DD format
      expect(screen.getByText('02/28')).toBeInTheDocument()
    })
  })

  // --------------------------------------------------------
  // 5. Normal attendance shows employee name and clock times
  // --------------------------------------------------------
  describe('employee card display types', () => {
    it('shows employee name and clock-in/clock-out as a time label for normal attendance', () => {
      const clockIn = dayjs('2026-03-20 08:30').valueOf()
      const clockOut = dayjs('2026-03-20 18:00').valueOf()
      const att = mockAttendance(1, '2026-03-20', clockIn, clockOut)

      const day = createCalendarDay({
        date: '2026-03-20',
        isCurrentMonth: true,
        isWeekend: false,
        cells: [{ employee: emp1, attendances: [att] }],
      })

      render(
        <RecordsCalendarView
          calendarGrid={createTestGrid([day])}
          onEditRecord={vi.fn()}
          onAddRecord={vi.fn()}
        />,
      )

      expect(screen.getByText('Ryan')).toBeInTheDocument()
      // Time is now displayed as a compact label "HH:mm - HH:mm"
      expect(screen.getByText('08:30 - 18:00')).toBeInTheDocument()
    })

    // --------------------------------------------------------
    // 6. Clock-in only shows time with ??:??
    // --------------------------------------------------------
    it('shows clock-in time with ??:?? when clock-out is missing', () => {
      const clockIn = dayjs('2026-03-20 09:05').valueOf()
      const att = mockAttendance(1, '2026-03-20', clockIn, undefined)

      const day = createCalendarDay({
        date: '2026-03-20',
        isCurrentMonth: true,
        isWeekend: false,
        cells: [{ employee: emp1, attendances: [att] }],
      })

      render(
        <RecordsCalendarView
          calendarGrid={createTestGrid([day])}
          onEditRecord={vi.fn()}
          onAddRecord={vi.fn()}
        />,
      )

      expect(screen.getByText('Ryan')).toBeInTheDocument()
      // Time label format: "HH:mm - ??:??"
      expect(screen.getByText('09:05 - ??:??')).toBeInTheDocument()
    })

    // --------------------------------------------------------
    // 7. Vacation shows "\u4f11\u5047" label
    // --------------------------------------------------------
    it('shows "\u4f11\u5047" label for vacation attendance', () => {
      const att = mockAttendance(1, '2026-03-20', undefined, undefined, 'vacation')

      const day = createCalendarDay({
        date: '2026-03-20',
        isCurrentMonth: true,
        isWeekend: false,
        cells: [{ employee: emp1, attendances: [att] }],
      })

      render(
        <RecordsCalendarView
          calendarGrid={createTestGrid([day])}
          onEditRecord={vi.fn()}
          onAddRecord={vi.fn()}
        />,
      )

      expect(screen.getByText('Ryan')).toBeInTheDocument()
      expect(screen.getByText('\u4f11\u5047')).toBeInTheDocument()
    })

    // --------------------------------------------------------
    // 8. No record shows "\u672a\u6253\u5361" text
    // --------------------------------------------------------
    it('shows "\u672a\u6253\u5361" text when no attendance record', () => {
      const day = createCalendarDay({
        date: '2026-03-20',
        isCurrentMonth: true,
        isWeekend: false,
        cells: [{ employee: emp1, attendances: [] }],
      })

      render(
        <RecordsCalendarView
          calendarGrid={createTestGrid([day])}
          onEditRecord={vi.fn()}
          onAddRecord={vi.fn()}
        />,
      )

      expect(screen.getByText('Ryan')).toBeInTheDocument()
      expect(screen.getByText('\u672a\u6253\u5361')).toBeInTheDocument()
    })
  })

  // --------------------------------------------------------
  // 9. Card click interactions — onEditRecord vs onAddRecord
  // --------------------------------------------------------
  describe('cell click interactions', () => {
    it('calls onEditRecord when clicking a time label inside the employee card', () => {
      const onEditRecord = vi.fn()
      const onAddRecord = vi.fn()
      const clockIn = dayjs('2026-03-20 08:30').valueOf()
      const clockOut = dayjs('2026-03-20 18:00').valueOf()
      const att = mockAttendance(1, '2026-03-20', clockIn, clockOut)

      const day = createCalendarDay({
        date: '2026-03-20',
        isCurrentMonth: true,
        isWeekend: false,
        cells: [{ employee: emp1, attendances: [att] }],
      })

      render(
        <RecordsCalendarView
          calendarGrid={createTestGrid([day])}
          onEditRecord={onEditRecord}
          onAddRecord={onAddRecord}
        />,
      )

      // Click the time label (not the employee card wrapper)
      const timeLabel = screen.getByText('08:30 - 18:00')
      fireEvent.click(timeLabel)

      expect(onEditRecord).toHaveBeenCalledTimes(1)
      expect(onEditRecord).toHaveBeenCalledWith(emp1, '2026-03-20', att)
    })

    it('calls onAddRecord with employee and date for no-record card click', () => {
      const onEditRecord = vi.fn()
      const onAddRecord = vi.fn()

      const day = createCalendarDay({
        date: '2026-03-20',
        isCurrentMonth: true,
        isWeekend: false,
        cells: [{ employee: emp1, attendances: [] }],
      })

      render(
        <RecordsCalendarView
          calendarGrid={createTestGrid([day])}
          onEditRecord={onEditRecord}
          onAddRecord={onAddRecord}
        />,
      )

      const card = screen.getByText('Ryan').closest('[role="button"]')!
      fireEvent.click(card)

      expect(onAddRecord).toHaveBeenCalledTimes(1)
      expect(onAddRecord).toHaveBeenCalledWith(emp1, '2026-03-20')
      expect(onEditRecord).not.toHaveBeenCalled()
    })

    it('calls onEditRecord for vacation card click', () => {
      const onEditRecord = vi.fn()
      const onAddRecord = vi.fn()
      const att = mockAttendance(1, '2026-03-20', undefined, undefined, 'vacation')

      const day = createCalendarDay({
        date: '2026-03-20',
        isCurrentMonth: true,
        isWeekend: false,
        cells: [{ employee: emp1, attendances: [att] }],
      })

      render(
        <RecordsCalendarView
          calendarGrid={createTestGrid([day])}
          onEditRecord={onEditRecord}
          onAddRecord={onAddRecord}
        />,
      )

      const card = screen.getByText('Ryan').closest('[role="button"]')!
      fireEvent.click(card)

      expect(onEditRecord).toHaveBeenCalledTimes(1)
      expect(onEditRecord).toHaveBeenCalledWith(emp1, '2026-03-20', att)
      expect(onAddRecord).not.toHaveBeenCalled()
    })

    it('stopPropagation prevents parent click handlers from firing', () => {
      const onEditRecord = vi.fn()
      const onAddRecord = vi.fn()
      const parentClick = vi.fn()

      const day = createCalendarDay({
        date: '2026-03-20',
        isCurrentMonth: true,
        isWeekend: false,
        cells: [{ employee: emp1, attendances: [] }],
      })

      render(
        <div onClick={parentClick}>
          <RecordsCalendarView
            calendarGrid={createTestGrid([day])}
            onEditRecord={onEditRecord}
            onAddRecord={onAddRecord}
          />
        </div>,
      )

      const card = screen.getByText('Ryan').closest('[role="button"]')!
      fireEvent.click(card)

      expect(onAddRecord).toHaveBeenCalledTimes(1)
      expect(parentClick).not.toHaveBeenCalled()
    })
  })

  // --------------------------------------------------------
  // 10. Keyboard accessibility
  // --------------------------------------------------------
  describe('keyboard accessibility', () => {
    it('calls onAddRecord when pressing Enter on no-record card', () => {
      const onEditRecord = vi.fn()
      const onAddRecord = vi.fn()

      const day = createCalendarDay({
        date: '2026-03-20',
        isCurrentMonth: true,
        isWeekend: false,
        cells: [{ employee: emp1, attendances: [] }],
      })

      render(
        <RecordsCalendarView
          calendarGrid={createTestGrid([day])}
          onEditRecord={onEditRecord}
          onAddRecord={onAddRecord}
        />,
      )

      const card = screen.getByText('Ryan').closest('[role="button"]')!
      fireEvent.keyDown(card, { key: 'Enter' })

      expect(onAddRecord).toHaveBeenCalledTimes(1)
      expect(onAddRecord).toHaveBeenCalledWith(emp1, '2026-03-20')
    })

    it('calls onEditRecord when pressing Space on a time label', () => {
      const onEditRecord = vi.fn()
      const onAddRecord = vi.fn()
      const clockIn = dayjs('2026-03-20 08:30').valueOf()
      const clockOut = dayjs('2026-03-20 18:00').valueOf()
      const att = mockAttendance(1, '2026-03-20', clockIn, clockOut)

      const day = createCalendarDay({
        date: '2026-03-20',
        isCurrentMonth: true,
        isWeekend: false,
        cells: [{ employee: emp1, attendances: [att] }],
      })

      render(
        <RecordsCalendarView
          calendarGrid={createTestGrid([day])}
          onEditRecord={onEditRecord}
          onAddRecord={onAddRecord}
        />,
      )

      // Press Space on the time label to trigger onEditRecord
      const timeLabel = screen.getByText('08:30 - 18:00')
      fireEvent.keyDown(timeLabel, { key: ' ' })

      expect(onEditRecord).toHaveBeenCalledTimes(1)
      expect(onEditRecord).toHaveBeenCalledWith(emp1, '2026-03-20', att)
    })

    it('does not trigger on non-Enter/Space keys', () => {
      const onEditRecord = vi.fn()
      const onAddRecord = vi.fn()

      const day = createCalendarDay({
        date: '2026-03-20',
        isCurrentMonth: true,
        isWeekend: false,
        cells: [{ employee: emp1, attendances: [] }],
      })

      render(
        <RecordsCalendarView
          calendarGrid={createTestGrid([day])}
          onEditRecord={onEditRecord}
          onAddRecord={onAddRecord}
        />,
      )

      const card = screen.getByText('Ryan').closest('[role="button"]')!
      fireEvent.keyDown(card, { key: 'Tab' })

      expect(onAddRecord).not.toHaveBeenCalled()
      expect(onEditRecord).not.toHaveBeenCalled()
    })
  })

  // --------------------------------------------------------
  // 11. Multi-shift support
  // --------------------------------------------------------
  describe('multi-shift rendering', () => {
    it('renders multiple shift cards for one employee with shift labels', () => {
      const clockIn1 = dayjs('2026-03-20 08:00').valueOf()
      const clockOut1 = dayjs('2026-03-20 12:00').valueOf()
      const att1 = mockAttendance(1, '2026-03-20', clockIn1, clockOut1, 'regular', 101)

      const clockIn2 = dayjs('2026-03-20 14:00').valueOf()
      const clockOut2 = dayjs('2026-03-20 18:00').valueOf()
      const att2 = mockAttendance(1, '2026-03-20', clockIn2, clockOut2, 'regular', 102)

      const day = createCalendarDay({
        date: '2026-03-20',
        isCurrentMonth: true,
        isWeekend: false,
        cells: [{ employee: emp1, attendances: [att1, att2] }],
      })

      render(
        <RecordsCalendarView
          calendarGrid={createTestGrid([day])}
          onEditRecord={vi.fn()}
          onAddRecord={vi.fn()}
        />,
      )

      // Multi-shift: employee name shown once, no shift numbering
      expect(screen.getByText('Ryan')).toBeInTheDocument()
      expect(screen.queryByText(/\u73ed1/)).not.toBeInTheDocument()
      expect(screen.queryByText(/\u73ed2/)).not.toBeInTheDocument()

      // Both shift time labels should be displayed
      expect(screen.getByText('08:00 - 12:00')).toBeInTheDocument()
      expect(screen.getByText('14:00 - 18:00')).toBeInTheDocument()
    })

    it('does not show shift label for single-shift employee', () => {
      const clockIn = dayjs('2026-03-20 08:30').valueOf()
      const clockOut = dayjs('2026-03-20 18:00').valueOf()
      const att = mockAttendance(1, '2026-03-20', clockIn, clockOut)

      const day = createCalendarDay({
        date: '2026-03-20',
        isCurrentMonth: true,
        isWeekend: false,
        cells: [{ employee: emp1, attendances: [att] }],
      })

      render(
        <RecordsCalendarView
          calendarGrid={createTestGrid([day])}
          onEditRecord={vi.fn()}
          onAddRecord={vi.fn()}
        />,
      )

      // Single shift: just "Ryan", no shift number
      expect(screen.getByText('Ryan')).toBeInTheDocument()
      expect(screen.queryByText('Ryan (\u73ed1)')).not.toBeInTheDocument()
    })

    it('calls onEditRecord with the correct shift record when clicking a specific shift card', () => {
      const onEditRecord = vi.fn()
      const clockIn1 = dayjs('2026-03-20 08:00').valueOf()
      const clockOut1 = dayjs('2026-03-20 12:00').valueOf()
      const att1 = mockAttendance(1, '2026-03-20', clockIn1, clockOut1, 'regular', 101)

      const clockIn2 = dayjs('2026-03-20 14:00').valueOf()
      const clockOut2 = dayjs('2026-03-20 18:00').valueOf()
      const att2 = mockAttendance(1, '2026-03-20', clockIn2, clockOut2, 'regular', 102)

      const day = createCalendarDay({
        date: '2026-03-20',
        isCurrentMonth: true,
        isWeekend: false,
        cells: [{ employee: emp1, attendances: [att1, att2] }],
      })

      render(
        <RecordsCalendarView
          calendarGrid={createTestGrid([day])}
          onEditRecord={onEditRecord}
          onAddRecord={vi.fn()}
        />,
      )

      // Click the second shift's time label
      const secondTimeLabel = screen.getByText('14:00 - 18:00')
      fireEvent.click(secondTimeLabel)

      expect(onEditRecord).toHaveBeenCalledTimes(1)
      expect(onEditRecord).toHaveBeenCalledWith(emp1, '2026-03-20', att2)
    })

    it('renders two separate clickable buttons for multi-shift', () => {
      const clockIn1 = dayjs('2026-03-20 08:00').valueOf()
      const clockOut1 = dayjs('2026-03-20 12:00').valueOf()
      const att1 = mockAttendance(1, '2026-03-20', clockIn1, clockOut1, 'regular', 101)

      const clockIn2 = dayjs('2026-03-20 14:00').valueOf()
      const clockOut2 = dayjs('2026-03-20 18:00').valueOf()
      const att2 = mockAttendance(1, '2026-03-20', clockIn2, clockOut2, 'regular', 102)

      const day = createCalendarDay({
        date: '2026-03-20',
        isCurrentMonth: true,
        isWeekend: false,
        cells: [{ employee: emp1, attendances: [att1, att2] }],
      })

      render(
        <RecordsCalendarView
          calendarGrid={createTestGrid([day])}
          onEditRecord={vi.fn()}
          onAddRecord={vi.fn()}
        />,
      )

      // Should have two clickable time labels for the two shifts
      const shift1Label = screen.getByText('08:00 - 12:00')
      const shift2Label = screen.getByText('14:00 - 18:00')
      expect(shift1Label).toBeInTheDocument()
      expect(shift2Label).toBeInTheDocument()
      // Both time labels should be accessible as buttons
      expect(shift1Label.getAttribute('role')).toBe('button')
      expect(shift2Label.getAttribute('role')).toBe('button')
    })
  })

  // --------------------------------------------------------
  // 12. Multiple employees in same day cell
  // --------------------------------------------------------
  describe('multiple employees', () => {
    it('renders multiple employee cards in the same day cell', () => {
      const clockIn1 = dayjs('2026-03-20 08:30').valueOf()
      const clockOut1 = dayjs('2026-03-20 18:00').valueOf()
      const att1 = mockAttendance(1, '2026-03-20', clockIn1, clockOut1)

      const clockIn2 = dayjs('2026-03-20 09:00').valueOf()
      const att2 = mockAttendance(2, '2026-03-20', clockIn2, undefined)

      const day = createCalendarDay({
        date: '2026-03-20',
        isCurrentMonth: true,
        isWeekend: false,
        cells: [
          { employee: emp1, attendances: [att1] },
          { employee: emp2, attendances: [att2] },
        ],
      })

      render(
        <RecordsCalendarView
          calendarGrid={createTestGrid([day])}
          onEditRecord={vi.fn()}
          onAddRecord={vi.fn()}
        />,
      )

      expect(screen.getByText('Ryan')).toBeInTheDocument()
      expect(screen.getByText('\u9673\u5c0f\u660e')).toBeInTheDocument()

      // emp1 has normal attendance — time label format
      expect(screen.getByText('08:30 - 18:00')).toBeInTheDocument()

      // emp2 has clock-in only — time label format
      expect(screen.getByText('09:00 - ??:??')).toBeInTheDocument()
    })

    it('fires onEditRecord with correct employee when clicking specific card', () => {
      const onEditRecord = vi.fn()
      const onAddRecord = vi.fn()
      const att1 = mockAttendance(1, '2026-03-20', undefined, undefined, 'vacation')

      const day = createCalendarDay({
        date: '2026-03-20',
        isCurrentMonth: true,
        isWeekend: false,
        cells: [
          { employee: emp1, attendances: [att1] },
          { employee: emp2, attendances: [] },
        ],
      })

      render(
        <RecordsCalendarView
          calendarGrid={createTestGrid([day])}
          onEditRecord={onEditRecord}
          onAddRecord={onAddRecord}
        />,
      )

      // Click the second employee card (\u9673\u5c0f\u660e) - no record, should call onAddRecord
      const card = screen.getByText('\u9673\u5c0f\u660e').closest('[role="button"]')!
      fireEvent.click(card)

      expect(onAddRecord).toHaveBeenCalledTimes(1)
      expect(onAddRecord).toHaveBeenCalledWith(emp2, '2026-03-20')
      expect(onEditRecord).not.toHaveBeenCalled()
    })
  })

  // --------------------------------------------------------
  // 13. Outside-month days don't render employee cards
  // --------------------------------------------------------
  describe('outside-month cards', () => {
    it('does not render employee cards for outside-month days', () => {
      const outsideDay = createCalendarDay({
        date: '2026-02-28',
        isCurrentMonth: false,
        isWeekend: false,
        cells: [{ employee: emp1, attendances: [] }],
      })

      render(
        <RecordsCalendarView
          calendarGrid={createTestGrid([outsideDay])}
          onEditRecord={vi.fn()}
          onAddRecord={vi.fn()}
        />,
      )

      // Date label should exist
      expect(screen.getByText('02/28')).toBeInTheDocument()
      // But employee name should NOT be rendered
      expect(screen.queryByText('Ryan')).not.toBeInTheDocument()
    })
  })

  // --------------------------------------------------------
  // 14. Date labels show MM/DD format
  // --------------------------------------------------------
  describe('date label formatting', () => {
    it('displays date as MM/DD format', () => {
      const day = createCalendarDay({
        date: '2026-03-05',
        isCurrentMonth: true,
        isWeekend: false,
        cells: [],
      })

      render(
        <RecordsCalendarView
          calendarGrid={createTestGrid([day])}
          onEditRecord={vi.fn()}
          onAddRecord={vi.fn()}
        />,
      )

      expect(screen.getByText('03/05')).toBeInTheDocument()
    })

    it('displays single-digit months and days with leading zeros', () => {
      const day = createCalendarDay({
        date: '2026-01-02',
        isCurrentMonth: true,
        isWeekend: false,
        cells: [],
      })

      render(
        <RecordsCalendarView
          calendarGrid={createTestGrid([day])}
          onEditRecord={vi.fn()}
          onAddRecord={vi.fn()}
        />,
      )

      expect(screen.getByText('01/02')).toBeInTheDocument()
    })
  })

  // --------------------------------------------------------
  // Weekend cells with attendance data
  // --------------------------------------------------------
  describe('weekend cells with attendance data', () => {
    it('shows employee cards for weekend with attendance data instead of 休', () => {
      // 2026-03-21 is Saturday
      const clockIn = dayjs('2026-03-21 09:00').valueOf()
      const clockOut = dayjs('2026-03-21 17:00').valueOf()
      const att = mockAttendance(1, '2026-03-21', clockIn, clockOut)

      const saturday = createCalendarDay({
        date: '2026-03-21',
        isWeekend: true,
        isCurrentMonth: true,
        cells: [{ employee: emp1, attendances: [att] }],
      })

      render(
        <RecordsCalendarView
          calendarGrid={createTestGrid([saturday])}
          onEditRecord={vi.fn()}
          onAddRecord={vi.fn()}
        />,
      )

      // Employee name and time should be rendered
      expect(screen.getByText('Ryan')).toBeInTheDocument()
      expect(screen.getByText('09:00 - 17:00')).toBeInTheDocument()
      // "休" should NOT be shown
      expect(screen.queryByText('休')).not.toBeInTheDocument()
    })

    it('still shows 休 for weekend without attendance data', () => {
      // 2026-03-21 is Saturday, no attendance data
      const saturday = createCalendarDay({
        date: '2026-03-21',
        isWeekend: true,
        isCurrentMonth: true,
        cells: [{ employee: emp1, attendances: [] }],
      })

      render(
        <RecordsCalendarView
          calendarGrid={createTestGrid([saturday])}
          onEditRecord={vi.fn()}
          onAddRecord={vi.fn()}
        />,
      )

      expect(screen.getByText('休')).toBeInTheDocument()
    })

    it('calls onCellClick for weekend cell with attendance data', () => {
      const onCellClick = vi.fn()
      const clockIn = dayjs('2026-03-21 09:00').valueOf()
      const clockOut = dayjs('2026-03-21 17:00').valueOf()
      const att = mockAttendance(1, '2026-03-21', clockIn, clockOut)

      const saturday = createCalendarDay({
        date: '2026-03-21',
        isWeekend: true,
        isCurrentMonth: true,
        cells: [{ employee: emp1, attendances: [att] }],
      })

      render(
        <RecordsCalendarView
          calendarGrid={createTestGrid([saturday])}
          onEditRecord={vi.fn()}
          onAddRecord={vi.fn()}
          onCellClick={onCellClick}
        />,
      )

      // Click the cell (not the employee card)
      const dateLabel = screen.getByText('03/21')
      fireEvent.click(dateLabel)

      expect(onCellClick).toHaveBeenCalledWith('2026-03-21')
    })

    it('renders employee cards for Sunday with attendance data', () => {
      // 2026-03-22 is Sunday
      const clockIn = dayjs('2026-03-22 10:00').valueOf()
      const clockOut = dayjs('2026-03-22 16:00').valueOf()
      const att = mockAttendance(2, '2026-03-22', clockIn, clockOut)

      const sunday = createCalendarDay({
        date: '2026-03-22',
        isWeekend: true,
        isCurrentMonth: true,
        cells: [{ employee: emp2, attendances: [att] }],
      })

      render(
        <RecordsCalendarView
          calendarGrid={createTestGrid([sunday])}
          onEditRecord={vi.fn()}
          onAddRecord={vi.fn()}
        />,
      )

      // Employee name and time should be rendered
      expect(screen.getByText('陳小明')).toBeInTheDocument()
      expect(screen.getByText('10:00 - 16:00')).toBeInTheDocument()
      // "休" should NOT be shown
      expect(screen.queryByText('休')).not.toBeInTheDocument()
    })

    it('today weekend with attendance data shows today badge and employee cards', () => {
      // 2026-03-21 is Saturday AND today, with attendance data
      const clockIn = dayjs('2026-03-21 08:00').valueOf()
      const clockOut = dayjs('2026-03-21 15:00').valueOf()
      const att = mockAttendance(1, '2026-03-21', clockIn, clockOut)

      const todayWeekend = createCalendarDay({
        date: '2026-03-21',
        isWeekend: true,
        isCurrentMonth: true,
        isToday: true,
        cells: [{ employee: emp1, attendances: [att] }],
      })

      render(
        <RecordsCalendarView
          calendarGrid={createTestGrid([todayWeekend])}
          onEditRecord={vi.fn()}
          onAddRecord={vi.fn()}
        />,
      )

      // Should show today badge
      expect(screen.getByText('今日')).toBeInTheDocument()
      // Should show employee cards
      expect(screen.getByText('Ryan')).toBeInTheDocument()
      expect(screen.getByText('08:00 - 15:00')).toBeInTheDocument()
      // "休" should NOT be shown
      expect(screen.queryByText('休')).not.toBeInTheDocument()
    })
  })

  // --------------------------------------------------------
  // Edge cases
  // --------------------------------------------------------
  describe('edge cases', () => {
    it('renders empty calendar body when calendarGrid is empty', () => {
      render(
        <RecordsCalendarView
          calendarGrid={[]}
          onEditRecord={vi.fn()}
          onAddRecord={vi.fn()}
        />,
      )

      // Headers should still be present
      expect(screen.getByText('\u9031\u4e00')).toBeInTheDocument()
      // But no day cells rendered - no date labels
      expect(screen.queryByText(/\d{2}\/\d{2}/)).not.toBeInTheDocument()
    })

    it('renders Chinese characters in employee names correctly', () => {
      const chineseEmp = mockEmployee(10, '\u674e\u5927\u83ef')

      const day = createCalendarDay({
        date: '2026-03-20',
        isCurrentMonth: true,
        isWeekend: false,
        cells: [{ employee: chineseEmp, attendances: [] }],
      })

      render(
        <RecordsCalendarView
          calendarGrid={createTestGrid([day])}
          onEditRecord={vi.fn()}
          onAddRecord={vi.fn()}
        />,
      )

      expect(screen.getByText('\u674e\u5927\u83ef')).toBeInTheDocument()
    })

    it('renders multiple weeks in the grid', () => {
      const week1 = [
        createCalendarDay({ date: '2026-03-01', isCurrentMonth: true, isWeekend: true }),
        createCalendarDay({ date: '2026-03-02', isCurrentMonth: true }),
        createCalendarDay({ date: '2026-03-03', isCurrentMonth: true }),
        createCalendarDay({ date: '2026-03-04', isCurrentMonth: true }),
        createCalendarDay({ date: '2026-03-05', isCurrentMonth: true }),
        createCalendarDay({ date: '2026-03-06', isCurrentMonth: true }),
        createCalendarDay({ date: '2026-03-07', isCurrentMonth: true, isWeekend: true }),
      ]
      const week2 = [
        createCalendarDay({ date: '2026-03-08', isCurrentMonth: true, isWeekend: true }),
        createCalendarDay({ date: '2026-03-09', isCurrentMonth: true }),
        createCalendarDay({ date: '2026-03-10', isCurrentMonth: true }),
        createCalendarDay({ date: '2026-03-11', isCurrentMonth: true }),
        createCalendarDay({ date: '2026-03-12', isCurrentMonth: true }),
        createCalendarDay({ date: '2026-03-13', isCurrentMonth: true }),
        createCalendarDay({ date: '2026-03-14', isCurrentMonth: true, isWeekend: true }),
      ]

      render(
        <RecordsCalendarView
          calendarGrid={[week1, week2]}
          onEditRecord={vi.fn()}
          onAddRecord={vi.fn()}
        />,
      )

      // Check dates from both weeks are present
      expect(screen.getByText('03/01')).toBeInTheDocument()
      expect(screen.getByText('03/07')).toBeInTheDocument()
      expect(screen.getByText('03/08')).toBeInTheDocument()
      expect(screen.getByText('03/14')).toBeInTheDocument()
    })

    it('today cell on a weekend shows weekend style, not today badge', () => {
      // 2026-03-21 is Saturday - isWeekend=true, isToday=true
      const todayWeekend = createCalendarDay({
        date: '2026-03-21',
        isCurrentMonth: true,
        isWeekend: true,
        isToday: true,
        cells: [],
      })

      render(
        <RecordsCalendarView
          calendarGrid={createTestGrid([todayWeekend])}
          onEditRecord={vi.fn()}
          onAddRecord={vi.fn()}
        />,
      )

      // Weekend takes precedence for current month weekends - shows "\u4f11"
      expect(screen.getByText('\u4f11')).toBeInTheDocument()
    })
  })
})
