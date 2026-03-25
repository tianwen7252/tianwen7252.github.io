/**
 * AnalyticsTabBar — tab switcher for the analytics page.
 * Provides "商品統計" and "員工統計" tab options.
 */

import { cn } from '@/lib/cn'
import { RippleButton } from '@/components/ui/ripple-button'

// ─── Types ────────────────────────────────────────────────────────────────────

export type AnalyticsTab = 'product' | 'staff'

interface AnalyticsTabBarProps {
  readonly activeTab: AnalyticsTab
  readonly onTabChange: (tab: AnalyticsTab) => void
}

// ─── Tab definitions ──────────────────────────────────────────────────────────

const TABS: { value: AnalyticsTab; label: string }[] = [
  { value: 'product', label: '商品統計' },
  { value: 'staff', label: '員工統計' },
]

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Horizontal tab bar for switching between product and staff statistics.
 * Uses RippleButton for each tab per project conventions.
 */
export function AnalyticsTabBar({ activeTab, onTabChange }: AnalyticsTabBarProps) {
  return (
    <div role="tablist" className="flex gap-1 rounded-lg bg-muted p-1">
      {TABS.map(tab => (
        <RippleButton
          key={tab.value}
          role="tab"
          type="button"
          aria-selected={activeTab === tab.value}
          onClick={() => onTabChange(tab.value)}
          className={cn(
            'flex-1 rounded-md px-4 py-2 text-base font-medium transition-colors',
            activeTab === tab.value
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {tab.label}
        </RippleButton>
      ))}
    </div>
  )
}
