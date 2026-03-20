import { render, screen, fireEvent, within } from '@testing-library/react'
import { describe, it, expect, vi, beforeAll } from 'vitest'
import dayjs from 'dayjs'
import React from 'react'
import type { DayRow } from '../recordsUtils'

// Mock AvatarImage to simplify rendering
vi.mock('src/components/AvatarImage', () => ({
  AvatarImage: ({ avatar, size }: { avatar?: string; size?: number }) => (
    <img
      data-testid="avatar-image"
      src={avatar ?? 'fallback'}
      alt="avatar"
      style={{ width: size, height: size }}
    />
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
const emp2 = mockEmployee(2, '陳小明')

function createDayRow(overrides: Partial<DayRow> & { date: string }): DayRow {
  const d = dayjs(overrides.date)
  return {
    displayDate: `${d.format('MM/DD')} (${['日', '一', '二', '三', '四', '五', '六'][d.day()]})`,
    dayOfWeek: d.day(),
    isWeekend: d.day() === 0 || d.day() === 6,
    isToday: false,
    cells: [],
    ...overrides,
  }
}

// Lazily import component after mocks are set up
let RecordsTableView: React.FC<any>

beforeAll(async () => {
  const mod = await import('../RecordsTableView')
  RecordsTableView = mod.RecordsTableView
})

describe('RecordsTableView', () => {
  // --------------------------------------------------------
  // Header rendering
  // --------------------------------------------------------
  describe('header rendering', () => {
    it('renders employee names in the header', () => {
      render(
        <RecordsTableView
          dayRows={[]}
          employees={[emp1, emp2]}
          onEditRecord={vi.fn()}
          onAddRecord={vi.fn()}
        />,
      )
      expect(screen.getByText('Ryan')).toBeInTheDocument()
      expect(screen.getByText('陳小明')).toBeInTheDocument()
    })

    it('renders employee avatars in the header', () => {
      render(
        <RecordsTableView
          dayRows={[]}
          employees={[emp1, emp2]}
          onEditRecord={vi.fn()}
          onAddRecord={vi.fn()}
        />,
      )
      const avatars = screen.getAllByTestId('avatar-image')
      expect(avatars).toHaveLength(2)
    })

    it('renders the date column header with text "日期"', () => {
      render(
        <RecordsTableView
          dayRows={[]}
          employees={[emp1]}
          onEditRecord={vi.fn()}
          onAddRecord={vi.fn()}
        />,
      )
      expect(screen.getByText('日期')).toBeInTheDocument()
    })

    it('renders correct number of header columns for multiple employees', () => {
      const emp3 = mockEmployee(3, '王大明')
      render(
        <RecordsTableView
          dayRows={[]}
          employees={[emp1, emp2, emp3]}
          onEditRecord={vi.fn()}
          onAddRecord={vi.fn()}
        />,
      )
      // 1 date column + 3 employee columns = 4 <th> elements
      const headerRow = screen.getByText('日期').closest('tr')!
      const headerCells = within(headerRow).getAllByRole('columnheader')
      expect(headerCells).toHaveLength(4)
    })
  })

  // --------------------------------------------------------
  // Date row rendering
  // --------------------------------------------------------
  describe('date row rendering', () => {
    it('renders date rows with correct displayDate', () => {
      const rows: readonly DayRow[] = [
        createDayRow({
          date: '2026-03-20',
          cells: [{ employee: emp1, attendances: [] }],
        }),
        createDayRow({
          date: '2026-03-19',
          cells: [{ employee: emp1, attendances: [] }],
        }),
      ]

      render(
        <RecordsTableView
          dayRows={rows}
          employees={[emp1]}
          onEditRecord={vi.fn()}
          onAddRecord={vi.fn()}
        />,
      )

      expect(screen.getByText('03/20 (五)')).toBeInTheDocument()
      expect(screen.getByText('03/19 (四)')).toBeInTheDocument()
    })
  })

  // --------------------------------------------------------
  // Cell display: card-styled cells with multi-shift
  // --------------------------------------------------------
  describe('cell display types (card-styled)', () => {
    it('shows clock-in and clock-out times in a card for normal attendance', () => {
      const clockIn = dayjs('2026-03-20 08:30').valueOf()
      const clockOut = dayjs('2026-03-20 18:00').valueOf()
      const att = mockAttendance(1, '2026-03-20', clockIn, clockOut)

      const rows: readonly DayRow[] = [
        createDayRow({
          date: '2026-03-20',
          cells: [{ employee: emp1, attendances: [att] }],
        }),
      ]

      render(
        <RecordsTableView
          dayRows={rows}
          employees={[emp1]}
          onEditRecord={vi.fn()}
          onAddRecord={vi.fn()}
        />,
      )

      expect(screen.getByText(/08:30/)).toBeInTheDocument()
      expect(screen.getByText(/18:00/)).toBeInTheDocument()
    })

    it('shows clock-in time with ??:?? when clock-out is missing', () => {
      const clockIn = dayjs('2026-03-20 09:05').valueOf()
      const att = mockAttendance(1, '2026-03-20', clockIn, undefined)

      const rows: readonly DayRow[] = [
        createDayRow({
          date: '2026-03-20',
          cells: [{ employee: emp1, attendances: [att] }],
        }),
      ]

      render(
        <RecordsTableView
          dayRows={rows}
          employees={[emp1]}
          onEditRecord={vi.fn()}
          onAddRecord={vi.fn()}
        />,
      )

      expect(screen.getByText(/09:05/)).toBeInTheDocument()
      expect(screen.getByText(/\?\?:\?\?/)).toBeInTheDocument()
    })

    it('shows 未打卡 when there are no attendance records', () => {
      const rows: readonly DayRow[] = [
        createDayRow({
          date: '2026-03-20',
          cells: [{ employee: emp1, attendances: [] }],
        }),
      ]

      render(
        <RecordsTableView
          dayRows={rows}
          employees={[emp1]}
          onEditRecord={vi.fn()}
          onAddRecord={vi.fn()}
        />,
      )

      expect(screen.getByText('未打卡')).toBeInTheDocument()
    })

    it('shows 休假 label for vacation attendance', () => {
      const att = mockAttendance(1, '2026-03-20', undefined, undefined, 'vacation')

      const rows: readonly DayRow[] = [
        createDayRow({
          date: '2026-03-20',
          cells: [{ employee: emp1, attendances: [att] }],
        }),
      ]

      render(
        <RecordsTableView
          dayRows={rows}
          employees={[emp1]}
          onEditRecord={vi.fn()}
          onAddRecord={vi.fn()}
        />,
      )

      expect(screen.getByText('休假')).toBeInTheDocument()
    })

    it('renders multiple cards for multi-shift attendance', () => {
      const clockIn1 = dayjs('2026-03-20 08:00').valueOf()
      const clockOut1 = dayjs('2026-03-20 12:00').valueOf()
      const clockIn2 = dayjs('2026-03-20 14:00').valueOf()
      const clockOut2 = dayjs('2026-03-20 18:00').valueOf()
      const att1 = mockAttendance(1, '2026-03-20', clockIn1, clockOut1, 'regular', 101)
      const att2 = mockAttendance(1, '2026-03-20', clockIn2, clockOut2, 'regular', 102)

      const rows: readonly DayRow[] = [
        createDayRow({
          date: '2026-03-20',
          cells: [{ employee: emp1, attendances: [att1, att2] }],
        }),
      ]

      render(
        <RecordsTableView
          dayRows={rows}
          employees={[emp1]}
          onEditRecord={vi.fn()}
          onAddRecord={vi.fn()}
        />,
      )

      // Both time ranges should be visible
      expect(screen.getByText(/08:00/)).toBeInTheDocument()
      expect(screen.getByText(/12:00/)).toBeInTheDocument()
      expect(screen.getByText(/14:00/)).toBeInTheDocument()
      expect(screen.getByText(/18:00/)).toBeInTheDocument()
    })
  })

  // --------------------------------------------------------
  // Weekend rows
  // --------------------------------------------------------
  describe('weekend rows', () => {
    it('shows "休" text for weekend rows (not "非工作日")', () => {
      // 2026-03-21 is Saturday
      const rows: readonly DayRow[] = [
        createDayRow({
          date: '2026-03-21',
          isWeekend: true,
          cells: [],
        }),
      ]

      render(
        <RecordsTableView
          dayRows={rows}
          employees={[emp1, emp2]}
          onEditRecord={vi.fn()}
          onAddRecord={vi.fn()}
        />,
      )

      expect(screen.getByText('休')).toBeInTheDocument()
      expect(screen.queryByText('非工作日')).not.toBeInTheDocument()
    })

    it('renders weekend row with colSpan matching employee count', () => {
      const rows: readonly DayRow[] = [
        createDayRow({
          date: '2026-03-22',
          isWeekend: true,
          cells: [],
        }),
      ]

      const { container } = render(
        <RecordsTableView
          dayRows={rows}
          employees={[emp1, emp2]}
          onEditRecord={vi.fn()}
          onAddRecord={vi.fn()}
        />,
      )

      const weekendCell = container.querySelector('td[colspan]')
      expect(weekendCell).not.toBeNull()
      expect(weekendCell!.getAttribute('colspan')).toBe('2')
    })
  })

  // --------------------------------------------------------
  // Click interactions: separate card click (edit) vs td click (add)
  // --------------------------------------------------------
  describe('click interactions', () => {
    it('calls onEditRecord when clicking a card (existing attendance)', () => {
      const onEditRecord = vi.fn()
      const onAddRecord = vi.fn()
      const clockIn = dayjs('2026-03-20 08:30').valueOf()
      const clockOut = dayjs('2026-03-20 18:00').valueOf()
      const att = mockAttendance(1, '2026-03-20', clockIn, clockOut)

      const rows: readonly DayRow[] = [
        createDayRow({
          date: '2026-03-20',
          cells: [{ employee: emp1, attendances: [att] }],
        }),
      ]

      render(
        <RecordsTableView
          dayRows={rows}
          employees={[emp1]}
          onEditRecord={onEditRecord}
          onAddRecord={onAddRecord}
        />,
      )

      // Click the card (the div with time text), not the td
      const card = screen.getByText(/08:30/).closest('[role="button"]')!
      fireEvent.click(card)

      expect(onEditRecord).toHaveBeenCalledTimes(1)
      expect(onEditRecord).toHaveBeenCalledWith(emp1, '2026-03-20', att)
      // onAddRecord should NOT be called (stopPropagation)
      expect(onAddRecord).not.toHaveBeenCalled()
    })

    it('calls onAddRecord when clicking the empty area of a td (outside card)', () => {
      const onEditRecord = vi.fn()
      const onAddRecord = vi.fn()

      const rows: readonly DayRow[] = [
        createDayRow({
          date: '2026-03-20',
          cells: [{ employee: emp1, attendances: [] }],
        }),
      ]

      render(
        <RecordsTableView
          dayRows={rows}
          employees={[emp1]}
          onEditRecord={onEditRecord}
          onAddRecord={onAddRecord}
        />,
      )

      // Click the td directly (empty cell, "未打卡")
      const td = screen.getByText('未打卡').closest('td')!
      fireEvent.click(td)

      expect(onAddRecord).toHaveBeenCalledTimes(1)
      expect(onAddRecord).toHaveBeenCalledWith(emp1, '2026-03-20')
      expect(onEditRecord).not.toHaveBeenCalled()
    })

    it('calls onAddRecord with keyboard Enter on empty td', () => {
      const onAddRecord = vi.fn()

      const rows: readonly DayRow[] = [
        createDayRow({
          date: '2026-03-20',
          cells: [{ employee: emp1, attendances: [] }],
        }),
      ]

      render(
        <RecordsTableView
          dayRows={rows}
          employees={[emp1]}
          onEditRecord={vi.fn()}
          onAddRecord={onAddRecord}
        />,
      )

      const td = screen.getByText('未打卡').closest('td')!
      fireEvent.keyDown(td, { key: 'Enter' })

      expect(onAddRecord).toHaveBeenCalledTimes(1)
    })

    it('calls onEditRecord with keyboard Enter on card', () => {
      const onEditRecord = vi.fn()
      const clockIn = dayjs('2026-03-20 08:30').valueOf()
      const att = mockAttendance(1, '2026-03-20', clockIn, undefined)

      const rows: readonly DayRow[] = [
        createDayRow({
          date: '2026-03-20',
          cells: [{ employee: emp1, attendances: [att] }],
        }),
      ]

      render(
        <RecordsTableView
          dayRows={rows}
          employees={[emp1]}
          onEditRecord={onEditRecord}
          onAddRecord={vi.fn()}
        />,
      )

      const card = screen.getByText(/08:30/).closest('[role="button"]')!
      fireEvent.keyDown(card, { key: 'Enter' })

      expect(onEditRecord).toHaveBeenCalledTimes(1)
      expect(onEditRecord).toHaveBeenCalledWith(emp1, '2026-03-20', att)
    })

    it('clicking a card in multi-shift cell passes the correct record', () => {
      const onEditRecord = vi.fn()
      const clockIn1 = dayjs('2026-03-20 08:00').valueOf()
      const clockOut1 = dayjs('2026-03-20 12:00').valueOf()
      const clockIn2 = dayjs('2026-03-20 14:00').valueOf()
      const clockOut2 = dayjs('2026-03-20 18:00').valueOf()
      const att1 = mockAttendance(1, '2026-03-20', clockIn1, clockOut1, 'regular', 101)
      const att2 = mockAttendance(1, '2026-03-20', clockIn2, clockOut2, 'regular', 102)

      const rows: readonly DayRow[] = [
        createDayRow({
          date: '2026-03-20',
          cells: [{ employee: emp1, attendances: [att1, att2] }],
        }),
      ]

      render(
        <RecordsTableView
          dayRows={rows}
          employees={[emp1]}
          onEditRecord={onEditRecord}
          onAddRecord={vi.fn()}
        />,
      )

      // Click the second card (14:00)
      const secondCard = screen.getByText(/14:00/).closest('[role="button"]')!
      fireEvent.click(secondCard)

      expect(onEditRecord).toHaveBeenCalledWith(emp1, '2026-03-20', att2)
    })
  })

  // --------------------------------------------------------
  // Today row marking
  // --------------------------------------------------------
  describe('today row marking', () => {
    it('marks the today row with data-today attribute', () => {
      const rows: readonly DayRow[] = [
        createDayRow({
          date: '2026-03-20',
          isToday: true,
          cells: [{ employee: emp1, attendances: [] }],
        }),
      ]

      const { container } = render(
        <RecordsTableView
          dayRows={rows}
          employees={[emp1]}
          onEditRecord={vi.fn()}
          onAddRecord={vi.fn()}
          todayDate="2026-03-20"
        />,
      )

      const todayRow = container.querySelector('[data-today="true"]')
      expect(todayRow).not.toBeNull()
    })

    it('does not add data-today to non-today rows', () => {
      const rows: readonly DayRow[] = [
        createDayRow({
          date: '2026-03-19',
          cells: [{ employee: emp1, attendances: [] }],
        }),
      ]

      const { container } = render(
        <RecordsTableView
          dayRows={rows}
          employees={[emp1]}
          onEditRecord={vi.fn()}
          onAddRecord={vi.fn()}
          todayDate="2026-03-20"
        />,
      )

      const todayRow = container.querySelector('[data-today="true"]')
      expect(todayRow).toBeNull()
    })
  })

  // --------------------------------------------------------
  // Accessibility
  // --------------------------------------------------------
  describe('accessibility', () => {
    it('empty td has aria-label with "新增" suffix', () => {
      const rows: readonly DayRow[] = [
        createDayRow({
          date: '2026-03-20',
          cells: [{ employee: emp1, attendances: [] }],
        }),
      ]

      render(
        <RecordsTableView
          dayRows={rows}
          employees={[emp1]}
          onEditRecord={vi.fn()}
          onAddRecord={vi.fn()}
        />,
      )

      const td = screen.getByText('未打卡').closest('td')!
      expect(td.getAttribute('aria-label')).toContain('新增')
      expect(td.getAttribute('aria-label')).toContain('Ryan')
    })

    it('cards have role="button" and tabIndex=0', () => {
      const clockIn = dayjs('2026-03-20 08:30').valueOf()
      const att = mockAttendance(1, '2026-03-20', clockIn, undefined)

      const rows: readonly DayRow[] = [
        createDayRow({
          date: '2026-03-20',
          cells: [{ employee: emp1, attendances: [att] }],
        }),
      ]

      render(
        <RecordsTableView
          dayRows={rows}
          employees={[emp1]}
          onEditRecord={vi.fn()}
          onAddRecord={vi.fn()}
        />,
      )

      const card = screen.getByText(/08:30/).closest('[role="button"]')!
      expect(card.getAttribute('tabindex')).toBe('0')
    })
  })

  // --------------------------------------------------------
  // Edge cases
  // --------------------------------------------------------
  describe('edge cases', () => {
    it('renders empty table body when dayRows is empty', () => {
      const { container } = render(
        <RecordsTableView
          dayRows={[]}
          employees={[emp1]}
          onEditRecord={vi.fn()}
          onAddRecord={vi.fn()}
        />,
      )

      const tbody = container.querySelector('tbody')!
      expect(tbody.children).toHaveLength(0)
    })

    it('renders only date column header when employees is empty', () => {
      render(
        <RecordsTableView
          dayRows={[]}
          employees={[]}
          onEditRecord={vi.fn()}
          onAddRecord={vi.fn()}
        />,
      )

      const headerRow = screen.getByText('日期').closest('tr')!
      const headerCells = within(headerRow).getAllByRole('columnheader')
      expect(headerCells).toHaveLength(1)
    })

    it('handles Chinese characters in employee names correctly', () => {
      const chineseEmp = mockEmployee(10, '李大華')
      render(
        <RecordsTableView
          dayRows={[]}
          employees={[chineseEmp]}
          onEditRecord={vi.fn()}
          onAddRecord={vi.fn()}
        />,
      )

      expect(screen.getByText('李大華')).toBeInTheDocument()
    })
  })
})
