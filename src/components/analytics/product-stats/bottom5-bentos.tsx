/**
 * Bottom5Bentos — warning list of the 5 lowest-selling bento items.
 * Uses AnimatedList for stagger entrance; color-codes by rank severity.
 */

import { cn } from '@/lib/cn'
import { AnimatedList } from '@/components/ui/animated-list'
import type { ProductRanking } from '@/lib/repositories/statistics-repository'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Bottom5BentosProps {
  /** Up to 5 bento items sorted lowest → highest quantity. */
  items: ProductRanking[]
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Returns the Tailwind color class for a given 1-based rank. */
function rankColorClass(rank: number): string {
  if (rank === 1) return 'text-destructive'
  if (rank === 2) return 'text-orange-500'
  return 'text-yellow-500'
}

// ─── Component ───────────────────────────────────────────────────────────────

/**
 * Renders a staggered list of the bottom 5 bento items.
 * The lowest-selling item is ranked #1 and shown in destructive red.
 */
export function Bottom5Bentos({ items }: Bottom5BentosProps) {
  return (
    <section aria-label="銷量最低便當">
      <AnimatedList>
        {items.map((item, index) => {
          const rank = index + 1
          return (
            <div
              key={item.comId}
              data-rank={rank}
              className={cn(
                'flex items-center gap-3 py-2',
                rankColorClass(rank),
              )}
            >
              {/* Rank badge */}
              <span className="w-6 shrink-0 text-center text-base font-medium">
                {rank}
              </span>

              {/* Name */}
              <span className="min-w-0 flex-1 truncate text-base">
                {item.name}
              </span>

              {/* Quantity */}
              <span className="shrink-0 text-base tabular-nums">
                {item.quantity}
              </span>
            </div>
          )
        })}
      </AnimatedList>
    </section>
  )
}
