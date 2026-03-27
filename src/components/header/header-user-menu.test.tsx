/**
 * Tests for HeaderUserMenu component.
 * Covers mock login/logout flow and avatar display.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// ─── Mocks ───────────────────────────────────────────────────────────────────

const mockSetCurrentEmployee = vi.fn()
const mockLogout = vi.fn()
let mockCurrentEmployeeId: string | null = null
let mockIsAdmin = false

vi.mock('@/stores/app-store', () => ({
  useAppStore: (selector: (state: Record<string, unknown>) => unknown) =>
    selector({
      currentEmployeeId: mockCurrentEmployeeId,
      isAdmin: mockIsAdmin,
      setCurrentEmployee: mockSetCurrentEmployee,
      logout: mockLogout,
    }),
}))

const mockNotifySuccess = vi.fn()

vi.mock('@/components/ui/sonner', () => ({
  notify: {
    success: (...args: unknown[]) => mockNotifySuccess(...args),
  },
}))

import { HeaderUserMenu } from './header-user-menu'

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('HeaderUserMenu', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCurrentEmployeeId = null
    mockIsAdmin = false
  })

  describe('when not logged in', () => {
    it('renders a UserRound login button', () => {
      render(<HeaderUserMenu />)
      expect(screen.getByTestId('header-login')).toBeTruthy()
    })

    it('calls setCurrentEmployee on click (mock login)', async () => {
      const user = userEvent.setup()
      render(<HeaderUserMenu />)
      await user.click(screen.getByTestId('header-login'))
      expect(mockSetCurrentEmployee).toHaveBeenCalledWith('admin-001', true)
    })

    it('shows success toast on login', async () => {
      const user = userEvent.setup()
      render(<HeaderUserMenu />)
      await user.click(screen.getByTestId('header-login'))
      expect(mockNotifySuccess).toHaveBeenCalledTimes(1)
    })
  })

  describe('when logged in', () => {
    beforeEach(() => {
      mockCurrentEmployeeId = 'admin-001'
      mockIsAdmin = true
    })

    it('renders text avatar with first char', () => {
      render(<HeaderUserMenu />)
      const avatar = screen.getByTestId('header-avatar')
      expect(avatar.textContent).toContain('管')
    })

    it('opens logout modal on avatar click', async () => {
      const user = userEvent.setup()
      render(<HeaderUserMenu />)
      await user.click(screen.getByTestId('header-avatar'))
      expect(screen.getAllByText('確認登出？').length).toBeGreaterThan(0)
    })

    it('shows operator name in logout modal', async () => {
      const user = userEvent.setup()
      render(<HeaderUserMenu />)
      await user.click(screen.getByTestId('header-avatar'))
      expect(screen.getByText('目前登入：管理員')).toBeTruthy()
    })

    it('calls logout on confirm', async () => {
      const user = userEvent.setup()
      render(<HeaderUserMenu />)
      await user.click(screen.getByTestId('header-avatar'))
      await user.click(screen.getByText('確認'))
      expect(mockLogout).toHaveBeenCalledOnce()
    })

    it('shows success toast on logout', async () => {
      const user = userEvent.setup()
      render(<HeaderUserMenu />)
      await user.click(screen.getByTestId('header-avatar'))
      await user.click(screen.getByText('確認'))
      expect(mockNotifySuccess).toHaveBeenCalledTimes(1)
    })

    it('does not logout on cancel', async () => {
      const user = userEvent.setup()
      render(<HeaderUserMenu />)
      await user.click(screen.getByTestId('header-avatar'))
      await user.click(screen.getByText('取消'))
      expect(mockLogout).not.toHaveBeenCalled()
    })
  })
})
