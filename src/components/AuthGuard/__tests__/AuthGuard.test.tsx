import { describe, it, expect, vi, beforeEach } from 'vitest'
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AuthGuard } from '../AuthGuard'
import { AppContext } from 'src/pages/App/context'

vi.mock('src/libs/api', () => ({
  commondityTypes: { get: vi.fn() },
}))
vi.mock('src/libs/dataCenter', () => ({
  db: {},
}))

describe('AuthGuard Component', () => {
  // --- backup variant (default) ---
  it('renders children when gAPIToken is present', () => {
    const mockContext = { gAPIToken: 'fake-token', adminInfo: null } as any
    render(
      <AppContext.Provider value={mockContext}>
        <AuthGuard>
          <div>Protected Content</div>
        </AuthGuard>
      </AppContext.Provider>,
    )
    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('renders 403 Result when gAPIToken is absent', () => {
    const mockContext = { gAPIToken: undefined, adminInfo: null } as any
    render(
      <AppContext.Provider value={mockContext}>
        <AuthGuard>
          <div>Protected Content</div>
        </AuthGuard>
      </AppContext.Provider>,
    )
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
    expect(screen.getByText('權限不足')).toBeInTheDocument()
    expect(
      screen.getByText('您需要登入 Google 帳號授權後才能使用此功能。'),
    ).toBeInTheDocument()
    expect(screen.getByText('Login with Google')).toBeInTheDocument()
  })

  // --- staffAdmin variant ---
  it('renders children when adminInfo is set (staffAdmin variant)', () => {
    const mockContext = {
      gAPIToken: 'fake-token',
      adminInfo: { sub: 'test-sub', name: 'Admin', email: 'admin@test.com' },
      setAdminInfo: vi.fn(),
      setGAPIToken: vi.fn(),
    } as any
    render(
      <AppContext.Provider value={mockContext}>
        <AuthGuard variant="staffAdmin">
          <div>Admin Content</div>
        </AuthGuard>
      </AppContext.Provider>,
    )
    expect(screen.getByText('Admin Content')).toBeInTheDocument()
    expect(screen.getByText(/Admin \/ admin@test\.com/)).toBeInTheDocument()
  })

  it('renders 403 when adminInfo is null (staffAdmin variant)', () => {
    const mockContext = {
      gAPIToken: null,
      adminInfo: null,
      setAdminInfo: vi.fn(),
      setGAPIToken: vi.fn(),
    } as any
    render(
      <AppContext.Provider value={mockContext}>
        <AuthGuard variant="staffAdmin">
          <div>Admin Content</div>
        </AuthGuard>
      </AppContext.Provider>,
    )
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument()
    expect(screen.getByText('權限不足')).toBeInTheDocument()
    expect(screen.getByText('管理員登入')).toBeInTheDocument()
  })

  // --- unified login sets both gAPIToken and adminInfo ---
  describe('unified login flow', () => {
    const mockSetGAPIToken = vi.fn()
    const mockSetAdminInfo = vi.fn()

    beforeEach(() => {
      vi.clearAllMocks()

      // Mock fetch for userinfo endpoint
      global.fetch = vi.fn().mockResolvedValue({
        json: vi.fn().mockResolvedValue({
          sub: '112232479673923380065', // valid admin sub
          name: 'Tianwen',
          email: 'tianwen@example.com',
        }),
      })

      // Mock window.google.accounts.oauth2
      const mockRequestAccessToken = vi.fn()
      const mockInitTokenClient = vi.fn((config: any) => {
        // Simulate immediate token callback
        setTimeout(() => {
          config.callback({ access_token: 'mock-access-token' })
        }, 0)
        return { requestAccessToken: mockRequestAccessToken }
      })
      ;(window as any).google = {
        accounts: {
          oauth2: {
            initTokenClient: mockInitTokenClient,
          },
        },
      }
    })

    it('backup variant login sets both gAPIToken and adminInfo', async () => {
      const mockContext = {
        gAPIToken: null,
        adminInfo: null,
        setGAPIToken: mockSetGAPIToken,
        setAdminInfo: mockSetAdminInfo,
      } as any

      render(
        <AppContext.Provider value={mockContext}>
          <AuthGuard variant="backup">
            <div>Protected Content</div>
          </AuthGuard>
        </AppContext.Provider>,
      )

      fireEvent.click(screen.getByText('Login with Google'))

      await waitFor(() => {
        expect(mockSetGAPIToken).toHaveBeenCalledWith('mock-access-token')
        expect(mockSetAdminInfo).toHaveBeenCalledWith({
          sub: '112232479673923380065',
          name: 'Tianwen',
          email: 'tianwen@example.com',
        })
      })
    })

    it('staffAdmin login sets both states when sub is in whitelist', async () => {
      const mockContext = {
        gAPIToken: null,
        adminInfo: null,
        setGAPIToken: mockSetGAPIToken,
        setAdminInfo: mockSetAdminInfo,
      } as any

      render(
        <AppContext.Provider value={mockContext}>
          <AuthGuard variant="staffAdmin">
            <div>Admin Content</div>
          </AuthGuard>
        </AppContext.Provider>,
      )

      fireEvent.click(screen.getByText('管理員登入'))

      await waitFor(() => {
        expect(mockSetGAPIToken).toHaveBeenCalledWith('mock-access-token')
        expect(mockSetAdminInfo).toHaveBeenCalledWith({
          sub: '112232479673923380065',
          name: 'Tianwen',
          email: 'tianwen@example.com',
        })
      })
    })

    it('staffAdmin login rejects non-admin sub without setting state', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        json: vi.fn().mockResolvedValue({
          sub: 'non-admin-sub',
          name: 'Stranger',
          email: 'stranger@example.com',
        }),
      })

      const mockContext = {
        gAPIToken: null,
        adminInfo: null,
        setGAPIToken: mockSetGAPIToken,
        setAdminInfo: mockSetAdminInfo,
      } as any

      render(
        <AppContext.Provider value={mockContext}>
          <AuthGuard variant="staffAdmin">
            <div>Admin Content</div>
          </AuthGuard>
        </AppContext.Provider>,
      )

      fireEvent.click(screen.getByText('管理員登入'))

      await waitFor(() => {
        expect(mockSetGAPIToken).not.toHaveBeenCalled()
        expect(mockSetAdminInfo).not.toHaveBeenCalled()
      })
    })

    it('logout clears both gAPIToken and adminInfo', () => {
      const mockContext = {
        gAPIToken: 'fake-token',
        adminInfo: { sub: 'test-sub', name: 'Admin', email: 'admin@test.com' },
        setAdminInfo: mockSetAdminInfo,
        setGAPIToken: mockSetGAPIToken,
      } as any

      render(
        <AppContext.Provider value={mockContext}>
          <AuthGuard variant="staffAdmin">
            <div>Admin Content</div>
          </AuthGuard>
        </AppContext.Provider>,
      )

      fireEvent.click(screen.getByText(/登.?出/))

      expect(mockSetAdminInfo).toHaveBeenCalledWith(null)
      expect(mockSetGAPIToken).toHaveBeenCalledWith(null)
    })
  })
})
