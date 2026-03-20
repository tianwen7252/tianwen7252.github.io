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
  // 1. Renders employee names in header
  // --------------------------------------------------------
  describe('header rendering', () => {
    it('renders employee names in the header', () => {
      const dayRows: readonly DayRow[] = []
      render(
        <RecordsTableView
          dayRows={dayRows}
          employees={[emp1, emp2]}
          onCellClick={vi.fn()}
        />,
      )
      expect(screen.getByText('Ryan')).toBeInTheDocument()
      expect(screen.getByText('陳小明')).toBeInTheDocument()
    })

    // --------------------------------------------------------
    // 2. Renders employee avatars in header
    // --------------------------------------------------------
    it('renders employee avatars in the header', () => {
      render(
        <RecordsTableView
          dayRows={[]}
          employees={[emp1, emp2]}
          onCellClick={vi.fn()}
        />,
      )
      const avatars = screen.getAllByTestId('avatar-image')
      expect(avatars).toHaveLength(2)
    })

    // --------------------------------------------------------
    // 3. Renders date column header
    // --------------------------------------------------------
    it('renders the date column header with text "日期"', () => {
      render(
        <RecordsTableView
          dayRows={[]}
          employees={[emp1]}
          onCellClick={vi.fn()}
        />,
      )
      expect(screen.getByText('日期')).toBeInTheDocument()
    })

    // --------------------------------------------------------
    // 12. Multiple employees render correct number of header columns
    // --------------------------------------------------------
    it('renders correct number of header columns for multiple employees', () => {
      const emp3 = mockEmployee(3, '王大明')
      render(
        <RecordsTableView
          dayRows={[]}
          employees={[emp1, emp2, emp3]}
          onCellClick={vi.fn()}
        />,
      )
      // 1 date column + 3 employee columns = 4 <th> elements
      const headerRow = screen.getByText('日期').closest('tr')!
      const headerCells = within(headerRow).getAllByRole('columnheader')
      expect(headerCells).toHaveLength(4)
    })
  })

  // --------------------------------------------------------
  // 4. Renders date rows in correct order
  // --------------------------------------------------------
  describe('date row rendering', () => {
    it('renders date rows with correct displayDate', () => {
      // 2026-03-20 is Friday, 2026-03-19 is Thursday
      const rows: readonly DayRow[] = [
        createDayRow({
          date: '2026-03-20',
          cells: [{ employee: emp1, attendance: undefined }],
        }),
        createDayRow({
          date: '2026-03-19',
          cells: [{ employee: emp1, attendance: undefined }],
        }),
      ]

      render(
        <RecordsTableView
          dayRows={rows}
          employees={[emp1]}
          onCellClick={vi.fn()}
        />,
      )

      expect(screen.getByText('03/20 (五)')).toBeInTheDocument()
      expect(screen.getByText('03/19 (四)')).toBeInTheDocument()

      // Verify order: first row is 03/20 (newest), second is 03/19
      const allRows = screen.getAllByRole('row')
      // allRows[0] = header, allRows[1] = first data row, allRows[2] = second data row
      expect(within(allRows[1]).getByText('03/20 (五)')).toBeInTheDocument()
      expect(within(allRows[2]).getByText('03/19 (四)')).toBeInTheDocument()
    })
  })

  // --------------------------------------------------------
  // 5. Normal attendance shows clock times
  // --------------------------------------------------------
  describe('cell display types', () => {
    it('shows clock-in and clock-out times for normal attendance', () => {
      const clockIn = dayjs('2026-03-20 08:30').valueOf()
      const clockOut = dayjs('2026-03-20 18:00').valueOf()
      const att = mockAttendance(1, '2026-03-20', clockIn, clockOut)

      const rows: readonly DayRow[] = [
        createDayRow({
          date: '2026-03-20',
          cells: [{ employee: emp1, attendance: att }],
        }),
      ]

      render(
        <RecordsTableView
          dayRows={rows}
          employees={[emp1]}
          onCellClick={vi.fn()}
        />,
      )

      expect(screen.getByText(/08:30/)).toBeInTheDocument()
      expect(screen.getByText(/18:00/)).toBeInTheDocument()
    })

    // --------------------------------------------------------
    // 6. Clock-in only shows time with ??:??
    // --------------------------------------------------------
    it('shows clock-in time with ??:?? when clock-out is missing', () => {
      const clockIn = dayjs('2026-03-20 09:05').valueOf()
      const att = mockAttendance(1, '2026-03-20', clockIn, undefined)

      const rows: readonly DayRow[] = [
        createDayRow({
          date: '2026-03-20',
          cells: [{ employee: emp1, attendance: att }],
        }),
      ]

      render(
        <RecordsTableView
          dayRows={rows}
          employees={[emp1]}
          onCellClick={vi.fn()}
        />,
      )

      expect(screen.getByText(/09:05/)).toBeInTheDocument()
      expect(screen.getByText(/\?\?:\?\?/)).toBeInTheDocument()
    })

    // --------------------------------------------------------
    // 7. No record shows 未打卡
    // --------------------------------------------------------
    it('shows 未打卡 when there is no attendance record', () => {
      const rows: readonly DayRow[] = [
        createDayRow({
          date: '2026-03-20',
          cells: [{ employee: emp1, attendance: undefined }],
        }),
      ]

      render(
        <RecordsTableView
          dayRows={rows}
          employees={[emp1]}
          onCellClick={vi.fn()}
        />,
      )

      expect(screen.getByText('未打卡')).toBeInTheDocument()
    })

    // --------------------------------------------------------
    // 8. Vacation shows 休假 label
    // --------------------------------------------------------
    it('shows 休假 label for vacation attendance', () => {
      const att = mockAttendance(1, '2026-03-20', undefined, undefined, 'vacation')

      const rows: readonly DayRow[] = [
        createDayRow({
          date: '2026-03-20',
          cells: [{ employee: emp1, attendance: att }],
        }),
      ]

      render(
        <RecordsTableView
          dayRows={rows}
          employees={[emp1]}
          onCellClick={vi.fn()}
        />,
      )

      expect(screen.getByText('休假')).toBeInTheDocument()
    })
  })

  // --------------------------------------------------------
  // 9. Weekend rows show 非工作日
  // --------------------------------------------------------
  describe('weekend rows', () => {
    it('shows 非工作日 text for weekend rows', () => {
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
          onCellClick={vi.fn()}
        />,
      )

      expect(screen.getByText('非工作日')).toBeInTheDocument()
    })

    it('renders weekend row with colSpan matching employee count', () => {
      // 2026-03-22 is Sunday
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
          onCellClick={vi.fn()}
        />,
      )

      // The colSpan cell should span all employee columns
      const weekendCell = container.querySelector('td[colspan]')
      expect(weekendCell).not.toBeNull()
      expect(weekendCell!.getAttribute('colspan')).toBe('2')
    })
  })

  // --------------------------------------------------------
  // 10. Cell click calls onCellClick with correct args
  // --------------------------------------------------------
  describe('cell click interactions', () => {
    it('calls onCellClick with correct employee, date, and attendance', () => {
      const onCellClick = vi.fn()
      const clockIn = dayjs('2026-03-20 08:30').valueOf()
      const clockOut = dayjs('2026-03-20 18:00').valueOf()
      const att = mockAttendance(1, '2026-03-20', clockIn, clockOut)

      const rows: readonly DayRow[] = [
        createDayRow({
          date: '2026-03-20',
          cells: [{ employee: emp1, attendance: att }],
        }),
      ]

      render(
        <RecordsTableView
          dayRows={rows}
          employees={[emp1]}
          onCellClick={onCellClick}
        />,
      )

      // Click the cell with time display
      const timeCell = screen.getByText(/08:30/).closest('td')!
      fireEvent.click(timeCell)

      expect(onCellClick).toHaveBeenCalledTimes(1)
      expect(onCellClick).toHaveBeenCalledWith(emp1, '2026-03-20', att)
    })

    // --------------------------------------------------------
    // 11. Empty cell click calls onCellClick with undefined attendance
    // --------------------------------------------------------
    it('calls onCellClick with undefined attendance when no record exists', () => {
      const onCellClick = vi.fn()

      const rows: readonly DayRow[] = [
        createDayRow({
          date: '2026-03-20',
          cells: [{ employee: emp1, attendance: undefined }],
        }),
      ]

      render(
        <RecordsTableView
          dayRows={rows}
          employees={[emp1]}
          onCellClick={onCellClick}
        />,
      )

      // Click the cell with 未打卡
      const noRecordCell = screen.getByText('未打卡').closest('td')!
      fireEvent.click(noRecordCell)

      expect(onCellClick).toHaveBeenCalledTimes(1)
      expect(onCellClick).toHaveBeenCalledWith(emp1, '2026-03-20', undefined)
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
          onCellClick={vi.fn()}
        />,
      )

      const tbody = container.querySelector('tbody')!
      expect(tbody.children).toHaveLength(0)
    })

    it('renders only date column header when employees is empty', () => {
      const { container } = render(
        <RecordsTableView
          dayRows={[]}
          employees={[]}
          onCellClick={vi.fn()}
        />,
      )

      const headerRow = screen.getByText('日期').closest('tr')!
      const headerCells = within(headerRow).getAllByRole('columnheader')
      expect(headerCells).toHaveLength(1) // only date column
    })

    it('handles multiple employees across multiple date rows', () => {
      const clockIn1 = dayjs('2026-03-20 08:00').valueOf()
      const clockOut1 = dayjs('2026-03-20 17:00').valueOf()
      const clockIn2 = dayjs('2026-03-20 09:00').valueOf()

      const att1 = mockAttendance(1, '2026-03-20', clockIn1, clockOut1)
      const att2 = mockAttendance(2, '2026-03-20', clockIn2, undefined)

      const rows: readonly DayRow[] = [
        createDayRow({
          date: '2026-03-20',
          cells: [
            { employee: emp1, attendance: att1 },
            { employee: emp2, attendance: att2 },
          ],
        }),
      ]

      render(
        <RecordsTableView
          dayRows={rows}
          employees={[emp1, emp2]}
          onCellClick={vi.fn()}
        />,
      )

      // emp1 normal attendance
      expect(screen.getByText(/08:00/)).toBeInTheDocument()
      expect(screen.getByText(/17:00/)).toBeInTheDocument()
      // emp2 clock-in only
      expect(screen.getByText(/09:00/)).toBeInTheDocument()
    })

    it('renders Chinese characters in employee names correctly', () => {
      const chineseEmp = mockEmployee(10, '李大華')
      render(
        <RecordsTableView
          dayRows={[]}
          employees={[chineseEmp]}
          onCellClick={vi.fn()}
        />,
      )

      expect(screen.getByText('李大華')).toBeInTheDocument()
    })
  })
})
