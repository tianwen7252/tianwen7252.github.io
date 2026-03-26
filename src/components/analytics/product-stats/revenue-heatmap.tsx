/**
 * RevenueHeatmap — monthly revenue heatmap grid.
 * Each day is rendered as a cell whose background opacity reflects its
 * revenue relative to the month's peak day. The peak day is highlighted
 * with a NeonGradientCard.
 */

import { NeonGradientCard } from '@/components/ui/neon-gradient-card'
import type { DailyRevenue } from '@/lib/repositories/statistics-repository'

// ─── Types ────────────────────────────────────────────────────────────────────

interface RevenueHeatmapProps {
  /** Daily revenue entries for the target month. */
  data: DailyRevenue[]
  year: number
  /** Month number 1–12. */
  month: number
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MIN_OPACITY = 0.05
const MAX_OPACITY = 0.85

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Returns the number of days in the given year/month (1-indexed month). */
function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}

/** Build a Map from day-of-month to revenue. */
function buildRevenueMap(data: DailyRevenue[]): Map<number, number> {
  const map = new Map<number, number>()
  for (const d of data) {
    const day = Number(d.date.split('-')[2])
    map.set(day, d.revenue)
  }
  return map
}

/** Compute opacity [MIN_OPACITY, MAX_OPACITY] proportional to revenue share. */
function computeOpacity(revenue: number, maxRevenue: number): number {
  if (maxRevenue <= 0) return MIN_OPACITY
  return MIN_OPACITY + (revenue / maxRevenue) * (MAX_OPACITY - MIN_OPACITY)
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Renders a calendar-like grid where each day cell's background opacity
 * represents its revenue share of the month's maximum.
 */
export function RevenueHeatmap({ data, year, month }: RevenueHeatmapProps) {
  const totalDays = daysInMonth(year, month)
  const revenueMap = buildRevenueMap(data)

  const maxRevenue = Math.max(...Array.from(revenueMap.values()), 0)

  // Find peak day (first occurrence of max revenue among days that have data).
  const peakDay = maxRevenue > 0
    ? Array.from(revenueMap.entries()).reduce<number | null>(
        (best, [day, rev]) => (rev === maxRevenue && best === null ? day : best),
        null,
      )
    : null

  return (
    <div aria-label="月營收熱力圖" role="region">
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: totalDays }, (_, i) => {
          const day = i + 1
          const revenue = revenueMap.get(day) ?? 0
          const opacity = computeOpacity(revenue, maxRevenue)
          const isPeak = day === peakDay

          const cellContent = (
            <div
              data-testid="heatmap-cell"
              className="flex aspect-square items-center justify-center rounded-md text-sm"
              style={{
                backgroundColor: `hsl(221 83% 53% / ${isPeak ? 1 : opacity})`,
                color: opacity > 0.5 ? 'white' : 'hsl(var(--foreground))',
              }}
            >
              {day}
            </div>
          )

          if (isPeak) {
            return (
              <NeonGradientCard key={day} innerClassName="p-0">
                {cellContent}
              </NeonGradientCard>
            )
          }

          return <div key={day}>{cellContent}</div>
        })}
      </div>
    </div>
  )
}
