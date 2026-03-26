/**
 * StaffKpiGrid — 4-column grid of staff KPI cards.
 * Shows active employee count, total attendance days,
 * average monthly hours, and leave count.
 * All numeric values animate via NumberTicker.
 */

import { useTranslation } from 'react-i18next'
import type { StaffKpis } from '@/lib/repositories/statistics-repository'
import { NumberTicker } from '@/components/ui/number-ticker'

// ─── Types ────────────────────────────────────────────────────────────────────

interface StaffKpiGridProps {
  kpis: StaffKpis
}

// ─── KPI card subcomponent ────────────────────────────────────────────────────

interface KpiCardProps {
  title: string
  children: React.ReactNode
}

function KpiCard({ title, children }: KpiCardProps) {
  return (
    <article className="rounded-xl border bg-card p-4">
      <p className="text-muted-foreground text-base">{title}</p>
      <div className="mt-1 text-2xl font-medium">{children}</div>
    </article>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

/**
 * Renders 4 staff KPI cards in a grid-cols-4 layout.
 * avgMonthlyHours is displayed with 1 decimal place and an "h" suffix.
 */
export function StaffKpiGrid({ kpis }: StaffKpiGridProps) {
  const { t } = useTranslation()

  return (
    <div className="grid grid-cols-4 gap-4">
      <KpiCard title={t('analytics.activeEmployees')}>
        <span data-testid="kpi-activeEmployeeCount">
          <NumberTicker value={kpis.activeEmployeeCount} />
        </span>
      </KpiCard>

      <KpiCard title={t('analytics.totalAttendanceDays')}>
        <span data-testid="kpi-totalAttendanceDays">
          <NumberTicker value={kpis.totalAttendanceDays} />
        </span>
      </KpiCard>

      <KpiCard title={t('analytics.avgMonthlyHours')}>
        <span data-testid="kpi-avgMonthlyHours">
          <NumberTicker value={kpis.avgMonthlyHours} decimalPlaces={1} />
          {' h'}
        </span>
      </KpiCard>

      <KpiCard title={t('analytics.leaveCount')}>
        <span data-testid="kpi-leaveCount">
          <NumberTicker value={kpis.leaveCount} />
        </span>
      </KpiCard>
    </div>
  )
}
