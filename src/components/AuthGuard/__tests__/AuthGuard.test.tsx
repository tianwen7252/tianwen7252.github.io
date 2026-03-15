import { describe, it, expect, vi } from 'vitest'
import React from 'react'
import { render, screen } from '@testing-library/react'
import { AuthGuard } from '../AuthGuard'
import { AppContext } from 'src/pages/App/context'

vi.mock('src/libs/api', () => ({
  commondityTypes: { get: vi.fn() },
}))
vi.mock('src/libs/dataCenter', () => ({
  db: {}
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
      </AppContext.Provider>
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
      </AppContext.Provider>
    )
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
    expect(screen.getByText('權限不足')).toBeInTheDocument()
    expect(screen.getByText('您需要登入 Google 帳號授權後才能使用此功能。')).toBeInTheDocument()
    expect(screen.getByText('Login with Google')).toBeInTheDocument()
  })

  // --- staffAdmin variant ---
  it('renders children when adminInfo is set (staffAdmin variant)', () => {
    const mockContext = {
      gAPIToken: null,
      adminInfo: { sub: 'test-sub', name: 'Admin', email: 'admin@test.com' },
      setAdminInfo: vi.fn(),
    } as any
    render(
      <AppContext.Provider value={mockContext}>
        <AuthGuard variant="staffAdmin">
          <div>Admin Content</div>
        </AuthGuard>
      </AppContext.Provider>
    )
    expect(screen.getByText('Admin Content')).toBeInTheDocument()
    expect(screen.getByText(/Admin \/ admin@test\.com/)).toBeInTheDocument()
  })

  it('renders 403 when adminInfo is null (staffAdmin variant)', () => {
    const mockContext = {
      gAPIToken: null,
      adminInfo: null,
      setAdminInfo: vi.fn(),
    } as any
    render(
      <AppContext.Provider value={mockContext}>
        <AuthGuard variant="staffAdmin">
          <div>Admin Content</div>
        </AuthGuard>
      </AppContext.Provider>
    )
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument()
    expect(screen.getByText('權限不足')).toBeInTheDocument()
    expect(screen.getByText('管理員登入')).toBeInTheDocument()
  })
})
