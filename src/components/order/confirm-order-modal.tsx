import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal } from '@/components/modal/modal'
import { ScrollArea } from '@/components/ui/scroll-area'
import { groupCartItems } from '@/lib/group-cart-items'
import type { CartItem, Discount } from '@/stores/order-store'
import { CircleCheckBig, Utensils, Soup, LoaderCircle } from 'lucide-react'
import { ChangePrediction } from './change-prediction'
import { OrderNoteTags } from './order-note-tags'

// ─── Types ───────────────────────────────────────────────────────────────────

interface ConfirmOrderModalProps {
  readonly open: boolean
  readonly onClose: () => void
  readonly onConfirm: (memoTags: string[]) => void
  readonly items: readonly CartItem[]
  readonly discounts: readonly Discount[]
  readonly total: number
  readonly bentoCount: number
  readonly soupCount: number
  readonly isSubmitting: boolean
}

// ─── Category accent color ──────────────────────────────────────────────────

const CATEGORY_ACCENT: Record<string, { border: string; text: string }> = {
  bento: { border: 'border-l-[#7f956a]', text: 'text-[#7f956a]' },
  single: { border: 'border-l-[#d4a76a]', text: 'text-[#d4a76a]' },
  drink: { border: 'border-l-[#6aa3d4]', text: 'text-[#6aa3d4]' },
  dumpling: { border: 'border-l-[#c47fd4]', text: 'text-[#c47fd4]' },
  other: { border: 'border-l-[#999]', text: 'text-[#999]' },
  discount: { border: 'border-l-[#e57373]', text: 'text-[#e57373]' },
}

const DEFAULT_ACCENT = { border: 'border-l-gray-300', text: 'text-gray-400' }

// ─── Component ───────────────────────────────────────────────────────────────

/**
 * Confirmation modal that displays cart items grouped by category.
 * Left panel shows categorized items; right panel contains order note tags,
 * change prediction, and total amount.
 */
export function ConfirmOrderModal({
  open,
  onClose,
  onConfirm,
  items,
  discounts,
  total,
  bentoCount,
  soupCount,
  isSubmitting,
}: ConfirmOrderModalProps) {
  const { t } = useTranslation()
  const groups = groupCartItems(items, discounts)
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  // Reset selected tags when modal opens
  useEffect(() => {
    if (open) setSelectedTags([])
  }, [open])

  return (
    <Modal
      animated
      open={open}
      header={
        <>
          <CircleCheckBig /> {t('order.confirmTitle')}
        </>
      }
      title={
        <div
          data-testid="confirm-total-row"
          className="text-[2rem] text-[#ecb05d]"
        >
          {t('order.total')}: ${total.toLocaleString()}
        </div>
      }
      width={960}
      height={560}
      closeOnBackdropClick={false}
      onClose={onClose}
      footer={
        <div className="flex w-full gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-black/8 bg-white/50 px-4 py-3 text-md text-gray-600 transition hover:-translate-y-0.5"
          >
            {t('common.cancel')}
          </button>
          <button
            type="button"
            onClick={() => onConfirm(selectedTags)}
            disabled={isSubmitting}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-md text-white transition hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting && <LoaderCircle className="size-4 animate-spin" />}
            {t('order.confirmSubmit')}
          </button>
        </div>
      }
    >
      <div className="flex h-full gap-0">
        {/* ── Left panel: categorized items ── */}
        <ScrollArea className="flex-5" watchDeps={[groups]}>
          <div className="space-y-4 pr-5">
            {groups.map((group) => {
              const accent = CATEGORY_ACCENT[group.key] ?? DEFAULT_ACCENT
              return (
                <div
                  key={group.key}
                  className={`border-l-3 pl-3 ${accent.border}`}
                >
                  {/* Category label */}
                  <div
                    className={`mb-1.5 text-md tracking-wide ${accent.text}`}
                  >
                    {t(group.label)}
                  </div>
                  {/* Regular items */}
                  {group.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-baseline justify-between py-[5px]"
                    >
                      <span className="text-md text-gray-800">{item.name}</span>
                      <span className="mx-2 flex-1 border-b border-dotted border-gray-300" />
                      <span className="text-gray-400">x{item.quantity}</span>
                      <span className="ml-3 min-w-[3.5rem] text-right tabular-nums font-semibold text-gray-700">
                        ${(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                  {/* Discount items */}
                  {group.discounts?.map((discount) => (
                    <div
                      key={discount.id}
                      className="flex items-baseline justify-between py-[5px] text-[15px]"
                    >
                      <span className="text-md text-gray-800">
                        {discount.label}
                      </span>
                      <span className="mx-2 flex-1 border-b border-dotted border-gray-300" />
                      <span className="min-w-[3.5rem] text-right tabular-nums font-semibold text-red-500">
                        -${discount.amount.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        </ScrollArea>

        {/* ── Divider ── */}
        <div className="mx-1 w-px bg-black/8" />

        {/* ── Right panel ── */}
        <div className="flex flex-5 flex-col gap-5 pl-5">
          {/* Order note tags */}
          <OrderNoteTags
            selectedTags={selectedTags}
            onSelectedTagsChange={setSelectedTags}
          />

          {/* Change prediction + Bento/Soup counts + Total — pinned to bottom */}
          <div className="mt-auto flex flex-col gap-3">
            {bentoCount > 0 && (
              <div
                data-testid="confirm-bento-soup-row"
                className="flex items-center gap-4 text-sm text-gray-500"
              >
                <span className="flex items-center gap-1">
                  <Utensils className="size-4" />
                  {t('order.bentoCount', { count: bentoCount })}
                </span>
                <span className="flex items-center gap-1">
                  <Soup className="size-4" />
                  {t('order.soupCount', { count: soupCount })}
                </span>
              </div>
            )}
            <ChangePrediction total={total} />
          </div>
        </div>
      </div>
    </Modal>
  )
}
