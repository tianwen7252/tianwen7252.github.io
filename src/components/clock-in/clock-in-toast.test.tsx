import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, within, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  getEmployeeRepo,
  getAttendanceRepo,
  resetMockRepositories,
} from '@/test/mock-repositories'
import { ClockIn } from './clock-in'

// Mock the repository provider to use in-memory mock repositories
vi.mock('@/lib/repositories', () => ({
  getEmployeeRepo: () => getEmployeeRepo(),
  getAttendanceRepo: () => getAttendanceRepo(),
}))

// Mock sonner to capture toast calls — vi.hoisted ensures mockToast is
// available when vi.mock factory (which is hoisted) executes.
const mockToast = vi.hoisted(() => ({
  success: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
}))

vi.mock('sonner', () => ({
  toast: mockToast,
}))

describe('ClockIn — Toast Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    resetMockRepositories()
  })

  it('should show success toast after clock-in', async () => {
    resetMockRepositories()
    const user = userEvent.setup()
    render(<ClockIn />)

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getAllByTestId('employee-card').length).toBe(10)
    })

    // Click employee card with no record (emp-004 - Grace)
    const cards = screen.getAllByTestId('employee-card')
    const emp4Card = cards.find(card => within(card).queryByText('Grace'))
    await user.click(emp4Card!)

    // Confirm clock-in
    await user.click(screen.getByText('確認打卡'))

    await waitFor(() => {
      expect(mockToast.success).toHaveBeenCalledWith('打卡上班成功')
    })
  })

  it('should show success toast after clock-out', async () => {
    resetMockRepositories()
    const user = userEvent.setup()
    render(<ClockIn />)

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('打卡下班')).toBeTruthy()
    })

    // Click 打卡下班 button for emp-002 (clocked in)
    await user.click(screen.getByText('打卡下班'))

    // Confirm clock-out
    await user.click(screen.getByText('確認下班'))

    await waitFor(() => {
      expect(mockToast.success).toHaveBeenCalledWith('打卡下班成功')
    })
  })

  it('should show success toast after vacation', async () => {
    resetMockRepositories()
    const user = userEvent.setup()
    render(<ClockIn />)

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getAllByTestId('employee-card').length).toBe(10)
    })

    // Click 申請休假 button for emp-004 (Grace)
    const graceCard = screen.getAllByTestId('employee-card')
      .find(card => within(card).queryByText('Grace'))!
    await user.click(within(graceCard).getByText('申請休假'))

    // Confirm vacation
    await user.click(screen.getByText('確認休假'))

    await waitFor(() => {
      expect(mockToast.success).toHaveBeenCalledWith('休假申請成功')
    })
  })

  it('should show success toast after cancel vacation', async () => {
    resetMockRepositories()
    const user = userEvent.setup()
    render(<ClockIn />)

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('取消休假')).toBeTruthy()
    })

    // Click 取消休假 button for emp-003
    await user.click(screen.getByText('取消休假'))

    // Confirm cancel vacation
    await user.click(screen.getByText('確認取消'))

    await waitFor(() => {
      expect(mockToast.success).toHaveBeenCalledWith('已取消休假')
    })
  })

  it('should NOT show toast when modal is cancelled', async () => {
    resetMockRepositories()
    const user = userEvent.setup()
    render(<ClockIn />)

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getAllByText('打卡上班').length).toBeGreaterThanOrEqual(1)
    })

    // Open modal
    const clockInBtns = screen.getAllByText('打卡上班')
    await user.click(clockInBtns[0]!)

    // Cancel
    await user.click(screen.getByText('取消'))

    expect(mockToast.success).not.toHaveBeenCalled()
  })
})
