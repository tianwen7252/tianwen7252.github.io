import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthGuard } from './auth-guard'

describe('AuthGuard', () => {
  describe('unauthenticated state', () => {
    it('should render lock icon and login screen by default', () => {
      render(
        <AuthGuard>
          <div>Protected content</div>
        </AuthGuard>,
      )
      expect(screen.queryByText('Protected content')).toBeNull()
      expect(screen.getByText('權限不足')).toBeTruthy()
      expect(screen.getByRole('button', { name: '管理員登入' })).toBeTruthy()
    })

    it('should show staffAdmin subtitle for staffAdmin variant', () => {
      render(
        <AuthGuard variant="staffAdmin">
          <div>Staff admin content</div>
        </AuthGuard>,
      )
      expect(
        screen.getByText('此頁面僅限管理員使用，請以管理員帳號登入'),
      ).toBeTruthy()
    })

    it('should show backup subtitle for backup variant', () => {
      render(
        <AuthGuard variant="backup">
          <div>Backup content</div>
        </AuthGuard>,
      )
      expect(
        screen.getByText('此功能僅限管理員使用，請以管理員帳號登入'),
      ).toBeTruthy()
    })

    it('should default to staffAdmin variant subtitle', () => {
      render(
        <AuthGuard>
          <div>Content</div>
        </AuthGuard>,
      )
      expect(
        screen.getByText('此頁面僅限管理員使用，請以管理員帳號登入'),
      ).toBeTruthy()
    })

    it('should not render children when unauthenticated', () => {
      render(
        <AuthGuard>
          <div>Secret content</div>
        </AuthGuard>,
      )
      expect(screen.queryByText('Secret content')).toBeNull()
    })
  })

  describe('authentication flow', () => {
    it('should render children after login button is clicked', async () => {
      const user = userEvent.setup()
      render(
        <AuthGuard>
          <div>Protected content</div>
        </AuthGuard>,
      )
      await user.click(screen.getByRole('button', { name: '管理員登入' }))
      expect(screen.getByText('Protected content')).toBeTruthy()
    })

    it('should show admin info bar after authentication', async () => {
      const user = userEvent.setup()
      render(
        <AuthGuard>
          <div>Content</div>
        </AuthGuard>,
      )
      await user.click(screen.getByRole('button', { name: '管理員登入' }))
      expect(screen.getByText('管理員 / admin@tianwen.app')).toBeTruthy()
      expect(screen.getByRole('button', { name: '登出' })).toBeTruthy()
    })

    it('should return to login screen after logout', async () => {
      const user = userEvent.setup()
      render(
        <AuthGuard>
          <div>Protected content</div>
        </AuthGuard>,
      )
      // Login
      await user.click(screen.getByRole('button', { name: '管理員登入' }))
      expect(screen.getByText('Protected content')).toBeTruthy()

      // Logout
      await user.click(screen.getByRole('button', { name: '登出' }))
      expect(screen.queryByText('Protected content')).toBeNull()
      expect(screen.getByRole('button', { name: '管理員登入' })).toBeTruthy()
    })
  })

  describe('variant-specific titles', () => {
    it('should show correct title for staffAdmin variant', () => {
      render(
        <AuthGuard variant="staffAdmin">
          <div>Content</div>
        </AuthGuard>,
      )
      expect(screen.getByText('權限不足')).toBeTruthy()
    })

    it('should show correct title for backup variant', () => {
      render(
        <AuthGuard variant="backup">
          <div>Content</div>
        </AuthGuard>,
      )
      expect(screen.getByText('權限不足')).toBeTruthy()
    })
  })
})
