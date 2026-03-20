import { render, screen, fireEvent, within } from '@testing-library/react'
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
): RestaDB.Table.Attendance => ({
  id: employeeId * 100,
  employeeId,
  date,
  clockIn,
  clockOut,
  type: (type ?? 'regular') as any,
})

const emp1 = mockEmployee(1, 'Ryan')
const emp2 = mockEmployee(2, '陳小明')

// Helper to create a CalendarDay with sensible defaults
function createCalendarDay(
  overrides: Partial<CalendarDay> & { date: string },
): CalendarDay {
  const d = dayjs(overrides.date)
  return {
    displayDate: `${d.format('MM/DD')} (${['日', '一', '二', '三', '四', '五', '六'][d.day()]})`,
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
          onCellClick={vi.fn()}
        />,
      )

      const expectedLabels = ['週日', '週一', '週二', '週三', '週四', '週五', '週六']
      for (const label of expectedLabels) {
        expect(screen.getByText(label)).toBeInTheDocument()
      }
    })
  })

  // --------------------------------------------------------
  // 2. Weekend cells show "休" text
  // --------------------------------------------------------
  describe('weekend cells', () => {
    it('shows "休" text for Saturday in current month', () => {
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
          onCellClick={vi.fn()}
        />,
      )

      expect(screen.getByText('休')).toBeInTheDocument()
    })

    it('shows "休" text for Sunday in current month', () => {
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
          onCellClick={vi.fn()}
        />,
      )

      expect(screen.getByText('休')).toBeInTheDocument()
    })
  })

  // --------------------------------------------------------
  // 3. Today cell shows "今日" badge
  // --------------------------------------------------------
  describe('today badge', () => {
    it('shows "今日" badge for today cell', () => {
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
          onCellClick={vi.fn()}
        />,
      )

      expect(screen.getByText('今日')).toBeInTheDocument()
    })

    it('does not show "今日" badge for non-today cell', () => {
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
          onCellClick={vi.fn()}
        />,
      )

      expect(screen.queryByText('今日')).not.toBeInTheDocument()
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

      const { container } = render(
        <RecordsCalendarView
          calendarGrid={createTestGrid([outsideDay])}
          onCellClick={vi.fn()}
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
    it('shows employee name and clock-in/clock-out for normal attendance', () => {
      const clockIn = dayjs('2026-03-20 08:30').valueOf()
      const clockOut = dayjs('2026-03-20 18:00').valueOf()
      const att = mockAttendance(1, '2026-03-20', clockIn, clockOut)

      const day = createCalendarDay({
        date: '2026-03-20',
        isCurrentMonth: true,
        isWeekend: false,
        cells: [{ employee: emp1, attendance: att }],
      })

      render(
        <RecordsCalendarView
          calendarGrid={createTestGrid([day])}
          onCellClick={vi.fn()}
        />,
      )

      expect(screen.getByText('Ryan')).toBeInTheDocument()
      expect(screen.getByText('08:30')).toBeInTheDocument()
      expect(screen.getByText('18:00')).toBeInTheDocument()
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
        cells: [{ employee: emp1, attendance: att }],
      })

      render(
        <RecordsCalendarView
          calendarGrid={createTestGrid([day])}
          onCellClick={vi.fn()}
        />,
      )

      expect(screen.getByText('Ryan')).toBeInTheDocument()
      expect(screen.getByText('09:05')).toBeInTheDocument()
      expect(screen.getByText('??:??')).toBeInTheDocument()
    })

    // --------------------------------------------------------
    // 7. Vacation shows "休假" label
    // --------------------------------------------------------
    it('shows "休假" label for vacation attendance', () => {
      const att = mockAttendance(1, '2026-03-20', undefined, undefined, 'vacation')

      const day = createCalendarDay({
        date: '2026-03-20',
        isCurrentMonth: true,
        isWeekend: false,
        cells: [{ employee: emp1, attendance: att }],
      })

      render(
        <RecordsCalendarView
          calendarGrid={createTestGrid([day])}
          onCellClick={vi.fn()}
        />,
      )

      expect(screen.getByText('Ryan')).toBeInTheDocument()
      expect(screen.getByText('休假')).toBeInTheDocument()
    })

    // --------------------------------------------------------
    // 8. No record shows "未打卡" text
    // --------------------------------------------------------
    it('shows "未打卡" text when no attendance record', () => {
      const day = createCalendarDay({
        date: '2026-03-20',
        isCurrentMonth: true,
        isWeekend: false,
        cells: [{ employee: emp1, attendance: undefined }],
      })

      render(
        <RecordsCalendarView
          calendarGrid={createTestGrid([day])}
          onCellClick={vi.fn()}
        />,
      )

      expect(screen.getByText('Ryan')).toBeInTheDocument()
      expect(screen.getByText('未打卡')).toBeInTheDocument()
    })
  })

  // --------------------------------------------------------
  // 9. Employee card click fires onCellClick
  // --------------------------------------------------------
  describe('cell click interactions', () => {
    it('calls onCellClick with correct employee, date, and attendance', () => {
      const onCellClick = vi.fn()
      const clockIn = dayjs('2026-03-20 08:30').valueOf()
      const clockOut = dayjs('2026-03-20 18:00').valueOf()
      const att = mockAttendance(1, '2026-03-20', clockIn, clockOut)

      const day = createCalendarDay({
        date: '2026-03-20',
        isCurrentMonth: true,
        isWeekend: false,
        cells: [{ employee: emp1, attendance: att }],
      })

      render(
        <RecordsCalendarView
          calendarGrid={createTestGrid([day])}
          onCellClick={onCellClick}
        />,
      )

      // Click the employee card (find by role="button")
      const card = screen.getByText('Ryan').closest('[role="button"]')!
      fireEvent.click(card)

      expect(onCellClick).toHaveBeenCalledTimes(1)
      expect(onCellClick).toHaveBeenCalledWith(emp1, '2026-03-20', att)
    })

    it('calls onCellClick with undefined attendance for no-record card', () => {
      const onCellClick = vi.fn()

      const day = createCalendarDay({
        date: '2026-03-20',
        isCurrentMonth: true,
        isWeekend: false,
        cells: [{ employee: emp1, attendance: undefined }],
      })

      render(
        <RecordsCalendarView
          calendarGrid={createTestGrid([day])}
          onCellClick={onCellClick}
        />,
      )

      const card = screen.getByText('Ryan').closest('[role="button"]')!
      fireEvent.click(card)

      expect(onCellClick).toHaveBeenCalledTimes(1)
      expect(onCellClick).toHaveBeenCalledWith(emp1, '2026-03-20', undefined)
    })

    it('stopPropagation prevents parent click handlers from firing', () => {
      const onCellClick = vi.fn()
      const parentClick = vi.fn()

      const day = createCalendarDay({
        date: '2026-03-20',
        isCurrentMonth: true,
        isWeekend: false,
        cells: [{ employee: emp1, attendance: undefined }],
      })

      const { container } = render(
        <div onClick={parentClick}>
          <RecordsCalendarView
            calendarGrid={createTestGrid([day])}
            onCellClick={onCellClick}
          />
        </div>,
      )

      const card = screen.getByText('Ryan').closest('[role="button"]')!
      fireEvent.click(card)

      expect(onCellClick).toHaveBeenCalledTimes(1)
      expect(parentClick).not.toHaveBeenCalled()
    })
  })

  // --------------------------------------------------------
  // 10. Multiple employees in same day cell
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
          { employee: emp1, attendance: att1 },
          { employee: emp2, attendance: att2 },
        ],
      })

      render(
        <RecordsCalendarView
          calendarGrid={createTestGrid([day])}
          onCellClick={vi.fn()}
        />,
      )

      expect(screen.getByText('Ryan')).toBeInTheDocument()
      expect(screen.getByText('陳小明')).toBeInTheDocument()

      // emp1 has normal attendance
      expect(screen.getByText('08:30')).toBeInTheDocument()
      expect(screen.getByText('18:00')).toBeInTheDocument()

      // emp2 has clock-in only
      expect(screen.getByText('09:00')).toBeInTheDocument()
      expect(screen.getByText('??:??')).toBeInTheDocument()
    })

    it('fires onCellClick with correct employee when clicking specific card', () => {
      const onCellClick = vi.fn()
      const att1 = mockAttendance(1, '2026-03-20', undefined, undefined, 'vacation')

      const day = createCalendarDay({
        date: '2026-03-20',
        isCurrentMonth: true,
        isWeekend: false,
        cells: [
          { employee: emp1, attendance: att1 },
          { employee: emp2, attendance: undefined },
        ],
      })

      render(
        <RecordsCalendarView
          calendarGrid={createTestGrid([day])}
          onCellClick={onCellClick}
        />,
      )

      // Click the second employee card (陳小明)
      const card = screen.getByText('陳小明').closest('[role="button"]')!
      fireEvent.click(card)

      expect(onCellClick).toHaveBeenCalledTimes(1)
      expect(onCellClick).toHaveBeenCalledWith(emp2, '2026-03-20', undefined)
    })
  })

  // --------------------------------------------------------
  // 11. Outside-month days don't render employee cards
  // --------------------------------------------------------
  describe('outside-month cards', () => {
    it('does not render employee cards for outside-month days', () => {
      const outsideDay = createCalendarDay({
        date: '2026-02-28',
        isCurrentMonth: false,
        isWeekend: false,
        cells: [{ employee: emp1, attendance: undefined }],
      })

      render(
        <RecordsCalendarView
          calendarGrid={createTestGrid([outsideDay])}
          onCellClick={vi.fn()}
        />,
      )

      // Date label should exist
      expect(screen.getByText('02/28')).toBeInTheDocument()
      // But employee name should NOT be rendered
      expect(screen.queryByText('Ryan')).not.toBeInTheDocument()
    })
  })

  // --------------------------------------------------------
  // 12. Date labels show MM/DD format
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
          onCellClick={vi.fn()}
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
          onCellClick={vi.fn()}
        />,
      )

      expect(screen.getByText('01/02')).toBeInTheDocument()
    })
  })

  // --------------------------------------------------------
  // Edge cases
  // --------------------------------------------------------
  describe('edge cases', () => {
    it('renders empty calendar body when calendarGrid is empty', () => {
      const { container } = render(
        <RecordsCalendarView
          calendarGrid={[]}
          onCellClick={vi.fn()}
        />,
      )

      // Headers should still be present
      expect(screen.getByText('週一')).toBeInTheDocument()
      // But no day cells rendered — no date labels
      expect(screen.queryByText(/\d{2}\/\d{2}/)).not.toBeInTheDocument()
    })

    it('renders Chinese characters in employee names correctly', () => {
      const chineseEmp = mockEmployee(10, '李大華')

      const day = createCalendarDay({
        date: '2026-03-20',
        isCurrentMonth: true,
        isWeekend: false,
        cells: [{ employee: chineseEmp, attendance: undefined }],
      })

      render(
        <RecordsCalendarView
          calendarGrid={createTestGrid([day])}
          onCellClick={vi.fn()}
        />,
      )

      expect(screen.getByText('李大華')).toBeInTheDocument()
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
          onCellClick={vi.fn()}
        />,
      )

      // Check dates from both weeks are present
      expect(screen.getByText('03/01')).toBeInTheDocument()
      expect(screen.getByText('03/07')).toBeInTheDocument()
      expect(screen.getByText('03/08')).toBeInTheDocument()
      expect(screen.getByText('03/14')).toBeInTheDocument()
    })

    it('today cell on a weekend shows weekend style, not today badge', () => {
      // 2026-03-21 is Saturday — isWeekend=true, isToday=true
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
          onCellClick={vi.fn()}
        />,
      )

      // Weekend takes precedence for current month weekends — shows "休"
      expect(screen.getByText('休')).toBeInTheDocument()
    })
  })
})
