import { useState } from 'react'

// Variant-specific subtitle messages
const SUBTITLES: Record<AuthGuardVariant, string> = {
  staffAdmin: '此頁面僅限管理員使用，請以管理員帳號登入',
  backup: '此功能僅限管理員使用，請以管理員帳號登入',
}

// Mock admin credentials for development
const MOCK_ADMIN = {
  name: '管理員',
  email: 'admin@tianwen.app',
} as const

type AuthGuardVariant = 'staffAdmin' | 'backup'

interface AdminInfo {
  readonly name: string
  readonly email: string
}

interface AuthGuardProps {
  readonly children: React.ReactNode
  readonly variant?: AuthGuardVariant
}

/**
 * Protects content behind admin authentication.
 * Shows a 403-style login screen when unauthenticated.
 * Uses mock local state for auth (no real OAuth yet).
 */
export function AuthGuard({
  children,
  variant = 'staffAdmin',
}: AuthGuardProps) {
  const [admin, setAdmin] = useState<AdminInfo | null>(null)

  // TODO: Replace with real Google OAuth before production
  const handleLogin = () => {
    setAdmin({ ...MOCK_ADMIN })
  }

  const handleLogout = () => {
    setAdmin(null)
  }

  // Unauthenticated: show 403-style login screen
  if (!admin) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-6 p-10">
        <div className="text-6xl" aria-hidden="true">
          &#x1F512;
        </div>
        <h2 className="text-2xl font-semibold text-foreground">權限不足</h2>
        <p className="text-muted-foreground">{SUBTITLES[variant]}</p>
        <button
          type="button"
          className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          onClick={handleLogin}
        >
          管理員登入
        </button>
      </div>
    )
  }

  // Authenticated: admin bar + children
  return (
    <>
      <div className="flex items-center justify-end gap-3 border-b border-border px-6 py-2">
        <span className="text-sm text-muted-foreground">
          {admin.name} / {admin.email}
        </span>
        <button
          type="button"
          className="rounded-lg px-3 py-1 text-sm font-semibold text-muted-foreground hover:bg-accent"
          onClick={handleLogout}
        >
          登出
        </button>
      </div>
      {children}
    </>
  )
}
