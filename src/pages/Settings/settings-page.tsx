import { useState } from 'react'
import { cn } from '@/lib/cn'
import { ClockIn } from '@/components/clock-in'
import { Records } from '@/components/records'
import { StaffAdmin } from '@/components/staff-admin'
import { AuthGuard } from '@/components/auth-guard'

type TabKey = 'clock-in' | 'records' | 'staff-admin'

interface Tab {
  readonly key: TabKey
  readonly label: string
}

const TABS: readonly Tab[] = [
  { key: 'clock-in', label: '打卡' },
  { key: 'records', label: '打卡記錄' },
  { key: 'staff-admin', label: '員工管理' },
]

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('clock-in')

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
              {tab.label}
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
    </div>
  )
}
