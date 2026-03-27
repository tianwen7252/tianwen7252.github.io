/**
 * HeaderUserMenu — Google OAuth login/logout UI for the app header.
 * When logged out: shows UserRound icon, clicking triggers Google Sign-In.
 * When logged in: shows avatar (Google photo or text initial), clicking opens logout confirm.
 */

import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useGoogleLogin } from '@react-oauth/google'
import { useQuery } from '@tanstack/react-query'
import { UserRound } from 'lucide-react'
import { useAppStore, isAdminUser } from '@/stores/app-store'
import type { GoogleUser } from '@/stores/app-store'
import { getEmployeeRepo } from '@/lib/repositories/provider'
import { ConfirmModal } from '@/components/modal/modal'
import { RippleButton } from '@/components/ui/ripple-button'
import { notify } from '@/components/ui/sonner'
import { cn } from '@/lib/cn'

// Google UserInfo endpoint
const USERINFO_URL = 'https://www.googleapis.com/oauth2/v3/userinfo'

// ─── Component ───────────────────────────────────────────────────────────────

export function HeaderUserMenu() {
  const { t } = useTranslation()
  const googleUser = useAppStore(s => s.googleUser)
  const setGoogleUser = useAppStore(s => s.setGoogleUser)
  const logout = useAppStore(s => s.logout)

  const [logoutModalOpen, setLogoutModalOpen] = useState(false)

  const isLoggedIn = googleUser !== null

  // Fetch employees to check if logged-in user matches an admin employee
  const { data: matchedEmployee } = useQuery({
    queryKey: ['employee-match', googleUser?.email],
    queryFn: async () => {
      const employees = await getEmployeeRepo().findAll()
      // Match by name (employee name === Google display name)
      return employees.find(
        e => e.status === 'active' && e.name === googleUser?.name,
      )
    },
    enabled: isLoggedIn,
    staleTime: 60_000,
  })

  // Avatar priority: employee avatar > Google picture > text initial
  const avatarSrc = matchedEmployee?.avatar ?? googleUser?.picture
  const displayName = googleUser?.name ?? ''

  // Google OAuth login flow — popup-based
  const googleLogin = useGoogleLogin({
    scope: 'openid email profile',
    onSuccess: useCallback(
      async (tokenResponse: { access_token: string }) => {
        try {
          const res = await fetch(USERINFO_URL, {
            headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
          })
          if (!res.ok) throw new Error('Failed to fetch user info')
          const userInfo = (await res.json()) as GoogleUser
          const admin = isAdminUser(userInfo.sub)
          setGoogleUser(userInfo, tokenResponse.access_token, admin)
          notify.success(t('auth.loginSuccess', { name: userInfo.name }))
        } catch {
          notify.error(t('auth.loginError'))
        }
      },
      [setGoogleUser, t],
    ),
    onError: () => {
      notify.error(t('auth.loginError'))
    },
  })

  function handleLogout() {
    logout()
    setLogoutModalOpen(false)
    notify.success(t('auth.logoutSuccess'))
  }

  return (
    <>
      {/* Trigger button — logged out: UserRound icon, logged in: avatar */}
      {isLoggedIn ? (
        <RippleButton
          data-testid="header-avatar"
          aria-label={t('auth.logout')}
          rippleColor="rgba(0,0,0,0.1)"
          className="flex size-9 items-center justify-center rounded-full overflow-hidden"
          onClick={() => setLogoutModalOpen(true)}
        >
          {avatarSrc ? (
            <img
              src={avatarSrc}
              alt={displayName}
              className="size-9 rounded-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground text-md">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
        </RippleButton>
      ) : (
        <RippleButton
          data-testid="header-login"
          aria-label={t('auth.loginTitle')}
          rippleColor="rgba(0,0,0,0.1)"
          className={cn(
            'flex size-9 items-center justify-center rounded-md transition-colors hover:bg-accent hover:text-accent-foreground',
            'text-muted-foreground',
          )}
          onClick={() => googleLogin()}
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
          {t('auth.logoutMessage', { name: displayName })}
        </p>
      </ConfirmModal>
    </>
  )
}
