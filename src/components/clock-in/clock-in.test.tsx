import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { api, resetApi } from '@/api'
import { ClockIn } from './clock-in'

// ─── Test Setup ─────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-03-21T10:30:00'))
  resetApi()
})

afterEach(() => {
  vi.useRealTimers()
  resetApi()
})

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('ClockIn', () => {
  it('should render employee cards from mock data', () => {
    render(<ClockIn />)
    // Active employees: emp-001 through emp-004, emp-006 (emp-005 is inactive/resigned)
    const cards = screen.getAllByTestId('employee-card')
    expect(cards.length).toBe(5)
  })

  it('should show today date header', () => {
    render(<ClockIn />)
    // Today is 2026/3/21 (Saturday)
    expect(screen.getByText(/今天/)).toBeTruthy()
    expect(screen.getByText(/2026\/3\/21/)).toBeTruthy()
    expect(screen.getByText(/六/)).toBeTruthy()
  })

  it('should show correct status badge for employee with no record (未打卡)', () => {
    render(<ClockIn />)
    // emp-004 has no attendance record
    expect(screen.getByText('未打卡')).toBeTruthy()
  })

  it('should show correct status badge for clocked-in employee (正在上班)', () => {
    render(<ClockIn />)
    // emp-002 has clockIn but no clockOut
    expect(screen.getByText('正在上班')).toBeTruthy()
  })

  it('should show correct status badge for clocked-out employee (已下班)', () => {
    render(<ClockIn />)
    // emp-001 and emp-006 have both clockIn and clockOut
    expect(screen.getAllByText('已下班').length).toBeGreaterThanOrEqual(1)
  })

  it('should show correct status badge for vacation employee (休假)', () => {
    render(<ClockIn />)
    // emp-003 has type: 'paid_leave'
    expect(screen.getByText('休假')).toBeTruthy()
  })

  it('should show employee names', () => {
    render(<ClockIn />)
    expect(screen.getByText('王小明')).toBeTruthy()
    expect(screen.getByText('李美玲')).toBeTruthy()
    expect(screen.getByText('張大偉')).toBeTruthy()
    expect(screen.getByText('陳雅婷')).toBeTruthy()
  })

  it('should show admin label for admin employees', () => {
    render(<ClockIn />)
    // Only emp-001 (王小明) is admin
    const adminLabels = screen.getAllByText('管理員')
    expect(adminLabels).toHaveLength(1)
  })

  it('should not show resigned employees', () => {
    render(<ClockIn />)
    // emp-005 (林志明) is inactive with resignationDate
    expect(screen.queryByText('林志明')).toBeNull()
  })

  it('should show action buttons per state', () => {
    render(<ClockIn />)
    // emp-001 (clocked out) and emp-004 (no record) both show 打卡上班
    const clockInBtns = screen.getAllByText('打卡上班')
    expect(clockInBtns.length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('申請休假')).toBeTruthy()
    // emp-002 (clocked in): should show 打卡下班
    expect(screen.getByText('打卡下班')).toBeTruthy()
    // emp-003 (vacation): should show 取消休假
    expect(screen.getByText('取消休假')).toBeTruthy()
  })

  it('should show total hours for employees with complete shifts', () => {
    render(<ClockIn />)
    // emp-001 worked 8:00-17:00=9h, emp-006 worked 10:00-14:30=4.5h
    expect(screen.getAllByText(/總工時/).length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText(/9h/)).toBeTruthy()
  })

  it('should show clock times for regular employees', () => {
    render(<ClockIn />)
    // emp-001: clockIn 08:00, clockOut 17:00
    // Note: 08:00 appears for both emp-001 (regular) and emp-003 (vacation)
    const times08 = screen.getAllByText(/08:00/)
    expect(times08.length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText(/17:00/)).toBeTruthy()
  })

  it('should open ClockInModal when employee card is clicked', async () => {
    vi.useRealTimers()
    const user = userEvent.setup()
    render(<ClockIn />)

    // Click on emp-004 card (no record) — should open modal with clockIn action
    const cards = screen.getAllByTestId('employee-card')
    const emp4Card = cards.find(card => within(card).queryByText('陳雅婷'))
    expect(emp4Card).toBeTruthy()
    await user.click(emp4Card!)

    // Modal title appears twice (sr-only + visual)
    const titles = screen.getAllByText(/確認 陳雅婷 的上班打卡？/)
    expect(titles.length).toBe(2)
  })

  it('should open ClockInModal when action button is clicked', async () => {
    vi.useRealTimers()
    resetApi() // Re-reset with real date after restoring real timers
    const user = userEvent.setup()
    render(<ClockIn />)

    // Click the 打卡下班 button for emp-002
    await user.click(screen.getByText('打卡下班'))

    // Modal title appears twice (sr-only + visual)
    const titles = screen.getAllByText(/確認 李美玲 的下班打卡？/)
    expect(titles.length).toBe(2)
  })

  it('should close modal when cancel is clicked', async () => {
    vi.useRealTimers()
    const user = userEvent.setup()
    render(<ClockIn />)

    // Open modal — click first 打卡上班 button
    const clockInBtns = screen.getAllByText('打卡上班')
    await user.click(clockInBtns[0]!)

    // Modal should be open (title appears twice: sr-only + visual)
    const titles = screen.getAllByText(/確認.*的上班打卡？/)
    expect(titles.length).toBe(2)

    // Click cancel
    await user.click(screen.getByText('取消'))

    // Modal should close — title should disappear
    expect(screen.queryByText(/確認.*的上班打卡？/)).toBeNull()
  })

  it('should show empty state message when no employees', () => {
    // Remove all employees to simulate empty state
    const employees = api.employees.getAll()
    for (const emp of employees) {
      api.employees.remove(emp.id)
    }

    render(<ClockIn />)
    expect(screen.getByText(/目前無員工資料/)).toBeTruthy()
  })

  it('should show hint text about clicking employee to clock in', () => {
    render(<ClockIn />)
    expect(screen.getByText(/點選員工即可打卡/)).toBeTruthy()
  })

  it('should show correct card background for clocked-in state', () => {
    render(<ClockIn />)
    const cards = screen.getAllByTestId('employee-card')
    // emp-002 (index 1 in active) is clocked in
    const emp2Card = cards.find(card => within(card).queryByText('李美玲'))
    expect(emp2Card?.className).toContain('bg-[#f0f5eb]')
  })

  it('should show correct card background for clocked-out state', () => {
    render(<ClockIn />)
    const cards = screen.getAllByTestId('employee-card')
    // emp-001 is clocked out
    const emp1Card = cards.find(card => within(card).queryByText('王小明'))
    expect(emp1Card?.className).toContain('bg-[#f5f0fa]')
  })

  it('should show correct card background for vacation state', () => {
    render(<ClockIn />)
    const cards = screen.getAllByTestId('employee-card')
    // emp-003 is on vacation
    const emp3Card = cards.find(card => within(card).queryByText('張大偉'))
    expect(emp3Card?.className).toContain('bg-[#fef2f2]')
  })

  it('should handle confirm for clockIn action and close modal', async () => {
    vi.useRealTimers()
    resetApi() // Re-reset with real date after restoring real timers
    const user = userEvent.setup()
    render(<ClockIn />)

    // Click emp-004 card (no record) to open clockIn modal
    const cards = screen.getAllByTestId('employee-card')
    const emp4Card = cards.find(card => within(card).queryByText('陳雅婷'))
    await user.click(emp4Card!)

    // Confirm the clock-in
    await user.click(screen.getByText('確認打卡'))

    // Modal should close
    expect(screen.queryByText(/確認 陳雅婷 的上班打卡？/)).toBeNull()
  })

  it('should handle confirm for clockOut action', async () => {
    vi.useRealTimers()
    resetApi() // Re-reset with real date after restoring real timers
    const user = userEvent.setup()
    render(<ClockIn />)

    // Click 打卡下班 button for emp-002 (clocked in)
    await user.click(screen.getByText('打卡下班'))

    // Confirm the clock-out
    await user.click(screen.getByText('確認下班'))

    // Modal should close
    expect(screen.queryByText(/確認 李美玲 的下班打卡？/)).toBeNull()
  })

  it('should handle confirm for cancelVacation action via button', async () => {
    vi.useRealTimers()
    resetApi() // Re-reset with real date after restoring real timers
    const user = userEvent.setup()
    render(<ClockIn />)

    // Click 取消休假 button for emp-003
    await user.click(screen.getByText('取消休假'))

    // Modal should open with cancelVacation title
    const titles = screen.getAllByText(/取消 張大偉 的休假？/)
    expect(titles.length).toBe(2)

    // Confirm the cancellation
    await user.click(screen.getByText('確認取消'))

    // Modal should close
    expect(screen.queryByText(/取消 張大偉 的休假？/)).toBeNull()
  })

  it('should handle confirm for vacation action via button', async () => {
    vi.useRealTimers()
    resetApi() // Re-reset with real date after restoring real timers
    const user = userEvent.setup()
    render(<ClockIn />)

    // Click 申請休假 button for emp-004
    await user.click(screen.getByText('申請休假'))

    // Modal should open with vacation title
    const titles = screen.getAllByText(/確認 陳雅婷 的休假打卡？/)
    expect(titles.length).toBe(2)

    // Confirm the vacation
    await user.click(screen.getByText('確認休假'))

    // Modal should close
    expect(screen.queryByText(/確認 陳雅婷 的休假打卡？/)).toBeNull()
  })

  it('should support keyboard navigation on employee cards', () => {
    render(<ClockIn />)
    const cards = screen.getAllByTestId('employee-card')
    // All cards should have role="button" and tabIndex
    for (const card of cards) {
      expect(card.getAttribute('role')).toBe('button')
      expect(card.getAttribute('tabindex')).toBe('0')
    }
  })
})
