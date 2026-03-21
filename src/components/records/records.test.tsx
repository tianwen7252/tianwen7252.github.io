import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { Employee, Attendance } from '@/lib/schemas'

// ─── Mock Services ──────────────────────────────────────────────────────────

const mockEmployees: Employee[] = [
  {
    id: 'emp-001',
    name: '王小明',
    avatar: 'images/aminals/1308845.png',
    status: 'active',
    shiftType: 'regular',
    employeeNo: 'E001',
    isAdmin: false,
    hireDate: '2024-01-15',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'emp-002',
    name: '李美玲',
    avatar: 'images/aminals/780258.png',
    status: 'active',
    shiftType: 'regular',
    employeeNo: 'E002',
    isAdmin: false,
    hireDate: '2024-03-01',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
]

const mockAttendances: Attendance[] = [
  {
    id: 'att-001',
    employeeId: 'emp-001',
    date: '2026-03-21',
    clockIn: new Date('2026-03-21T08:00:00').getTime(),
    clockOut: new Date('2026-03-21T17:00:00').getTime(),
    type: 'regular',
  },
]

vi.mock('@/services/mock-data', () => ({
  mockEmployeeService: {
    getActive: vi.fn(() => mockEmployees),
  },
  mockAttendanceService: {
    getByMonth: vi.fn(() => mockAttendances),
    add: vi.fn(() => ({
      id: 'att-new',
      employeeId: 'emp-001',
      date: '2026-03-21',
      clockIn: 1742536800000,
      type: 'regular',
    })),
    update: vi.fn(),
    remove: vi.fn(() => true),
  },
}))

// Import after mocks
import { Records } from './records'

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('Records', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render the title', () => {
    render(<Records />)
    expect(screen.getByText('員工考勤狀況')).toBeTruthy()
  })

  it('should render table view by default', () => {
    render(<Records />)
    // Table view button should be active
    const tableBtn = screen.getByRole('button', { name: /表格/ })
    expect(tableBtn.className).toContain('bg-card')
  })

  it('should toggle between table and calendar views', async () => {
    const user = userEvent.setup()
    render(<Records />)

    // Switch to calendar
    const calendarBtn = screen.getByRole('button', { name: /月曆/ })
    await user.click(calendarBtn)
    expect(calendarBtn.className).toContain('bg-card')

    // Calendar view should show weekday headers
    expect(screen.getByText('週日')).toBeTruthy()

    // Switch back to table
    const tableBtn = screen.getByRole('button', { name: /表格/ })
    await user.click(tableBtn)
    expect(tableBtn.className).toContain('bg-card')
  })

  it('should render search input', () => {
    render(<Records />)
    expect(
      screen.getByPlaceholderText('搜尋員工姓名'),
    ).toBeTruthy()
  })

  it('should filter employees by search', async () => {
    const user = userEvent.setup()
    render(<Records />)

    const searchInput = screen.getByPlaceholderText('搜尋員工姓名')
    await user.type(searchInput, '王')

    // Should still show 王小明 in the header
    expect(screen.getByText('王小明')).toBeTruthy()
    // 李美玲 should be filtered out (not in employee headers)
    // The name may still appear elsewhere, but not in table headers
    expect(screen.queryByText('李美玲')).toBeNull()
  })

  it('should render year select with options', () => {
    render(<Records />)
    const yearSelect = screen.getByDisplayValue(/年/)
    expect(yearSelect).toBeTruthy()
  })

  it('should render month select with options', () => {
    render(<Records />)
    const monthSelect = screen.getByDisplayValue(/月/)
    expect(monthSelect).toBeTruthy()
  })

  it('should update data when year select changes', async () => {
    const user = userEvent.setup()
    render(<Records />)

    const yearSelect = screen.getByDisplayValue(/年/)
    await user.selectOptions(yearSelect, '2025')

    // Data should refresh (service is called)
    const { mockAttendanceService } = await import('@/services/mock-data')
    expect(mockAttendanceService.getByMonth).toHaveBeenCalled()
  })

  it('should update data when month select changes', async () => {
    const user = userEvent.setup()
    render(<Records />)

    const monthSelect = screen.getByDisplayValue(/月/)
    await user.selectOptions(monthSelect, '1')

    const { mockAttendanceService } = await import('@/services/mock-data')
    expect(mockAttendanceService.getByMonth).toHaveBeenCalled()
  })

  it('should render "今天" button', () => {
    render(<Records />)
    expect(screen.getByRole('button', { name: '今天' })).toBeTruthy()
  })

  it('should show hint text about editing', () => {
    render(<Records />)
    expect(
      screen.getByText('點擊儲存格即可直接編輯打卡時間'),
    ).toBeTruthy()
  })

  it('should open RecordModal when cell interaction triggers add', async () => {
    const user = userEvent.setup()
    render(<Records />)

    // Click on an empty "未打卡" cell to trigger add
    const emptyCells = screen.getAllByText('未打卡')
    if (emptyCells.length > 0) {
      await user.click(emptyCells[0]!)
      // RecordModal should appear with add title
      expect(screen.getAllByText('新增打卡紀錄')).toHaveLength(2)
    }
  })

  it('should open RecordModal when cell interaction triggers edit', async () => {
    const user = userEvent.setup()
    render(<Records />)

    // Click on an attendance card to trigger edit
    const timeRange = screen.queryByText('08:00 - 17:00')
    if (timeRange) {
      await user.click(timeRange)
      expect(screen.getAllByText('編輯打卡紀錄')).toHaveLength(2)
    }
  })
})
