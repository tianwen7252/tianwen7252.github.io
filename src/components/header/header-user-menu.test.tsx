/**
 * Tests for HeaderUserMenu component with Google OAuth.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// ─── Mocks ───────────────────────────────────────────────────────────────────

const mockSetGoogleUser = vi.fn()
const mockLogout = vi.fn()
let mockGoogleUser: {
  sub: string
  name: string
  email: string
  picture?: string
} | null = null

vi.mock('@/stores/app-store', () => ({
  useAppStore: (selector: (state: Record<string, unknown>) => unknown) =>
    selector({
      googleUser: mockGoogleUser,
      setGoogleUser: mockSetGoogleUser,
      logout: mockLogout,
    }),
  isAdminUser: (sub: string) => sub === '112232479673923380065',
}))

// Mock @react-oauth/google
const mockGoogleLogin = vi.fn()

vi.mock('@react-oauth/google', () => ({
  useGoogleLogin: () => mockGoogleLogin,
}))

const mockNotifySuccess = vi.fn()
const mockNotifyError = vi.fn()

vi.mock('@/components/ui/sonner', () => ({
  notify: {
    success: (...args: unknown[]) => mockNotifySuccess(...args),
    error: (...args: unknown[]) => mockNotifyError(...args),
  },
}))

import { HeaderUserMenu } from './header-user-menu'

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('HeaderUserMenu', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGoogleUser = null
  })

  describe('when not logged in', () => {
    it('renders a UserRound login button', () => {
      render(<HeaderUserMenu />)
      expect(screen.getByTestId('header-login')).toBeTruthy()
    })

    it('calls googleLogin on click', async () => {
      const user = userEvent.setup()
      render(<HeaderUserMenu />)
      await user.click(screen.getByTestId('header-login'))
      expect(mockGoogleLogin).toHaveBeenCalledOnce()
    })
  })

  describe('when logged in', () => {
    beforeEach(() => {
      mockGoogleUser = {
        sub: '112232479673923380065',
        name: 'Tianwen',
        email: 'tianwen@example.com',
        picture: 'https://example.com/photo.jpg',
      }
    })

    it('renders avatar image when user has a picture', () => {
      render(<HeaderUserMenu />)
      const avatar = screen.getByTestId('header-avatar')
      const img = avatar.querySelector('img')
      expect(img).toBeTruthy()
      expect(img?.getAttribute('src')).toBe('https://example.com/photo.jpg')
    })

    it('renders text initial when user has no picture', () => {
      mockGoogleUser = {
        sub: '123',
        name: 'Alice',
        email: 'alice@example.com',
      }
      render(<HeaderUserMenu />)
      const avatar = screen.getByTestId('header-avatar')
      expect(avatar.textContent).toContain('A')
    })

    it('opens logout modal on avatar click', async () => {
      const user = userEvent.setup()
      render(<HeaderUserMenu />)
      await user.click(screen.getByTestId('header-avatar'))
      expect(screen.getAllByText('確認登出？').length).toBeGreaterThan(0)
    })

    it('shows user name in logout modal', async () => {
      const user = userEvent.setup()
      render(<HeaderUserMenu />)
      await user.click(screen.getByTestId('header-avatar'))
      expect(screen.getByText('目前登入：Tianwen')).toBeTruthy()
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
