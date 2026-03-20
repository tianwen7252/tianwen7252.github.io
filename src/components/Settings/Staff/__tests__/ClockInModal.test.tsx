import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import dayjs from 'dayjs'
import type { ClockInAction } from '../ClockIn'

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

// --- Default props factory ---

const defaultProps = (overrides: Record<string, unknown> = {}) => ({
  open: true,
  employee: makeEmployee(),
  action: 'clockIn' as ClockInAction,
  loading: false,
  onConfirm: vi.fn(),
  onCancel: vi.fn(),
  ...overrides,
})

// Lazily import ClockInModal — we import it after mocks are set up
let ClockInModal: React.FC<any>

beforeAll(async () => {
  const mod = await import('../ClockInModal')
  ClockInModal = mod.ClockInModal
})

describe('ClockInModal Component', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    // Fix time to 09:41 AM on Monday 2024-05-20 (local time, timezone-agnostic)
    vi.setSystemTime(new Date(2024, 4, 20, 9, 41, 0))
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  // --------------------------------------------------------
  // Null/empty employee
  // --------------------------------------------------------

  describe('when employee is null', () => {
    it('renders null (no modal content)', () => {
      const props = defaultProps({ employee: null })
      const { container } = render(<ClockInModal {...props} />)
      // Should render nothing — empty container
      expect(container.innerHTML).toBe('')
    })
  })

  // --------------------------------------------------------
  // Title text per action type
  // --------------------------------------------------------

  describe('title text for each action', () => {
    it('shows clockIn title with employee name', () => {
      const props = defaultProps({ action: 'clockIn' })
      render(<ClockInModal {...props} />)
      expect(screen.getByText(/確認 Alice 的上班打卡？/)).toBeInTheDocument()
    })

    it('shows clockOut title with employee name', () => {
      const props = defaultProps({ action: 'clockOut' })
      render(<ClockInModal {...props} />)
      expect(screen.getByText(/確認 Alice 的下班打卡？/)).toBeInTheDocument()
    })

    it('shows vacation title with employee name', () => {
      const props = defaultProps({ action: 'vacation' })
      render(<ClockInModal {...props} />)
      expect(screen.getByText(/確認 Alice 的休假打卡？/)).toBeInTheDocument()
    })

    it('shows cancelVacation title with employee name', () => {
      const props = defaultProps({ action: 'cancelVacation' })
      render(<ClockInModal {...props} />)
      expect(screen.getByText(/取消 Alice 的休假？/)).toBeInTheDocument()
    })
  })

  // --------------------------------------------------------
  // System confirm label
  // --------------------------------------------------------

  describe('system confirm label', () => {
    it('shows "系統確認" label', () => {
      const props = defaultProps()
      render(<ClockInModal {...props} />)
      expect(screen.getByText('系統確認')).toBeInTheDocument()
    })
  })

  // --------------------------------------------------------
  // Employee info display
  // --------------------------------------------------------

  describe('employee info', () => {
    it('displays employee name', () => {
      const props = defaultProps({
        employee: makeEmployee({ name: 'Bob' }),
      })
      render(<ClockInModal {...props} />)
      // Name appears in title and in the glass card
      const elements = screen.getAllByText('Bob')
      // At minimum the glass card name should be present
      expect(elements.length).toBeGreaterThanOrEqual(1)
    })

    it('renders AvatarImage with size 120', () => {
      const props = defaultProps({
        employee: makeEmployee({ avatar: 'images/aminals/5678.png' }),
      })
      render(<ClockInModal {...props} />)
      const avatar = screen.getByTestId('avatar-image')
      expect(avatar).toHaveStyle({ width: '120px', height: '120px' })
    })

    it('renders AvatarImage with the employee avatar', () => {
      const props = defaultProps({
        employee: makeEmployee({ avatar: 'images/aminals/5678.png' }),
      })
      render(<ClockInModal {...props} />)
      const avatar = screen.getByTestId('avatar-image')
      expect(avatar).toHaveAttribute('src', 'images/aminals/5678.png')
    })
  })

  // --------------------------------------------------------
  // Admin role display
  // --------------------------------------------------------

  describe('admin role label', () => {
    it('shows "管理員" for admin employees', () => {
      const props = defaultProps({
        employee: makeEmployee({ isAdmin: true }),
      })
      render(<ClockInModal {...props} />)
      expect(screen.getByText('管理員')).toBeInTheDocument()
    })

    it('does NOT show "管理員" for non-admin employees', () => {
      const props = defaultProps({
        employee: makeEmployee({ isAdmin: false }),
      })
      render(<ClockInModal {...props} />)
      expect(screen.queryByText('管理員')).not.toBeInTheDocument()
    })
  })

  // --------------------------------------------------------
  // Shift type display
  // --------------------------------------------------------

  describe('shift type label', () => {
    it('shows "常日班" for regular shift type', () => {
      const props = defaultProps({
        employee: makeEmployee({ shiftType: 'regular' }),
      })
      render(<ClockInModal {...props} />)
      expect(screen.getByText('常日班')).toBeInTheDocument()
    })

    it('shows "排班" for shift type', () => {
      const props = defaultProps({
        employee: makeEmployee({ shiftType: 'shift' }),
      })
      render(<ClockInModal {...props} />)
      expect(screen.getByText('排班')).toBeInTheDocument()
    })

    it('shows "班別類型" label', () => {
      const props = defaultProps()
      render(<ClockInModal {...props} />)
      expect(screen.getByText('班別類型')).toBeInTheDocument()
    })

    it('falls back to first SHIFT_TYPES entry for unknown shiftType', () => {
      const props = defaultProps({
        employee: makeEmployee({ shiftType: undefined }),
      })
      render(<ClockInModal {...props} />)
      // Fallback should show first entry: 常日班
      expect(screen.getByText('常日班')).toBeInTheDocument()
    })
  })

  // --------------------------------------------------------
  // Real-time clock
  // --------------------------------------------------------

  describe('real-time clock', () => {
    it('shows "目前時間" label for clockIn action', () => {
      const props = defaultProps({ action: 'clockIn' })
      render(<ClockInModal {...props} />)
      expect(screen.getByText('目前時間')).toBeInTheDocument()
    })

    it('shows "休假時間" label for vacation action', () => {
      const props = defaultProps({ action: 'vacation' })
      render(<ClockInModal {...props} />)
      expect(screen.getByText('休假時間')).toBeInTheDocument()
      expect(screen.queryByText('目前時間')).not.toBeInTheDocument()
    })

    it('displays current time in HH:mm AM/PM format', () => {
      const props = defaultProps()
      render(<ClockInModal {...props} />)
      // System time is 09:41 AM
      expect(screen.getByText('09:41 AM')).toBeInTheDocument()
    })

    it('updates time every second', () => {
      const props = defaultProps()
      render(<ClockInModal {...props} />)
      expect(screen.getByText('09:41 AM')).toBeInTheDocument()

      // Advance 1 minute
      act(() => {
        vi.advanceTimersByTime(60_000)
      })
      expect(screen.getByText('09:42 AM')).toBeInTheDocument()
    })

    it('cleans up interval on unmount', () => {
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval')
      const props = defaultProps()
      const { unmount } = render(<ClockInModal {...props} />)
      unmount()
      expect(clearIntervalSpy).toHaveBeenCalled()
      clearIntervalSpy.mockRestore()
    })
  })

  // --------------------------------------------------------
  // Confirm button text per action
  // --------------------------------------------------------

  describe('confirm button text', () => {
    it('shows "確認打卡" for clockIn action', () => {
      const props = defaultProps({ action: 'clockIn' })
      render(<ClockInModal {...props} />)
      expect(screen.getByText('確認打卡')).toBeInTheDocument()
    })

    it('shows "確認下班" for clockOut action', () => {
      const props = defaultProps({ action: 'clockOut' })
      render(<ClockInModal {...props} />)
      expect(screen.getByText('確認下班')).toBeInTheDocument()
    })

    it('shows "確認休假" for vacation action', () => {
      const props = defaultProps({ action: 'vacation' })
      render(<ClockInModal {...props} />)
      expect(screen.getByText('確認休假')).toBeInTheDocument()
    })

    it('shows "確認取消" for cancelVacation action', () => {
      const props = defaultProps({ action: 'cancelVacation' })
      render(<ClockInModal {...props} />)
      expect(screen.getByText('確認取消')).toBeInTheDocument()
    })
  })

  // --------------------------------------------------------
  // Cancel button
  // --------------------------------------------------------

  describe('cancel button', () => {
    it('shows cancel button text', () => {
      const props = defaultProps()
      render(<ClockInModal {...props} />)
      // Cancel button text is "取消" or "返回"
      const cancelBtn = screen.getByText('取消')
      expect(cancelBtn).toBeInTheDocument()
    })

    it('calls onCancel when cancel button is clicked', () => {
      const onCancel = vi.fn()
      const props = defaultProps({ onCancel })
      render(<ClockInModal {...props} />)
      const cancelBtn = screen.getByText('取消')
      fireEvent.click(cancelBtn)
      expect(onCancel).toHaveBeenCalledTimes(1)
    })
  })

  // --------------------------------------------------------
  // Confirm button interaction
  // --------------------------------------------------------

  describe('confirm button interaction', () => {
    it('calls onConfirm when confirm button is clicked', () => {
      const onConfirm = vi.fn()
      const props = defaultProps({ action: 'clockIn', onConfirm })
      render(<ClockInModal {...props} />)
      const confirmBtn = screen.getByText('確認打卡')
      fireEvent.click(confirmBtn)
      expect(onConfirm).toHaveBeenCalledTimes(1)
    })
  })

  // --------------------------------------------------------
  // Loading state
  // --------------------------------------------------------

  describe('loading state', () => {
    it('disables confirm button when loading is true', () => {
      const props = defaultProps({ loading: true, action: 'clockIn' })
      render(<ClockInModal {...props} />)
      const confirmBtn = screen.getByText('確認打卡')
      expect(confirmBtn.closest('button')).toBeDisabled()
    })

    it('enables confirm button when loading is false', () => {
      const props = defaultProps({ loading: false, action: 'clockIn' })
      render(<ClockInModal {...props} />)
      const confirmBtn = screen.getByText('確認打卡')
      expect(confirmBtn.closest('button')).not.toBeDisabled()
    })
  })

  // --------------------------------------------------------
  // Re-clock-out hint
  // --------------------------------------------------------

  describe('re-clock-out hint', () => {
    it('shows existing clockOut time when action is clockOut and attendance has clockOut', () => {
      const clockOutTime = dayjs('2024-05-20T17:30:00').valueOf()
      const props = defaultProps({
        action: 'clockOut',
        attendance: makeAttendance({
          clockIn: dayjs('2024-05-20T09:00:00').valueOf(),
          clockOut: clockOutTime,
        }),
      })
      render(<ClockInModal {...props} />)
      // Should show the existing clock-out time
      expect(screen.getByText(/目前下班時間/)).toBeInTheDocument()
      expect(screen.getByText(/17:30/)).toBeInTheDocument()
    })

    it('does NOT show re-clock-out hint when action is clockOut but no existing clockOut', () => {
      const props = defaultProps({
        action: 'clockOut',
        attendance: makeAttendance({
          clockIn: dayjs('2024-05-20T09:00:00').valueOf(),
          clockOut: undefined,
        }),
      })
      render(<ClockInModal {...props} />)
      expect(screen.queryByText(/目前下班時間/)).not.toBeInTheDocument()
    })
  })

  // --------------------------------------------------------
  // Cancel vacation — vacation time display
  // --------------------------------------------------------

  describe('cancelVacation — vacation time display', () => {
    it('shows "休假打卡時間" label instead of "目前時間" for cancelVacation action', () => {
      const vacationClockIn = dayjs('2024-05-20T08:00:00').valueOf()
      const props = defaultProps({
        action: 'cancelVacation',
        attendance: makeAttendance({
          type: 'vacation',
          clockIn: vacationClockIn,
        }),
      })
      render(<ClockInModal {...props} />)
      expect(screen.getByText('休假打卡時間')).toBeInTheDocument()
      expect(screen.queryByText('目前時間')).not.toBeInTheDocument()
    })

    it('shows original vacation clockIn time formatted', () => {
      const vacationClockIn = dayjs('2024-05-20T08:15:00').valueOf()
      const props = defaultProps({
        action: 'cancelVacation',
        attendance: makeAttendance({
          type: 'vacation',
          clockIn: vacationClockIn,
        }),
      })
      render(<ClockInModal {...props} />)
      expect(screen.getByText('08:15 AM')).toBeInTheDocument()
    })
  })

  // --------------------------------------------------------
  // Modal open/close state
  // --------------------------------------------------------

  describe('modal visibility', () => {
    it('does not render modal content when open is false', () => {
      const props = defaultProps({ open: false })
      render(<ClockInModal {...props} />)
      // When modal is closed, the title should not be visible
      expect(screen.queryByText('系統確認')).not.toBeInTheDocument()
    })
  })

  // --------------------------------------------------------
  // Edge cases
  // --------------------------------------------------------

  describe('edge cases', () => {
    it('handles employee with undefined avatar gracefully', () => {
      const props = defaultProps({
        employee: makeEmployee({ avatar: undefined }),
      })
      render(<ClockInModal {...props} />)
      const avatar = screen.getByTestId('avatar-image')
      expect(avatar).toHaveAttribute('src', 'fallback')
    })

    it('handles employee with undefined shiftType by falling back', () => {
      const props = defaultProps({
        employee: makeEmployee({ shiftType: undefined }),
      })
      render(<ClockInModal {...props} />)
      // Should fallback to first SHIFT_TYPES entry
      expect(screen.getByText('常日班')).toBeInTheDocument()
    })

    it('handles cancelVacation with no attendance record', () => {
      const props = defaultProps({
        action: 'cancelVacation',
        attendance: undefined,
      })
      // Should not crash
      render(<ClockInModal {...props} />)
      expect(screen.getByText('休假打卡時間')).toBeInTheDocument()
    })
  })
})
