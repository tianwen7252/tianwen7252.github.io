import { useMemo } from 'react'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'
import { Pencil, Trash2 } from 'lucide-react'
import { SwipeActions } from '@/components/ui/swipe-actions'
import type { Order } from '@/lib/schemas'
import { formatCurrency } from '@/lib/currency'
import { groupOrderItems } from '@/lib/group-order-items'
import {
  CATEGORY_ACCENT,
  DEFAULT_ACCENT,
} from '@/lib/constants/category-accent'
import type { SwipeAction } from '@/components/ui/swipe-actions'

// ─── Constants ───────────────────────────────────────────────────────────────

const EDIT_ACTION_COLOR = '#a1c185'
const DELETE_ACTION_COLOR = '#ef4444'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface OrderHistoryCardProps {
  readonly order: Order
  readonly typeIdMap: ReadonlyMap<string, string>
  readonly onDelete: () => void
  readonly onEdit?: () => void
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Build the list of swipe actions — always includes edit and delete */
function buildSwipeActions(
  onDelete: () => void,
  onEdit?: () => void,
): readonly SwipeAction[] {
  return [
    {
      key: 'edit',
      icon: <Pencil size={20} color="#fff" />,
      color: EDIT_ACTION_COLOR,
      label: '編輯',
      onClick: onEdit ?? (() => {}),
    },
    {
      key: 'delete',
      icon: <Trash2 size={20} color="#fff" />,
      color: DELETE_ACTION_COLOR,
      label: '刪除',
      onClick: onDelete,
    },
  ]
}

// ─── Component ───────────────────────────────────────────────────────────────

/**
 * Displays a single historical order as a card wrapped in SwipeActions.
 * Shows categorized item list grouped by commodity type.
 * Swipe left to reveal edit and delete action buttons.
 */
export function OrderHistoryCard({
  order,
  typeIdMap,
  onDelete,
  onEdit,
}: OrderHistoryCardProps) {
  const { t } = useTranslation()
  // AM/PM format for time display
  const formattedTime = dayjs(order.createdAt).format('h:mm A')
  const isDiscounted =
    order.originalTotal !== undefined && order.originalTotal > order.total
  const actions = buildSwipeActions(onDelete, onEdit)
  const hasUpdate = order.updatedAt !== order.createdAt

  // Group items by category using the commodity lookup map
  const groups = useMemo(
    () => groupOrderItems(order.items, order.discounts, typeIdMap),
    [order.items, order.discounts, typeIdMap],
  )

  return (
    <SwipeActions actions={actions} className="rounded-xl border border-border">
      <div
        data-testid="order-history-card"
        className="rounded-xl bg-card p-4 flex flex-col h-full"
      >
        {/* Row 1: Order number + time */}
        <div className="flex items-center justify-between mb-1">
          <span className="text-base font-semibold">#{order.number}</span>
          <span className="text-sm text-muted-foreground">{formattedTime}</span>
        </div>

        {/* Row 2: Categorized items */}
        <div className="flex flex-col gap-2 mb-2">
          {groups.map(group => {
            const accent = CATEGORY_ACCENT[group.key] ?? DEFAULT_ACCENT
            return (
              <div
                key={group.key}
                className={`border-l-3 pl-3 ${accent.border}`}
              >
                <div className={`mb-1 text-md tracking-wide ${accent.text}`}>
                  {t(group.label)}
                </div>
                {group.items.map(item => (
                  <div
                    key={item.id}
                    className="flex items-baseline justify-between py-[3px]"
                  >
                    <span className="text-md text-gray-800">{item.name}</span>
                    <span className="mx-2 flex-1 border-b border-dotted border-gray-300" />
                    <span className="text-gray-400">x{item.quantity}</span>
                  </div>
                ))}
              </div>
            )
          })}
        </div>

        {/* Row 3: Memo tags */}
        {order.memo.length > 0 && (
          <div data-testid="memo-tags" className="flex gap-1.5 mb-2">
            {order.memo.map(tag => (
              <span
                key={tag}
                className="inline-block px-2 py-0.5 text-xs rounded-lg bg-[#F8F4EC] text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Row 4: Update time (left) + Total price (right) */}
        <div className="flex items-baseline justify-between mt-auto">
          {/* Left: update time */}
          {hasUpdate ? (
            <span className="text-sm text-muted-foreground">
              {t('orders.updatedAt')}:{' '}
              {dayjs(order.updatedAt).format('YYYY/MM/DD HH:mm:ss')}
            </span>
          ) : (
            <span />
          )}
          {/* Right: total price */}
          <div className="flex items-baseline gap-2">
            {isDiscounted && (
              <span className="text-xs text-muted-foreground line-through">
                {formatCurrency(order.originalTotal, { allowEmpty: true })}
              </span>
            )}
            <span className="text-lg font-semibold">
              {formatCurrency(order.total)}
            </span>
          </div>
        </div>
      </div>
    </SwipeActions>
  )
}
