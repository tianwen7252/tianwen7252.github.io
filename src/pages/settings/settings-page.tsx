import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/cn'
import { SystemInfo } from '@/components/settings/system-info'
import { ClockIn } from '@/components/clock-in'
import { Records } from '@/components/records'
import { StaffAdmin } from '@/components/staff-admin'
import { AuthGuard } from '@/components/auth-guard'

type TabKey = 'system-info' | 'clock-in' | 'records' | 'staff-admin'

interface Tab {
  readonly key: TabKey
  readonly labelKey: string
}

const TABS: readonly Tab[] = [
  { key: 'system-info', labelKey: 'settings.systemInfo' },
  { key: 'clock-in', labelKey: 'nav.clockIn' },
  { key: 'records', labelKey: 'nav.records' },
  { key: 'staff-admin', labelKey: 'nav.staffAdmin' },
]

export function SettingsPage() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<TabKey>('system-info')

  return (
    <div>
      {/* Tab navigation */}
      <div className="border-b border-border bg-card px-6">
        <div className="flex gap-1">
          {TABS.map(tab => (
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
        {activeTab === 'system-info' && <SystemInfo />}
        {activeTab === 'clock-in' && <ClockIn />}
        {activeTab === 'records' && <Records />}
        {activeTab === 'staff-admin' && (
          <AuthGuard variant="staffAdmin">
            <StaffAdmin />
          </AuthGuard>
        )}
      </div>
    </div>
  )
}
