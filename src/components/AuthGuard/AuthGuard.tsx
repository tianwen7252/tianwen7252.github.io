import React, { useCallback, useContext } from 'react'
import { Result, Button, notification } from 'antd'
import { GoogleOutlined } from '@ant-design/icons'
import { AppContext } from 'src/pages/App/context'

const gAPIID = '799987452297-qetqo8blfushga2h064of13epeqtgh4a'

// Whitelist of Google account `sub` values allowed as admins
const ADMIN_SUBS: string[] = [
  '112232479673923380065', // Tianwen
  '108824661831026509560', // dev
]

const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v3/userinfo'
const OAUTH2_SCOPES =
  'https://www.googleapis.com/auth/drive.file openid email profile'

interface AuthGuardProps {
  children: React.ReactNode
  variant?: 'backup' | 'staffAdmin'
}

export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  variant = 'backup',
}) => {
  const { gAPIToken, setGAPIToken, adminInfo, setAdminInfo } =
    useContext(AppContext)
  const [noti, contextHolder] = notification.useNotification()

  // Unified login: obtains OAuth2 access token + user identity in one flow.
  // Sets both gAPIToken (for Drive API) and adminInfo (for identity).
  // staffAdmin variant additionally enforces the admin whitelist.
  const handleLogin = useCallback(() => {
    const oauth = window.google?.accounts?.oauth2
    if (!oauth) {
      noti.error({ message: 'Google OAuth 尚未載入，請稍後再試' })
      return
    }

    const client = oauth.initTokenClient({
      client_id: `${gAPIID}.apps.googleusercontent.com`,
      scope: OAUTH2_SCOPES,
      callback: async (tokenResponse: any) => {
        const token = tokenResponse?.access_token
        if (!token) {
          noti.error({ message: '未取得授權 Token，請重試' })
          return
        }

        try {
          const res = await fetch(GOOGLE_USERINFO_URL, {
            headers: { Authorization: `Bearer ${token}` },
          })
          const { sub, name, email } = await res.json()

          if (variant === 'staffAdmin' && !ADMIN_SUBS.includes(sub)) {
            noti.error({ message: '此帳號無管理員權限' })
            return
          }

          setGAPIToken(token)
          setAdminInfo({ sub, name, email })
          noti.success({
            message: variant === 'staffAdmin' ? `歡迎，${name}！` : '登入成功！',
          })
        } catch {
          noti.error({ message: '登入驗證失敗，請重試' })
        }
      },
    })
    client.requestAccessToken()
  }, [noti, setGAPIToken, setAdminInfo, variant])

  // Logout clears both states since they were obtained together
  const handleAdminLogout = useCallback(() => {
    setAdminInfo(null)
    setGAPIToken(null)
  }, [setAdminInfo, setGAPIToken])

  // --- backup variant rendering ---
  if (variant === 'backup') {
    if (!gAPIToken) {
      return (
        <div
          style={{
            padding: '40px 20px',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          {contextHolder}
          <Result
            status="403"
            title="權限不足"
            subTitle="您需要登入 Google 帳號授權後才能使用此功能。"
            extra={
              <Button
                type="primary"
                icon={<GoogleOutlined />}
                size="large"
                onClick={handleLogin}
              >
                Login with Google
              </Button>
            }
          />
        </div>
      )
    }
    return (
      <>
        {contextHolder}
        {children}
      </>
    )
  }

  // --- staffAdmin variant rendering ---
  if (!adminInfo) {
    return (
      <div
        style={{
          padding: '40px 20px',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        {contextHolder}
        <Result
          status="403"
          title="權限不足"
          subTitle="此頁面僅限管理員使用，請以管理員 Google 帳號登入。"
          extra={
            <Button
              type="primary"
              icon={<GoogleOutlined />}
              size="large"
              onClick={handleLogin}
            >
              管理員登入
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <>
      {contextHolder}
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: 12,
          padding: '8px 24px',
          borderBottom: '1px solid #f0f0f0',
          marginBottom: 16,
        }}
      >
        <span style={{ color: '#666' }}>
          {adminInfo.name} / {adminInfo.email}
        </span>
        <Button size="small" onClick={handleAdminLogout}>
          登出
        </Button>
      </div>
      {children}
    </>
  )
}
