/**
 * PriceChangeLogSection -- Displays a paginated, date-grouped list
 * of commodity price changes for the product management page.
 */

import { useState, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronLeft, ChevronRight, FileText } from 'lucide-react'
import { RippleButton } from '@/components/ui/ripple-button'
import { getPriceChangeLogRepo } from '@/lib/repositories'
import { useDbQuery } from '@/hooks/use-db-query'
import type { PriceChangeLog } from '@/lib/schemas'

// ── Constants ──────────────────────────────────────────────────────────────

const PAGE_SIZE = 20

// ── Types ──────────────────────────────────────────────────────────────────

interface DateGroup {
  readonly date: string
  readonly items: readonly PriceChangeLog[]
}

// ── Helpers ────────────────────────────────────────────────────────────────

/**
 * Format a timestamp to a locale date string (YYYY-MM-DD).
 */
function formatDate(timestamp: number): string {
  const d = new Date(timestamp)
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

/**
 * Group price change logs by date, preserving the DESC order from the query.
 */
function groupByDate(logs: readonly PriceChangeLog[]): readonly DateGroup[] {
  const map = new Map<string, PriceChangeLog[]>()
  const order: string[] = []

  for (const log of logs) {
    const date = formatDate(log.createdAt)
    if (!map.has(date)) {
      map.set(date, [])
      order.push(date)
    }
    map.get(date)!.push(log)
  }

  return order.map(date => ({
    date,
    items: map.get(date)!,
  }))
}

// ── Component ──────────────────────────────────────────────────────────────

interface PriceChangeLogSectionProps {
  readonly refreshKey: number
}

export function PriceChangeLogSection({
  refreshKey,
}: PriceChangeLogSectionProps) {
  const { t } = useTranslation()
  const [page, setPage] = useState(1)

  // Reset page when refreshKey changes
  const [prevRefreshKey, setPrevRefreshKey] = useState(refreshKey)
  if (prevRefreshKey !== refreshKey) {
    setPrevRefreshKey(refreshKey)
    setPage(1)
  }

  // Load data
  const offset = (page - 1) * PAGE_SIZE

  const logs = useDbQuery(
    () => getPriceChangeLogRepo().findAll(PAGE_SIZE, offset),
    [page, refreshKey],
    [] as PriceChangeLog[],
  )

  const totalCount = useDbQuery(
    () => getPriceChangeLogRepo().count(),
    [refreshKey],
    0,
  )

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))

  // Group logs by date
  const dateGroups = useMemo(() => groupByDate(logs), [logs])

  // Pagination handlers
  const handlePrevious = useCallback(() => {
    setPage(p => Math.max(1, p - 1))
  }, [])

  const handleNext = useCallback(() => {
    setPage(p => Math.min(totalPages, p + 1))
  }, [totalPages])

  const showPagination = totalCount > PAGE_SIZE

  return (
    <section>
      <h2 className="mb-4 text-lg text-foreground">
        {t('productMgmt.priceLog.title')}
      </h2>

      {logs.length === 0 ? (
        <div className="flex items-center gap-2 text-base text-muted-foreground">
          <FileText size={16} />
          <span>{t('productMgmt.priceLog.empty')}</span>
        </div>
      ) : (
        <div className="space-y-4">
          {dateGroups.map(group => (
            <div key={group.date}>
              {/* Date header */}
              <div className="mb-2 text-base text-muted-foreground">
                {group.date}
              </div>

              {/* Price change entries */}
              <div className="space-y-1">
                {group.items.map(log => (
                  <div
                    key={log.id}
                    className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-2 text-base"
                  >
                    <span className="text-foreground">{log.commodityName}</span>
                    <span className="ml-auto text-muted-foreground">
                      ${log.oldPrice}
                    </span>
                    <span className="text-muted-foreground">&rarr;</span>
                    <span className="text-foreground">${log.newPrice}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Pagination */}
          {showPagination && (
            <div className="flex items-center justify-center gap-4 pt-2">
              <RippleButton
                disabled={page <= 1}
                className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-3 py-2 text-base text-foreground hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
                onClick={handlePrevious}
              >
                <ChevronLeft size={16} />
                {t('productMgmt.priceLog.previous')}
              </RippleButton>

              <span className="text-base text-muted-foreground">
                {t('productMgmt.priceLog.page', {
                  current: page,
                  total: totalPages,
                })}
              </span>

              <RippleButton
                disabled={page >= totalPages}
                className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-3 py-2 text-base text-foreground hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
                onClick={handleNext}
              >
                {t('productMgmt.priceLog.next')}
                <ChevronRight size={16} />
              </RippleButton>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
