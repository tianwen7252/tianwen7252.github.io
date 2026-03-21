import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import i18n from '@/lib/i18n'
import { SettingsPage } from './settings-page'

// Mock child components to isolate settings page tests
vi.mock('@/components/clock-in', () => ({
  ClockIn: () => <div data-testid="clock-in-component">ClockIn</div>,
}))
vi.mock('@/components/records', () => ({
  Records: () => <div data-testid="records-component">Records</div>,
}))
vi.mock('@/components/staff-admin', () => ({
  StaffAdmin: () => <div data-testid="staff-admin-component">StaffAdmin</div>,
}))
vi.mock('@/components/auth-guard', () => ({
  AuthGuard: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="auth-guard">{children}</div>
  ),
}))
vi.mock('@/components/app-error-boundary', () => ({
  AppErrorBoundary: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}))

describe('SettingsPage', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('zh-TW')
  })

  describe('tab rendering', () => {
    it('should render tab labels in zh-TW by default', () => {
      render(<SettingsPage />)
      expect(screen.getByText('打卡')).toBeTruthy()
      expect(screen.getByText('打卡記錄')).toBeTruthy()
      expect(screen.getByText('員工管理')).toBeTruthy()
    })

    it('should render tab labels in English when language is en', async () => {
      await i18n.changeLanguage('en')
      render(<SettingsPage />)
      expect(screen.getByText('Clock In')).toBeTruthy()
      expect(screen.getByText('Records')).toBeTruthy()
      expect(screen.getByText('Staff Admin')).toBeTruthy()
    })
  })

  describe('language switcher', () => {
    it('should render language selector with label', () => {
      render(<SettingsPage />)
      expect(screen.getByLabelText('語言')).toBeTruthy()
    })

    it('should display zh-TW as default selected language', () => {
      render(<SettingsPage />)
      const select = screen.getByLabelText('語言') as HTMLSelectElement
      expect(select.value).toBe('zh-TW')
    })

    it('should have both language options', () => {
      render(<SettingsPage />)
      expect(screen.getByText('繁體中文')).toBeTruthy()
      expect(screen.getByText('English')).toBeTruthy()
    })

    it('should switch to English when en is selected', async () => {
      const user = userEvent.setup()
      render(<SettingsPage />)

      const select = screen.getByLabelText('語言') as HTMLSelectElement
      await user.selectOptions(select, 'en')

      // After switching, the language label should change to English
      expect(i18n.language).toBe('en')
    })

    it('should switch back to zh-TW from English', async () => {
      await i18n.changeLanguage('en')
      const user = userEvent.setup()
      render(<SettingsPage />)

      const select = screen.getByLabelText('Language') as HTMLSelectElement
      await user.selectOptions(select, 'zh-TW')

      expect(i18n.language).toBe('zh-TW')
    })
  })

  describe('tab switching', () => {
    it('should show ClockIn component by default', () => {
      render(<SettingsPage />)
      expect(screen.getByTestId('clock-in-component')).toBeTruthy()
    })

    it('should show Records component when records tab is clicked', async () => {
      const user = userEvent.setup()
      render(<SettingsPage />)

      await user.click(screen.getByText('打卡記錄'))
      expect(screen.getByTestId('records-component')).toBeTruthy()
    })

    it('should show StaffAdmin component when staff-admin tab is clicked', async () => {
      const user = userEvent.setup()
      render(<SettingsPage />)

      await user.click(screen.getByText('員工管理'))
      expect(screen.getByTestId('staff-admin-component')).toBeTruthy()
    })
  })
})
