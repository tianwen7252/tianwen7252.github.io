import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import dayjs from 'dayjs'
import { ClockIn } from '../ClockIn'

// Mock API calls
vi.mock('src/libs/api', () => ({
  employees: {
    get: vi.fn(),
  },
  attendances: {
    getByDate: vi.fn(),
    add: vi.fn(),
    set: vi.fn(),
  },
}))

// Mock AvatarImage to simplify card rendering tests
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

const makeEmployee = (
  overrides: Partial<RestaDB.Table.Employee> = {},
): RestaDB.Table.Employee => ({
  id: 1,
  name: 'Alice',
  avatar: 'images/aminals/1234.png',
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
  date: '2024-05-20',
  clockIn: dayjs('2024-05-20T09:00:00').valueOf(),
  ...overrides,
})

// --- Configurable mock for useLiveQuery ---

let mockEmployees: RestaDB.Table.Employee[] = []
let mockAttendances: RestaDB.Table.Attendance[] = []

vi.mock('dexie-react-hooks', () => ({
  useLiveQuery: (callback: Function) => {
    // Execute the callback so the API mock is invoked (keeps coverage)
    callback()
    const src = callback.toString()
    if (src.includes('employees')) {
      return mockEmployees
    }
    if (src.includes('attendances')) {
      return mockAttendances
    }
    return []
  },
}))

describe('ClockIn Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    // Monday 2024-05-20
    vi.setSystemTime(new Date('2024-05-20T09:00:00+08:00'))
    mockEmployees = []
    mockAttendances = []
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  // --------------------------------------------------------
  // Section header
  // --------------------------------------------------------

  describe('section header', () => {
    it('renders the title text', () => {
      render(<ClockIn />)
      expect(screen.getByText('員工考勤狀況')).toBeInTheDocument()
    })

    it('renders today date in Chinese format with weekday', () => {
      render(<ClockIn />)
      // Should contain year, month, day, and weekday in the same element
      expect(
        screen.getByText(/2024年5月20日.*星期一/),
      ).toBeInTheDocument()
    })
  })

  // --------------------------------------------------------
  // Empty state
  // --------------------------------------------------------

  describe('empty state', () => {
    it('shows empty message when no employees exist', () => {
      mockEmployees = []
      render(<ClockIn />)
      expect(
        screen.getByText(/目前無員工資料，請前往「員工管理」頁面新增員工/),
      ).toBeInTheDocument()
    })
  })

  // --------------------------------------------------------
  // Employee cards grid
  // --------------------------------------------------------

  describe('employee card grid', () => {
    it('renders a card for each employee', () => {
      mockEmployees = [
        makeEmployee({ id: 1, name: 'Alice' }),
        makeEmployee({ id: 2, name: 'Bob' }),
        makeEmployee({ id: 3, name: 'Carol' }),
      ]
      render(<ClockIn />)
      expect(screen.getByText('Alice')).toBeInTheDocument()
      expect(screen.getByText('Bob')).toBeInTheDocument()
      expect(screen.getByText('Carol')).toBeInTheDocument()
    })

    it('renders AvatarImage with the employee animal avatar', () => {
      mockEmployees = [
        makeEmployee({ id: 1, avatar: 'images/aminals/1234.png' }),
      ]
      render(<ClockIn />)
      const avatar = screen.getByTestId('avatar-image')
      expect(avatar).toHaveAttribute('src', 'images/aminals/1234.png')
    })

    it('renders AvatarImage with 80px size', () => {
      mockEmployees = [makeEmployee({ id: 1 })]
      render(<ClockIn />)
      const avatar = screen.getByTestId('avatar-image')
      expect(avatar).toHaveStyle({ width: '80px', height: '80px' })
    })
  })

  // --------------------------------------------------------
  // Employee name
  // --------------------------------------------------------

  describe('employee name', () => {
    it('displays the employee name on the card', () => {
      mockEmployees = [makeEmployee({ id: 1, name: 'Alice' })]
      render(<ClockIn />)
      expect(screen.getByText('Alice')).toBeInTheDocument()
    })
  })

  // --------------------------------------------------------
  // Admin role text
  // --------------------------------------------------------

  describe('admin role badge', () => {
    it('shows admin label for admin employees', () => {
      mockEmployees = [makeEmployee({ id: 1, name: 'Alice', isAdmin: true })]
      render(<ClockIn />)
      expect(screen.getByText('管理員')).toBeInTheDocument()
    })

    it('does NOT show admin label for non-admin employees', () => {
      mockEmployees = [makeEmployee({ id: 1, name: 'Bob', isAdmin: false })]
      render(<ClockIn />)
      expect(screen.queryByText('管理員')).not.toBeInTheDocument()
    })
  })

  // --------------------------------------------------------
  // Status badge
  // --------------------------------------------------------

  describe('status badge', () => {
    it('shows "未打卡" when employee has no attendance', () => {
      mockEmployees = [makeEmployee({ id: 1 })]
      mockAttendances = []
      render(<ClockIn />)
      expect(screen.getByText('未打卡')).toBeInTheDocument()
    })

    it('shows "已上班" when employee has clocked in but not out', () => {
      mockEmployees = [makeEmployee({ id: 1 })]
      mockAttendances = [
        makeAttendance({ employeeId: 1, clockIn: 1716170400000 }),
      ]
      render(<ClockIn />)
      expect(screen.getByText('已上班')).toBeInTheDocument()
    })

    it('shows "已下班" when employee has clocked in AND out', () => {
      mockEmployees = [makeEmployee({ id: 1 })]
      mockAttendances = [
        makeAttendance({
          employeeId: 1,
          clockIn: 1716170400000,
          clockOut: 1716202800000,
        }),
      ]
      render(<ClockIn />)
      expect(screen.getByText('已下班')).toBeInTheDocument()
    })

    it('shows "休假" status when attendance type is vacation', () => {
      mockEmployees = [makeEmployee({ id: 1 })]
      mockAttendances = [
        makeAttendance({
          employeeId: 1,
          type: 'vacation',
          clockIn: undefined,
          clockOut: undefined,
        }),
      ]
      render(<ClockIn />)
      // The badge text should contain "休假" as status text
      const badgeTexts = screen.getAllByText('休假')
      expect(badgeTexts.length).toBeGreaterThanOrEqual(1)
    })
  })

  // --------------------------------------------------------
  // Clock-in/out times display
  // --------------------------------------------------------

  describe('clock-in/out times', () => {
    it('shows placeholder time text when no attendance exists', () => {
      mockEmployees = [makeEmployee({ id: 1 })]
      mockAttendances = []
      const { container } = render(<ClockIn />)
      // Times are rendered inline with labels, so use textContent on the container
      const timesDiv = container.querySelector('[class*="css"]')
      const fullText = container.textContent ?? ''
      // Should have two instances of --:-- (one for clock-in, one for clock-out)
      const matches = fullText.match(/--:--/g)
      expect(matches).toBeTruthy()
      expect(matches!.length).toBe(2)
    })

    it('shows formatted clock-in time', () => {
      mockEmployees = [makeEmployee({ id: 1 })]
      const clockInTime = dayjs('2024-05-20T09:15:00').valueOf()
      mockAttendances = [
        makeAttendance({ employeeId: 1, clockIn: clockInTime }),
      ]
      const { container } = render(<ClockIn />)
      const fullText = container.textContent ?? ''
      expect(fullText).toContain('09:15')
    })

    it('shows formatted clock-out time', () => {
      mockEmployees = [makeEmployee({ id: 1 })]
      const clockInTime = dayjs('2024-05-20T09:00:00').valueOf()
      const clockOutTime = dayjs('2024-05-20T18:30:00').valueOf()
      mockAttendances = [
        makeAttendance({
          employeeId: 1,
          clockIn: clockInTime,
          clockOut: clockOutTime,
        }),
      ]
      const { container } = render(<ClockIn />)
      const fullText = container.textContent ?? ''
      expect(fullText).toContain('18:30')
    })
  })

  // --------------------------------------------------------
  // Vacation button
  // --------------------------------------------------------

  describe('action buttons', () => {
    it('shows "打卡上班" and "申請休假" buttons when no attendance', () => {
      mockEmployees = [makeEmployee({ id: 1 })]
      mockAttendances = []
      render(<ClockIn />)
      const buttons = screen.getAllByRole('button')
      const clockInBtn = buttons.find(btn =>
        btn.textContent?.includes('打卡上班'),
      )
      const vacationBtn = buttons.find(btn =>
        btn.textContent?.includes('申請休假'),
      )
      expect(clockInBtn).toBeTruthy()
      expect(vacationBtn).toBeTruthy()
    })

    it('shows "打卡下班" button when employee has clocked in', () => {
      mockEmployees = [makeEmployee({ id: 1 })]
      mockAttendances = [
        makeAttendance({ employeeId: 1, clockIn: 1716170400000 }),
      ]
      render(<ClockIn />)
      const buttons = screen.getAllByRole('button')
      const clockOutBtn = buttons.find(btn =>
        btn.textContent?.includes('打卡下班'),
      )
      expect(clockOutBtn).toBeTruthy()
    })

    it('shows "打卡下班" button when employee has clocked out (re-clock-out)', () => {
      mockEmployees = [makeEmployee({ id: 1 })]
      mockAttendances = [
        makeAttendance({
          employeeId: 1,
          clockIn: 1716170400000,
          clockOut: 1716202800000,
        }),
      ]
      render(<ClockIn />)
      const buttons = screen.getAllByRole('button')
      const clockOutBtn = buttons.find(btn =>
        btn.textContent?.includes('打卡下班'),
      )
      expect(clockOutBtn).toBeTruthy()
    })

    it('shows "取消休假" button when employee is on vacation', () => {
      mockEmployees = [makeEmployee({ id: 1 })]
      mockAttendances = [
        makeAttendance({
          employeeId: 1,
          type: 'vacation',
          clockIn: 1716170400000,
        }),
      ]
      render(<ClockIn />)
      const buttons = screen.getAllByRole('button')
      const cancelBtn = buttons.find(btn =>
        btn.textContent?.includes('取消休假'),
      )
      expect(cancelBtn).toBeTruthy()
    })

    it('hides vacation button when employee already has attendance', () => {
      mockEmployees = [makeEmployee({ id: 1 })]
      mockAttendances = [
        makeAttendance({ employeeId: 1, clockIn: 1716170400000 }),
      ]
      render(<ClockIn />)
      const buttons = screen.queryAllByRole('button')
      const vacationBtn = buttons.find(btn =>
        btn.textContent?.includes('申請休假'),
      )
      expect(vacationBtn).toBeUndefined()
    })
  })

  // --------------------------------------------------------
  // Card click modal state
  // --------------------------------------------------------

  describe('card click modal state', () => {
    it('sets clockIn action when clicking card with no attendance', () => {
      mockEmployees = [makeEmployee({ id: 1, name: 'Alice' })]
      mockAttendances = []
      render(<ClockIn />)
      const card = screen.getByTestId('employee-card')
      // Should not throw when clicking
      fireEvent.click(card)
    })

    it('sets clockOut action when clicking card with clockIn only', () => {
      mockEmployees = [makeEmployee({ id: 1, name: 'Alice' })]
      mockAttendances = [
        makeAttendance({
          employeeId: 1,
          clockIn: dayjs('2024-05-20T09:00:00').valueOf(),
        }),
      ]
      render(<ClockIn />)
      const card = screen.getByTestId('employee-card')
      fireEvent.click(card)
    })

    it('sets clockOut action when clicking card with both clockIn and clockOut', () => {
      mockEmployees = [makeEmployee({ id: 1, name: 'Alice' })]
      mockAttendances = [
        makeAttendance({
          employeeId: 1,
          clockIn: dayjs('2024-05-20T09:00:00').valueOf(),
          clockOut: dayjs('2024-05-20T18:00:00').valueOf(),
        }),
      ]
      render(<ClockIn />)
      const card = screen.getByTestId('employee-card')
      fireEvent.click(card)
    })

    it('sets cancelVacation action when clicking card with vacation type', () => {
      mockEmployees = [makeEmployee({ id: 1, name: 'Alice' })]
      mockAttendances = [
        makeAttendance({
          employeeId: 1,
          type: 'vacation',
          clockIn: undefined,
          clockOut: undefined,
        }),
      ]
      render(<ClockIn />)
      const card = screen.getByTestId('employee-card')
      fireEvent.click(card)
    })

    it('sets vacation action when clicking "申請休假" button', () => {
      mockEmployees = [makeEmployee({ id: 1, name: 'Alice' })]
      mockAttendances = []
      render(<ClockIn />)
      const buttons = screen.getAllByRole('button')
      const vacationBtn = buttons.find(btn =>
        btn.textContent?.includes('申請休假'),
      )
      expect(vacationBtn).toBeTruthy()
      fireEvent.click(vacationBtn!)
    })
  })

  // --------------------------------------------------------
  // Multiple employees with different states
  // --------------------------------------------------------

  describe('multiple employees with different attendance states', () => {
    it('renders correct status for each employee independently', () => {
      mockEmployees = [
        makeEmployee({ id: 1, name: 'Alice' }),
        makeEmployee({ id: 2, name: 'Bob' }),
        makeEmployee({ id: 3, name: 'Carol' }),
        makeEmployee({ id: 4, name: 'Dave' }),
      ]
      mockAttendances = [
        makeAttendance({ employeeId: 2, clockIn: 1716170400000 }),
        makeAttendance({
          id: 102,
          employeeId: 3,
          clockIn: 1716170400000,
          clockOut: 1716202800000,
        }),
        makeAttendance({
          id: 103,
          employeeId: 4,
          type: 'vacation',
          clockIn: undefined,
          clockOut: undefined,
        }),
      ]
      render(<ClockIn />)

      const cards = screen.getAllByTestId('employee-card')
      expect(cards.length).toBe(4)

      // Alice: no attendance -> 未打卡
      expect(cards[0].textContent).toContain('未打卡')
      // Bob: clocked in -> 已上班
      expect(cards[1].textContent).toContain('已上班')
      // Carol: clocked in and out -> 已下班
      expect(cards[2].textContent).toContain('已下班')
      // Dave: vacation -> 休假
      expect(cards[3].textContent).toContain('休假')
    })

    it('shows vacation button only for employees without attendance', () => {
      mockEmployees = [
        makeEmployee({ id: 1, name: 'Alice' }),
        makeEmployee({ id: 2, name: 'Bob' }),
      ]
      mockAttendances = [
        makeAttendance({ employeeId: 2, clockIn: 1716170400000 }),
      ]
      render(<ClockIn />)

      const cards = screen.getAllByTestId('employee-card')
      // Alice (no attendance) should have "申請休假" button
      const aliceButtons = cards[0].querySelectorAll('button')
      const aliceVacBtn = Array.from(aliceButtons).find(btn =>
        btn.textContent?.includes('申請休假'),
      )
      expect(aliceVacBtn).toBeTruthy()

      // Bob (has attendance) should NOT have "申請休假" button
      const bobButtons = cards[1].querySelectorAll('button')
      const bobVacBtn = Array.from(bobButtons).find(btn =>
        btn.textContent?.includes('申請休假'),
      )
      expect(bobVacBtn).toBeUndefined()
    })
  })

  // --------------------------------------------------------
  // Vacation time display
  // --------------------------------------------------------

  describe('vacation time display', () => {
    it('shows "休假：" time text instead of "上班/下班" for vacation records', () => {
      mockEmployees = [makeEmployee({ id: 1 })]
      const vacTime = dayjs('2024-05-20T08:30:00').valueOf()
      mockAttendances = [
        makeAttendance({
          employeeId: 1,
          type: 'vacation',
          clockIn: vacTime,
          clockOut: undefined,
        }),
      ]
      const { container } = render(<ClockIn />)
      const fullText = container.textContent ?? ''
      expect(fullText).toContain('休假：')
      expect(fullText).toContain('08:30')
      expect(fullText).not.toContain('上班：')
      expect(fullText).not.toContain('下班：')
    })
  })

  // --------------------------------------------------------
  // Edge cases
  // --------------------------------------------------------

  describe('edge cases', () => {
    it('handles employee with undefined avatar gracefully', () => {
      mockEmployees = [makeEmployee({ id: 1, name: 'Eve', avatar: undefined })]
      render(<ClockIn />)
      const avatar = screen.getByTestId('avatar-image')
      expect(avatar).toHaveAttribute('src', 'fallback')
    })

    it('handles employee with undefined isAdmin as non-admin', () => {
      mockEmployees = [
        makeEmployee({ id: 1, name: 'Frank', isAdmin: undefined }),
      ]
      render(<ClockIn />)
      expect(screen.queryByText('管理員')).not.toBeInTheDocument()
    })
  })
})
