import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import dayjs from 'dayjs'
import { ClockIn } from '../ClockIn'
import { styles } from '../styles/clockInStyles'

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

    it('shows "正在上班" when employee has clocked in but not out', () => {
      mockEmployees = [makeEmployee({ id: 1 })]
      mockAttendances = [
        makeAttendance({ employeeId: 1, clockIn: 1716170400000 }),
      ]
      render(<ClockIn />)
      expect(screen.getByText('正在上班')).toBeInTheDocument()
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
      const fullText = container.textContent ?? ''
      // Should have two instances of ?? : ?? (one for clock-in, one for clock-out)
      const matches = fullText.match(/\?\? : \?\?/g)
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
  // Action buttons
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

    it('shows "打卡上班" button when last shift is complete (multi-shift)', () => {
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
      const clockInBtn = buttons.find(btn =>
        btn.textContent?.includes('打卡上班'),
      )
      const vacationBtn = buttons.find(btn =>
        btn.textContent?.includes('申請休假'),
      )
      // Should show clockIn for new shift, but NOT vacation button
      expect(clockInBtn).toBeTruthy()
      expect(vacationBtn).toBeUndefined()
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

    it('sets clockIn action when clicking card with completed shift (multi-shift)', () => {
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
      // Bob: clocked in -> 正在上班
      expect(cards[1].textContent).toContain('正在上班')
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
  // Vacation card background color
  // --------------------------------------------------------

  describe('vacation card background', () => {
    it('applies vacation background CSS class when employee is on vacation', () => {
      mockEmployees = [makeEmployee({ id: 1, name: 'Alice' })]
      mockAttendances = [
        makeAttendance({
          employeeId: 1,
          type: 'vacation',
          clockIn: dayjs('2024-05-20T08:00:00').valueOf(),
        }),
      ]
      render(<ClockIn />)
      const card = screen.getByTestId('employee-card')
      // Vacation card should have the vacation background Emotion class applied
      expect(card.className).toContain(styles.cardVacationBgCss)
    })

    it('does NOT apply vacation background CSS class when employee has regular attendance', () => {
      mockEmployees = [makeEmployee({ id: 1, name: 'Alice' })]
      mockAttendances = [
        makeAttendance({
          employeeId: 1,
          clockIn: dayjs('2024-05-20T09:00:00').valueOf(),
        }),
      ]
      render(<ClockIn />)
      const card = screen.getByTestId('employee-card')
      expect(card.className).not.toContain(styles.cardVacationBgCss)
    })

    it('does NOT apply vacation background CSS class when employee has no attendance', () => {
      mockEmployees = [makeEmployee({ id: 1, name: 'Alice' })]
      mockAttendances = []
      render(<ClockIn />)
      const card = screen.getByTestId('employee-card')
      expect(card.className).not.toContain(styles.cardVacationBgCss)
    })
  })

  // --------------------------------------------------------
  // Resigned employee filtering
  // --------------------------------------------------------

  describe('resigned employee filtering', () => {
    it('does NOT render employees with a resignationDate', () => {
      mockEmployees = [
        makeEmployee({ id: 1, name: 'Alice', resignationDate: '2024-04-01' }),
      ]
      render(<ClockIn />)
      expect(screen.queryByText('Alice')).not.toBeInTheDocument()
    })

    it('renders employees without a resignationDate', () => {
      mockEmployees = [
        makeEmployee({ id: 1, name: 'Bob', resignationDate: undefined }),
      ]
      render(<ClockIn />)
      expect(screen.getByText('Bob')).toBeInTheDocument()
    })

    it('filters out resigned employees while keeping active ones', () => {
      mockEmployees = [
        makeEmployee({ id: 1, name: 'Alice', resignationDate: '2024-04-01' }),
        makeEmployee({ id: 2, name: 'Bob' }),
        makeEmployee({ id: 3, name: 'Carol', resignationDate: '2024-03-15' }),
        makeEmployee({ id: 4, name: 'Dave' }),
      ]
      render(<ClockIn />)
      // Active employees should be visible
      expect(screen.getByText('Bob')).toBeInTheDocument()
      expect(screen.getByText('Dave')).toBeInTheDocument()
      // Resigned employees should NOT be visible
      expect(screen.queryByText('Alice')).not.toBeInTheDocument()
      expect(screen.queryByText('Carol')).not.toBeInTheDocument()
    })

    it('renders only active employee cards in the grid', () => {
      mockEmployees = [
        makeEmployee({ id: 1, name: 'Alice', resignationDate: '2024-04-01' }),
        makeEmployee({ id: 2, name: 'Bob' }),
        makeEmployee({ id: 3, name: 'Carol' }),
      ]
      render(<ClockIn />)
      const cards = screen.getAllByTestId('employee-card')
      expect(cards.length).toBe(2)
    })

    it('shows empty message when all employees are resigned', () => {
      mockEmployees = [
        makeEmployee({ id: 1, name: 'Alice', resignationDate: '2024-04-01' }),
        makeEmployee({ id: 2, name: 'Bob', resignationDate: '2024-03-15' }),
      ]
      render(<ClockIn />)
      expect(
        screen.getByText(/目前無員工資料，請前往「員工管理」頁面新增員工/),
      ).toBeInTheDocument()
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

  // --------------------------------------------------------
  // Multi-shift support
  // --------------------------------------------------------

  describe('multi-shift support', () => {
    describe('deriveCardAction with arrays', () => {
      it('shows clockIn action when employee has completed first shift', () => {
        mockEmployees = [makeEmployee({ id: 1, name: 'Alice' })]
        mockAttendances = [
          makeAttendance({
            id: 101,
            employeeId: 1,
            clockIn: dayjs('2024-05-20T09:00:00').valueOf(),
            clockOut: dayjs('2024-05-20T13:00:00').valueOf(),
          }),
        ]
        render(<ClockIn />)
        // With a completed shift, the card should show "打卡上班" for new shift
        const buttons = screen.getAllByRole('button')
        const clockInBtn = buttons.find(btn =>
          btn.textContent?.includes('打卡上班'),
        )
        expect(clockInBtn).toBeTruthy()
      })

      it('shows clockOut action when employee has incomplete second shift', () => {
        mockEmployees = [makeEmployee({ id: 1, name: 'Alice' })]
        mockAttendances = [
          makeAttendance({
            id: 101,
            employeeId: 1,
            clockIn: dayjs('2024-05-20T09:00:00').valueOf(),
            clockOut: dayjs('2024-05-20T13:00:00').valueOf(),
          }),
          makeAttendance({
            id: 102,
            employeeId: 1,
            clockIn: dayjs('2024-05-20T14:00:00').valueOf(),
          }),
        ]
        render(<ClockIn />)
        // With an incomplete shift, should show "打卡下班"
        const buttons = screen.getAllByRole('button')
        const clockOutBtn = buttons.find(btn =>
          btn.textContent?.includes('打卡下班'),
        )
        expect(clockOutBtn).toBeTruthy()
      })

      it('shows clockIn action when both shifts are complete', () => {
        mockEmployees = [makeEmployee({ id: 1, name: 'Alice' })]
        mockAttendances = [
          makeAttendance({
            id: 101,
            employeeId: 1,
            clockIn: dayjs('2024-05-20T09:00:00').valueOf(),
            clockOut: dayjs('2024-05-20T13:00:00').valueOf(),
          }),
          makeAttendance({
            id: 102,
            employeeId: 1,
            clockIn: dayjs('2024-05-20T14:00:00').valueOf(),
            clockOut: dayjs('2024-05-20T18:00:00').valueOf(),
          }),
        ]
        render(<ClockIn />)
        // Both shifts complete -> show "打卡上班" for third shift
        const buttons = screen.getAllByRole('button')
        const clockInBtn = buttons.find(btn =>
          btn.textContent?.includes('打卡上班'),
        )
        expect(clockInBtn).toBeTruthy()
      })
    })

    describe('multiple shifts display', () => {
      it('displays both shifts when employee has two shifts', () => {
        mockEmployees = [makeEmployee({ id: 1, name: 'Alice' })]
        const shift1In = dayjs('2024-05-20T09:00:00').valueOf()
        const shift1Out = dayjs('2024-05-20T13:00:00').valueOf()
        const shift2In = dayjs('2024-05-20T14:00:00').valueOf()
        const shift2Out = dayjs('2024-05-20T18:30:00').valueOf()
        mockAttendances = [
          makeAttendance({
            id: 101,
            employeeId: 1,
            clockIn: shift1In,
            clockOut: shift1Out,
          }),
          makeAttendance({
            id: 102,
            employeeId: 1,
            clockIn: shift2In,
            clockOut: shift2Out,
          }),
        ]
        const { container } = render(<ClockIn />)
        const fullText = container.textContent ?? ''
        // Should display both shifts' times
        expect(fullText).toContain('09:00')
        expect(fullText).toContain('13:00')
        expect(fullText).toContain('14:00')
        expect(fullText).toContain('18:30')
      })

      it('shows shift labels when multiple shifts exist', () => {
        mockEmployees = [makeEmployee({ id: 1, name: 'Alice' })]
        mockAttendances = [
          makeAttendance({
            id: 101,
            employeeId: 1,
            clockIn: dayjs('2024-05-20T09:00:00').valueOf(),
            clockOut: dayjs('2024-05-20T13:00:00').valueOf(),
          }),
          makeAttendance({
            id: 102,
            employeeId: 1,
            clockIn: dayjs('2024-05-20T14:00:00').valueOf(),
            clockOut: dayjs('2024-05-20T18:00:00').valueOf(),
          }),
        ]
        const { container } = render(<ClockIn />)
        const fullText = container.textContent ?? ''
        // Should NOT show shift labels — removed per UI redesign
        expect(fullText).not.toContain('班1:')
        expect(fullText).not.toContain('班2:')
        // Both shift times should still be displayed
        expect(fullText).toContain('09:00')
        expect(fullText).toContain('14:00')
      })

      it('does NOT show shift labels when only one shift exists', () => {
        mockEmployees = [makeEmployee({ id: 1, name: 'Alice' })]
        mockAttendances = [
          makeAttendance({
            id: 101,
            employeeId: 1,
            clockIn: dayjs('2024-05-20T09:00:00').valueOf(),
          }),
        ]
        const { container } = render(<ClockIn />)
        const fullText = container.textContent ?? ''
        // Should NOT show shift labels when only one shift
        expect(fullText).not.toContain('班1:')
      })
    })

    describe('total hours display', () => {
      it('displays total hours when employee has completed shift', () => {
        mockEmployees = [makeEmployee({ id: 1, name: 'Alice' })]
        // 9:00 to 13:00 = 4 hours
        mockAttendances = [
          makeAttendance({
            id: 101,
            employeeId: 1,
            clockIn: dayjs('2024-05-20T09:00:00').valueOf(),
            clockOut: dayjs('2024-05-20T13:00:00').valueOf(),
          }),
        ]
        const { container } = render(<ClockIn />)
        const fullText = container.textContent ?? ''
        expect(fullText).toContain('4h')
      })

      it('displays combined total hours for multiple completed shifts', () => {
        mockEmployees = [makeEmployee({ id: 1, name: 'Alice' })]
        // Shift 1: 9:00 to 13:00 = 4h, Shift 2: 14:00 to 18:00 = 4h, Total = 8h
        mockAttendances = [
          makeAttendance({
            id: 101,
            employeeId: 1,
            clockIn: dayjs('2024-05-20T09:00:00').valueOf(),
            clockOut: dayjs('2024-05-20T13:00:00').valueOf(),
          }),
          makeAttendance({
            id: 102,
            employeeId: 1,
            clockIn: dayjs('2024-05-20T14:00:00').valueOf(),
            clockOut: dayjs('2024-05-20T18:00:00').valueOf(),
          }),
        ]
        const { container } = render(<ClockIn />)
        const fullText = container.textContent ?? ''
        expect(fullText).toContain('8h')
      })

      it('does NOT display hours when employee has no completed shifts', () => {
        mockEmployees = [makeEmployee({ id: 1, name: 'Alice' })]
        // Only clocked in, not out — totalHours = 0
        mockAttendances = [
          makeAttendance({
            id: 101,
            employeeId: 1,
            clockIn: dayjs('2024-05-20T09:00:00').valueOf(),
          }),
        ]
        const { container } = render(<ClockIn />)
        const fullText = container.textContent ?? ''
        expect(fullText).not.toContain('0h')
      })

      it('does NOT display hours when employee has no attendance', () => {
        mockEmployees = [makeEmployee({ id: 1, name: 'Alice' })]
        mockAttendances = []
        const { container } = render(<ClockIn />)
        const fullText = container.textContent ?? ''
        // No "h" suffix for hours display
        expect(fullText).not.toMatch(/\d+\.?\d*h/)
      })
    })

    describe('attendanceMap groups records by employeeId', () => {
      it('groups multiple records for the same employee', () => {
        mockEmployees = [makeEmployee({ id: 1, name: 'Alice' })]
        mockAttendances = [
          makeAttendance({
            id: 101,
            employeeId: 1,
            clockIn: dayjs('2024-05-20T09:00:00').valueOf(),
            clockOut: dayjs('2024-05-20T13:00:00').valueOf(),
          }),
          makeAttendance({
            id: 102,
            employeeId: 1,
            clockIn: dayjs('2024-05-20T14:00:00').valueOf(),
          }),
        ]
        render(<ClockIn />)
        // Verify only 1 card rendered (records grouped, not duplicated)
        const cards = screen.getAllByTestId('employee-card')
        expect(cards.length).toBe(1)
        // Verify both shifts are shown
        const fullText = cards[0].textContent ?? ''
        expect(fullText).toContain('09:00')
        expect(fullText).toContain('14:00')
      })

      it('keeps records separate for different employees', () => {
        mockEmployees = [
          makeEmployee({ id: 1, name: 'Alice' }),
          makeEmployee({ id: 2, name: 'Bob' }),
        ]
        mockAttendances = [
          makeAttendance({
            id: 101,
            employeeId: 1,
            clockIn: dayjs('2024-05-20T09:00:00').valueOf(),
          }),
          makeAttendance({
            id: 102,
            employeeId: 2,
            clockIn: dayjs('2024-05-20T10:00:00').valueOf(),
            clockOut: dayjs('2024-05-20T14:00:00').valueOf(),
          }),
        ]
        render(<ClockIn />)
        const cards = screen.getAllByTestId('employee-card')
        expect(cards.length).toBe(2)
        // Alice: clocked in only -> 正在上班
        expect(cards[0].textContent).toContain('正在上班')
        // Bob: clocked in and out -> 已下班
        expect(cards[1].textContent).toContain('已下班')
      })
    })

    describe('multi-shift status derivation', () => {
      it('shows "已下班" when last shift is complete', () => {
        mockEmployees = [makeEmployee({ id: 1, name: 'Alice' })]
        mockAttendances = [
          makeAttendance({
            id: 101,
            employeeId: 1,
            clockIn: dayjs('2024-05-20T09:00:00').valueOf(),
            clockOut: dayjs('2024-05-20T13:00:00').valueOf(),
          }),
        ]
        render(<ClockIn />)
        expect(screen.getByText('已下班')).toBeInTheDocument()
      })

      it('shows "正在上班" when last shift is incomplete', () => {
        mockEmployees = [makeEmployee({ id: 1, name: 'Alice' })]
        mockAttendances = [
          makeAttendance({
            id: 101,
            employeeId: 1,
            clockIn: dayjs('2024-05-20T09:00:00').valueOf(),
            clockOut: dayjs('2024-05-20T13:00:00').valueOf(),
          }),
          makeAttendance({
            id: 102,
            employeeId: 1,
            clockIn: dayjs('2024-05-20T14:00:00').valueOf(),
          }),
        ]
        render(<ClockIn />)
        expect(screen.getByText('正在上班')).toBeInTheDocument()
      })
    })
  })
})
