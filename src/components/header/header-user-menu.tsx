/**
 * HeaderUserMenu — login/logout UI for the app header.
 * When logged out: shows UserRound icon, clicking triggers mock admin login.
 * When logged in: shows avatar (first char of admin name), clicking opens logout confirm.
 *
 * TODO: Replace mock login with real Google OAuth.
 */

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { UserRound } from 'lucide-react'
import { useAppStore } from '@/stores/app-store'
import { ConfirmModal } from '@/components/modal/modal'
import { RippleButton } from '@/components/ui/ripple-button'
import { notify } from '@/components/ui/sonner'

// Mock admin credentials — same as AuthGuard, to be replaced with Google OAuth
const MOCK_ADMIN = {
  id: 'admin-001',
  name: '管理員',
  email: 'admin@tianwen.app',
} as const

// ─── Component ───────────────────────────────────────────────────────────────

export function HeaderUserMenu() {
  const { t } = useTranslation()
  const currentEmployeeId = useAppStore(s => s.currentEmployeeId)
  const setCurrentEmployee = useAppStore(s => s.setCurrentEmployee)
  const logout = useAppStore(s => s.logout)

  const [logoutModalOpen, setLogoutModalOpen] = useState(false)

  const isLoggedIn = currentEmployeeId !== null

  // TODO: Replace with Google OAuth sign-in flow
  function handleLogin() {
    setCurrentEmployee(MOCK_ADMIN.id, true)
    notify.success(t('auth.loginSuccess', { name: MOCK_ADMIN.name }))
  }

  function handleLogout() {
    logout()
    setLogoutModalOpen(false)
    notify.success(t('auth.logoutSuccess'))
  }

  return (
    <>
      {/* Trigger button — logged out: UserRound icon, logged in: text avatar */}
      {isLoggedIn ? (
        <RippleButton
          data-testid="header-avatar"
          aria-label={t('auth.logout')}
          rippleColor="rgba(0,0,0,0.1)"
          className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground text-md overflow-hidden"
          onClick={() => setLogoutModalOpen(true)}
        >
          {MOCK_ADMIN.name.charAt(0).toUpperCase()}
        </RippleButton>
      ) : (
        <RippleButton
          data-testid="header-login"
          aria-label={t('auth.loginTitle')}
          rippleColor="rgba(0,0,0,0.1)"
          className="flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          onClick={handleLogin}
        >
          <UserRound size={20} />
        </RippleButton>
      )}

      {/* Logout confirmation modal */}
      <ConfirmModal
        open={logoutModalOpen}
        title={t('auth.logoutConfirm')}
        onConfirm={handleLogout}
        onCancel={() => setLogoutModalOpen(false)}
      >
        <p className="text-center text-md text-muted-foreground">
          {t('auth.logoutMessage', { name: MOCK_ADMIN.name })}
        </p>
      </ConfirmModal>
    </>
  )
}
