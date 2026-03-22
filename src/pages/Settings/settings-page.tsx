import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/cn'
import { ClockIn } from '@/components/clock-in'
import { Records } from '@/components/records'
import { StaffAdmin } from '@/components/staff-admin'
import { AuthGuard } from '@/components/auth-guard'

type TabKey = 'clock-in' | 'records' | 'staff-admin'

interface Tab {
  readonly key: TabKey
  readonly labelKey: string
}

const TABS: readonly Tab[] = [
  { key: 'clock-in', labelKey: 'nav.clockIn' },
  { key: 'records', labelKey: 'nav.records' },
  { key: 'staff-admin', labelKey: 'nav.staffAdmin' },
]

export function SettingsPage() {
  const { t, i18n } = useTranslation()
  const [activeTab, setActiveTab] = useState<TabKey>('clock-in')

  return (
    <div>
      {/* Tab navigation */}
      <div className="border-b border-border bg-card px-6">
        <div className="flex gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={cn(
                'border-b-2 px-4 py-3 text-sm font-medium transition-colors',
                activeTab === tab.key
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground',
              )}
              onClick={() => setActiveTab(tab.key)}
            >
              {t(tab.labelKey)}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div>
        {activeTab === 'clock-in' && <ClockIn />}
        {activeTab === 'records' && <Records />}
        {activeTab === 'staff-admin' && (
          <AuthGuard variant="staffAdmin">
            <StaffAdmin />
          </AuthGuard>
        )}
      </div>

      {/* Language switcher */}
      <div className="fixed bottom-4 right-4 flex items-center gap-2">
        <label htmlFor="language-select" className="text-sm font-medium">
          {t('settings.language')}
        </label>
        <select
          id="language-select"
          value={i18n.language}
          onChange={(e) => i18n.changeLanguage(e.target.value)}
          className="rounded-md border border-border bg-card px-2 py-1 text-sm"
        >
          <option value="zh-TW">{t('settings.zhTW')}</option>
          <option value="en">{t('settings.en')}</option>
        </select>
      </div>
    </div>
  )
}
