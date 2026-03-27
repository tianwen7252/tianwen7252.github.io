/**
 * HeaderUserMenu — Google OAuth login/logout UI for the app header.
 * Uses Google Identity Services (GIS) token client directly (V1 compatible).
 * When logged out: shows UserRound icon, clicking triggers Google Sign-In.
 * When logged in: shows avatar (employee image > Google photo > text initial).
 */

import { useState, useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { UserRound } from 'lucide-react'
import { useAppStore, isAdminUser } from '@/stores/app-store'
import type { GoogleUser } from '@/stores/app-store'
import { getEmployeeRepo } from '@/lib/repositories/provider'
import { ConfirmModal } from '@/components/modal/modal'
import { RippleButton } from '@/components/ui/ripple-button'
import { notify } from '@/components/ui/sonner'
import { cn } from '@/lib/cn'

// ─── Constants ───────────────────────────────────────────────────────────────

const GOOGLE_CLIENT_ID =
  '799987452297-qetqo8blfushga2h064of13epeqtgh4a.apps.googleusercontent.com'
const USERINFO_URL = 'https://www.googleapis.com/oauth2/v3/userinfo'
const GIS_SCOPES = 'openid email profile'

// ─── GIS type declarations ───────────────────────────────────────────────────

interface TokenResponse {
  access_token: string
  error?: string
  error_description?: string
}

interface TokenClient {
  requestAccessToken: () => void
}

interface GoogleOAuth2 {
  initTokenClient: (config: {
    client_id: string
    scope: string
    callback: (response: TokenResponse) => void
  }) => TokenClient
}

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: GoogleOAuth2
      }
    }
  }
}

// ─── Component ───────────────────────────────────────────────────────────────

export function HeaderUserMenu() {
  const { t } = useTranslation()
  const googleUser = useAppStore(s => s.googleUser)
  const setGoogleUser = useAppStore(s => s.setGoogleUser)
  const logout = useAppStore(s => s.logout)

  const [logoutModalOpen, setLogoutModalOpen] = useState(false)
  const tokenClientRef = useRef<TokenClient | null>(null)

  const isLoggedIn = googleUser !== null

  // Fetch employees to check if logged-in user matches an admin employee
  const { data: matchedEmployee } = useQuery({
    queryKey: ['employee-match', googleUser?.email],
    queryFn: async () => {
      const employees = await getEmployeeRepo().findAll()
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

  // Handle token response from GIS
  const handleTokenResponse = useCallback(
    async (tokenResponse: TokenResponse) => {
      if (tokenResponse.error) {
        notify.error(
          `${t('auth.loginError')}: ${tokenResponse.error_description ?? tokenResponse.error}`,
        )
        return
      }
      try {
        const res = await fetch(USERINFO_URL, {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        })
        if (!res.ok) throw new Error('Failed to fetch user info')
        const userInfo = (await res.json()) as GoogleUser
        const admin = isAdminUser(userInfo.sub)
        setGoogleUser(userInfo, tokenResponse.access_token, admin)
        notify.success(t('auth.loginSuccess', { name: userInfo.name }))
      } catch (err) {
        notify.error(
          t('auth.loginError') +
            (err instanceof Error ? `: ${err.message}` : ''),
        )
      }
    },
    [setGoogleUser, t],
  )

  // Initialize GIS token client and request access token
  const handleLogin = useCallback(() => {
    if (!window.google?.accounts?.oauth2) {
      notify.error(
        t('auth.loginError') + ': Google Identity Services not loaded',
      )
      return
    }

    if (!tokenClientRef.current) {
      tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: GIS_SCOPES,
        callback: handleTokenResponse,
      })
    }

    tokenClientRef.current.requestAccessToken()
  }, [handleTokenResponse, t])

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
          onClick={handleLogin}
        >
          <UserRound size={20} />
        </RippleButton>
      )}

      {/* Logout confirmation modal */}
      <ConfirmModal
        open={logoutModalOpen}
        variant="red"
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
