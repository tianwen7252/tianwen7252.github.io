/**
 * Top10ProductsChart — ranked list of top 10 products with sort toggle.
 * Supports sorting by quantity (份) or revenue ($).
 * Changing sortBy re-keys the AnimatedList to replay entrance animations.
 */

import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/cn'
import { AnimatedList } from '@/components/ui/animated-list'
import { RippleButton } from '@/components/ui/ripple-button'
import type { ProductRanking } from '@/lib/repositories/statistics-repository'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Top10ProductsChartProps {
  /** Up to 10 product items sorted by the active sort criterion. */
  items: ProductRanking[]
  /** Current sort mode. */
  sortBy: 'quantity' | 'revenue'
  /** Called when the user switches sort mode. */
  onSortChange: (sort: 'quantity' | 'revenue') => void
}

// ─── Component ───────────────────────────────────────────────────────────────

/**
 * Renders a toggleable ranked list of the top 10 products.
 * The key on AnimatedList changes when sortBy changes, replaying the stagger.
 */
export function Top10ProductsChart({
  items,
  sortBy,
  onSortChange,
}: Top10ProductsChartProps) {
  const { t } = useTranslation()

  return (
    <section aria-label={t('analytics.productRanking')}>
      {/* Sort toggle */}
      <div className="mb-4 flex gap-2">
        <RippleButton
          className={cn(
            'rounded-lg px-4 py-2 text-base transition-colors',
            sortBy === 'quantity'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground',
          )}
          onClick={() => onSortChange('quantity')}
        >
          {t('analytics.sortByQuantity')}
        </RippleButton>

        <RippleButton
          className={cn(
            'rounded-lg px-4 py-2 text-base transition-colors',
            sortBy === 'revenue'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground',
          )}
          onClick={() => onSortChange('revenue')}
        >
          {t('analytics.sortByRevenue')}
        </RippleButton>
      </div>

      {/* Ranked list — re-keyed so AnimatedList replays on sort change */}
      <AnimatedList key={sortBy}>
        {items.map((item, index) => {
          const rank = index + 1
          return (
            <div
              key={item.comId}
              className="flex items-center gap-3 py-2"
            >
              {/* Rank label */}
              <span className="w-8 shrink-0 text-base text-muted-foreground">
                #{rank}
              </span>

              {/* Name */}
              <span className="min-w-0 flex-1 truncate text-base">
                {item.name}
              </span>

              {/* Metric value */}
              <span className="shrink-0 text-base font-medium tabular-nums">
                {sortBy === 'revenue'
                  ? `$${item.revenue}`
                  : `${item.quantity} ${t('analytics.quantityUnit')}`}
              </span>
            </div>
          )
        })}
      </AnimatedList>
    </section>
  )
}
