import React, { useCallback, useContext } from 'react'
import { Result, Button, notification } from 'antd'
import { GoogleOutlined } from '@ant-design/icons'
import { AppContext } from 'src/pages/App/context'

const gAPIID = '799987452297-qetqo8blfushga2h064of13epeqtgh4a'

const ADMIN_SUBS: string[] = []

function decodeJwtPayload(token: string) {
  const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=')
  return JSON.parse(atob(padded))
}

interface AuthGuardProps {
  children: React.ReactNode
  variant?: 'backup' | 'staffAdmin'
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children, variant = 'backup' }) => {
  const { gAPIToken, setGAPIToken, adminInfo, setAdminInfo } = useContext(AppContext)
  const [noti, contextHolder] = notification.useNotification()

  // --- backup variant (Google OAuth2 access token) ---
  const handleBackupLogin = useCallback(() => {
    const oauth = window.google?.accounts?.oauth2
    if (!oauth) {
      noti.error({ message: 'Google OAuth 尚未載入，請稍後再試' })
      return
    }

    const client = oauth.initTokenClient({
      client_id: `${gAPIID}.apps.googleusercontent.com`,
      scope: 'https://www.googleapis.com/auth/drive.file',
      callback: (tokenResponse: any) => {
        const token = tokenResponse?.access_token
        if (!token) {
          noti.error({ message: '未取得授權 Token，請重試' })
          return
        }
        setGAPIToken(token)
        noti.success({ message: '登入成功！' })
      },
    })
    client.requestAccessToken()
  }, [noti, setGAPIToken])

  // --- staffAdmin variant (Google ID Token + sub whitelist) ---
  const handleAdminLogin = useCallback(() => {
    const id = window.google?.accounts?.id
    if (!id) {
      noti.error({ message: 'Google Identity Services 尚未載入，請稍後再試' })
      return
    }

    id.initialize({
      client_id: `${gAPIID}.apps.googleusercontent.com`,
      callback: (response: any) => {
        try {
          const payload = decodeJwtPayload(response.credential)
          const { sub, name, email } = payload
          if (ADMIN_SUBS.includes(sub)) {
            setAdminInfo({ sub, name, email })
            noti.success({ message: `歡迎，${name}！` })
          } else {
            noti.error({ message: '此帳號無管理員權限' })
          }
        } catch {
          noti.error({ message: '登入驗證失敗，請重試' })
        }
      },
    })
    id.prompt()
  }, [noti, setAdminInfo])

  const handleAdminLogout = useCallback(() => {
    if (adminInfo?.sub) {
      window.google?.accounts?.id?.revoke(adminInfo.sub, () => {})
    }
    setAdminInfo(null)
  }, [adminInfo, setAdminInfo])

  // --- backup variant rendering ---
  if (variant === 'backup') {
    if (!gAPIToken) {
      return (
        <div style={{ padding: '40px 20px', display: 'flex', justifyContent: 'center' }}>
          {contextHolder}
          <Result
            status="403"
            title="權限不足"
            subTitle="您需要登入 Google 帳號授權後才能使用此功能。"
            extra={
              <Button type="primary" icon={<GoogleOutlined />} size="large" onClick={handleBackupLogin}>
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
      <div style={{ padding: '40px 20px', display: 'flex', justifyContent: 'center' }}>
        {contextHolder}
        <Result
          status="403"
          title="權限不足"
          subTitle="此頁面僅限管理員使用，請以管理員 Google 帳號登入。"
          extra={
            <Button type="primary" icon={<GoogleOutlined />} size="large" onClick={handleAdminLogin}>
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
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 12, padding: '8px 24px', borderBottom: '1px solid #f0f0f0', marginBottom: 16 }}>
        <span style={{ color: '#666' }}>{adminInfo.name} / {adminInfo.email}</span>
        <Button size="small" onClick={handleAdminLogout}>登出</Button>
      </div>
      {children}
    </>
  )
}
