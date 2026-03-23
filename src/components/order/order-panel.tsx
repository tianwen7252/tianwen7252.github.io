import { useState, useRef, useEffect } from 'react'
import { ClipboardList, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useOrderStore } from '@/stores/order-store'
import { SwipeToDelete } from '@/components/ui/swipe-to-delete'
import { OrderItemRow } from './order-item-row'
import { DiscountSection } from './discount-section'
import { OrderSummary } from './order-summary'

/** Main order panel (right sidebar) wiring store data to presentational components */
export function OrderPanel() {
  const items = useOrderStore((s) => s.items)
  const discounts = useOrderStore((s) => s.discounts)
  const removeItem = useOrderStore((s) => s.removeItem)
  const updateQuantity = useOrderStore((s) => s.updateQuantity)
  const updateNote = useOrderStore((s) => s.updateNote)
  const removeDiscount = useOrderStore((s) => s.removeDiscount)
  const getSubtotal = useOrderStore((s) => s.getSubtotal)
  const getTotalDiscount = useOrderStore((s) => s.getTotalDiscount)
  const getTotal = useOrderStore((s) => s.getTotal)
  const getItemCount = useOrderStore((s) => s.getItemCount)
  const clearCart = useOrderStore((s) => s.clearCart)
  const submitOrder = useOrderStore((s) => s.submitOrder)

  const { t } = useTranslation()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new items are added
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTo({
        top: listRef.current.scrollHeight,
        behavior: 'smooth',
      })
    }
  }, [items.length])

  const subtotal = getSubtotal()
  const totalDiscount = getTotalDiscount()
  const total = getTotal()
  const itemCount = getItemCount()
  const isEmpty = items.length === 0

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      await submitOrder()
      toast.success(t('order.submitSuccess'))
    } catch {
      toast.error(t('order.submitError'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <ClipboardList className="size-5" />
        <h3 className="text-base font-semibold">{t('order.currentOrder')}</h3>
        {itemCount > 0 && (
          <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
            {itemCount}
          </span>
        )}
        <div className="flex-1" />
        {itemCount > 0 && (
          <Button
            variant="outline"
            size="icon-xs"
            aria-label={t('order.clearCart')}
            disabled={isEmpty}
            onClick={clearCart}
            className="border text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="size-4" />
          </Button>
        )}
      </div>

      {/* Order items list */}
      <div ref={listRef} className="flex-1 overflow-y-auto">
        {isEmpty ? (
          <p className="py-8 text-center text-muted-foreground">
            {t('order.emptyOrder')}
          </p>
        ) : (
          <div className="divide-y divide-border">
            {items.map((item) => (
              <SwipeToDelete key={item.id} onDelete={() => removeItem(item.id)}>
                <OrderItemRow
                  item={item}
                  onRemove={removeItem}
                  onUpdateQuantity={updateQuantity}
                  onUpdateNote={updateNote}
                />
              </SwipeToDelete>
            ))}
          </div>
        )}
      </div>

      {/* Divider */}
      <hr className="border-border" />

      {/* Order summary */}
      <OrderSummary
        subtotal={subtotal}
        totalDiscount={totalDiscount}
        total={total}
      />

      {/* Discount section */}
      <DiscountSection
        discounts={discounts}
        onRemoveDiscount={removeDiscount}
      />

      {/* Submit button */}
      <Button
        className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
        size="lg"
        disabled={isEmpty || isSubmitting}
        onClick={handleSubmit}
      >
        {t('order.submit')}
      </Button>
    </div>
  )
}
