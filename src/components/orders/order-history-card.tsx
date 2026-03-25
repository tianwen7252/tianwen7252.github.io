import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'
import { Pencil, Trash2 } from 'lucide-react'
import { SwipeActions } from '@/components/ui/swipe-actions'
import { parseOrderItems } from '@/lib/parse-order-items'
import type { Order } from '@/lib/schemas'
import type { SwipeAction } from '@/components/ui/swipe-actions'

// ─── Constants ───────────────────────────────────────────────────────────────

/** Maximum number of item names shown before "+N more" */
const MAX_VISIBLE_ITEMS = 3

const EDIT_ACTION_COLOR = '#a1c185'
const DELETE_ACTION_COLOR = '#ef4444'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface OrderHistoryCardProps {
  readonly order: Order
  readonly onDelete: () => void
  readonly onEdit?: () => void
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Build a compact summary string from parsed order items */
function buildItemSummary(
  items: readonly { readonly name: string; readonly quantity: number }[],
): { readonly visible: string; readonly moreCount: number } {
  const visibleItems = items.slice(0, MAX_VISIBLE_ITEMS)
  const visible = visibleItems
    .map((item) => `${item.name} x${item.quantity}`)
    .join(', ')
  const moreCount = items.length - MAX_VISIBLE_ITEMS
  return { visible, moreCount: Math.max(0, moreCount) }
}

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
 * Swipe left to reveal edit and delete action buttons.
 * Card right border-radius becomes 0 when swiped open.
 */
export function OrderHistoryCard({
  order,
  onDelete,
  onEdit,
}: OrderHistoryCardProps) {
  const { t } = useTranslation()
  const { items } = parseOrderItems(order.data)
  const { visible, moreCount } = buildItemSummary(items)
  // AM/PM format for time display
  const formattedTime = dayjs(order.createdAt).format('h:mm A')
  const isDiscounted =
    order.originalTotal !== undefined && order.originalTotal > order.total
  const actions = buildSwipeActions(onDelete, onEdit)

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

        {/* Row 2: Item summary */}
        <div className="text-md text-[#777] mb-1">
          <span>{visible}</span>
          {moreCount > 0 && (
            <span className="ml-1 text-xs text-muted-foreground/70">
              {t('orders.moreItems', { count: moreCount })}
            </span>
          )}
        </div>

        {/* Row 3: Memo tags */}
        {order.memo.length > 0 && (
          <div data-testid="memo-tags" className="flex gap-1.5 mb-2">
            {order.memo.map((tag) => (
              <span
                key={tag}
                className="inline-block px-2 py-0.5 text-xs rounded-lg bg-[#F8F4EC] text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Row 4: Total + original price */}
        <div className="flex items-baseline justify-end gap-2 mt-auto">
          {isDiscounted && (
            <span className="text-xs text-muted-foreground line-through">
              ${order.originalTotal}
            </span>
          )}
          <span className="text-lg font-semibold">${order.total}</span>
        </div>
      </div>
    </SwipeActions>
  )
}
