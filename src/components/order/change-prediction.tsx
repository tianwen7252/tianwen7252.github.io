import { useTranslation } from 'react-i18next'
import { getChange } from '@/lib/get-change'

// ─── Types ──────────────────────────────────────────────────────────────────

interface ChangePredictionProps {
  readonly total: number
}

// ─── Color Map ──────────────────────────────────────────────────────────────

/** Background color class per bill denomination. */
const BILL_COLOR_MAP: Record<number, string> = {
  1000: 'bg-[#3f6ab0] text-white',
  500: 'bg-[#ae917d] text-white',
  100: 'bg-[#f38590] text-white',
}

// ─── Component ──────────────────────────────────────────────────────────────

/**
 * Renders colored pill badges predicting change for common bill denominations.
 * Returns null when no predictions are available.
 */
export function ChangePrediction({ total }: ChangePredictionProps) {
  const { t } = useTranslation()
  const predictions = getChange(total)

  if (!predictions || predictions.length === 0) {
    return null
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {predictions.map(([bill, money, change]) => (
          <span
            key={`${bill}-${money}`}
            data-testid="change-badge"
            className={`inline-flex items-center rounded-xl px-3 py-1.5 text-sm font-medium shadow-sm ${BILL_COLOR_MAP[bill] ?? ''}`}
          >
            ${money} {t('order.change')} ${change}
          </span>
        ))}
      </div>
    </div>
  )
}
