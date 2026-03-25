/**
 * ProductKpiGrid — 3-column × 2-row grid of 6 product KPI cards.
 * The totalRevenue card uses NeonGradientCard for visual emphasis.
 * All numeric values animate via NumberTicker.
 */

import type { ReactNode } from 'react'
import type { ProductKpis } from '@/lib/repositories/statistics-repository'
import { NumberTicker } from '@/components/ui/number-ticker'
import { NeonGradientCard } from '@/components/ui/neon-gradient-card'
import { cn } from '@/lib/cn'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProductKpiGridProps {
  kpis: ProductKpis
}

// ─── KPI card subcomponent ────────────────────────────────────────────────────

interface KpiCardInnerProps {
  title: string
  children: ReactNode
}

function KpiCardInner({ title, children }: KpiCardInnerProps) {
  return (
    <>
      <p className="text-muted-foreground text-base">{title}</p>
      <div className="mt-1 text-2xl font-medium">{children}</div>
    </>
  )
}

// Plain card wrapper — used for the 5 non-highlighted KPIs.
interface PlainCardProps extends KpiCardInnerProps {
  className?: string
}

function PlainCard({ title, children, className }: PlainCardProps) {
  return (
    <article
      className={cn(
        'rounded-xl border bg-card p-4',
        className,
      )}
    >
      <KpiCardInner title={title}>{children}</KpiCardInner>
    </article>
  )
}

// ─── TWD ticker ───────────────────────────────────────────────────────────────

/**
 * Renders an animated currency value. Because NumberTicker emits a raw number,
 * we layer a static prefix "$" with the formatted whole-number portion.
 */
interface TwdTickerProps {
  value: number
  testId: string
}

function TwdTicker({ value, testId }: TwdTickerProps) {
  return (
    <span data-testid={testId}>
      <span aria-hidden>$</span>
      <NumberTicker value={value} />
    </span>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

/**
 * Displays all 6 product KPIs in a responsive 3-column grid.
 * totalRevenue is highlighted with NeonGradientCard.
 */
export function ProductKpiGrid({ kpis }: ProductKpiGridProps) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {/* Row 1 — revenue KPIs */}

      {/* totalRevenue: NeonGradientCard highlight */}
      <article>
        <NeonGradientCard>
          <KpiCardInner title="總營業額">
            <TwdTicker value={kpis.totalRevenue} testId="kpi-totalRevenue" />
          </KpiCardInner>
        </NeonGradientCard>
      </article>

      <PlainCard title="訂單數量">
        <span data-testid="kpi-orderCount">
          <NumberTicker value={kpis.orderCount} />
        </span>
      </PlainCard>

      <PlainCard title="上午營業額">
        <TwdTicker value={kpis.morningRevenue} testId="kpi-morningRevenue" />
      </PlainCard>

      {/* Row 2 */}

      <PlainCard title="下午營業額">
        <TwdTicker value={kpis.afternoonRevenue} testId="kpi-afternoonRevenue" />
      </PlainCard>

      <PlainCard title="訂單總數量">
        <span data-testid="kpi-totalQuantity">
          <NumberTicker value={kpis.totalQuantity} />
        </span>
      </PlainCard>

      <PlainCard title="便當銷售數量">
        <span data-testid="kpi-bentoQuantity">
          <NumberTicker value={kpis.bentoQuantity} />
        </span>
      </PlainCard>
    </div>
  )
}
