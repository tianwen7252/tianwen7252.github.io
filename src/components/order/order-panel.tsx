import { useState, useRef, useEffect } from 'react'
import { ClipboardList, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { notify } from '@/components/ui/sonner'
import { Button } from '@/components/ui/button'
import { ScrollArea, type ScrollAreaHandle } from '@/components/ui/scroll-area'
import { useOrderStore } from '@/stores/order-store'
import { SwipeToDelete } from '@/components/ui/swipe-to-delete'
import { OrderItemRow } from './order-item-row'
import { OrderSummary } from './order-summary'

/** Main order panel (right sidebar) wiring store data to presentational components */
export function OrderPanel() {
  const items = useOrderStore((s) => s.items)
  const removeItem = useOrderStore((s) => s.removeItem)
  const updateQuantity = useOrderStore((s) => s.updateQuantity)
  const updateNote = useOrderStore((s) => s.updateNote)
  const getSubtotal = useOrderStore((s) => s.getSubtotal)
  const getTotal = useOrderStore((s) => s.getTotal)
  const getItemCount = useOrderStore((s) => s.getItemCount)
  const clearCart = useOrderStore((s) => s.clearCart)
  const submitOrder = useOrderStore((s) => s.submitOrder)
  const lastAddedItem = useOrderStore((s) => s.lastAddedItem)

  const { t } = useTranslation()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const scrollRef = useRef<ScrollAreaHandle>(null)

  // Scroll to the last added/updated item
  useEffect(() => {
    if (!lastAddedItem) return
    const el = scrollRef.current?.el
    if (!el) return
    const target = el.querySelector(`[data-cart-item-id="${lastAddedItem[0]}"]`)
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [lastAddedItem])

  const subtotal = getSubtotal()
  const total = getTotal()
  const itemCount = getItemCount()
  const isEmpty = items.length === 0

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      await submitOrder()
      notify.success(t('order.submitSuccess'))
    } catch {
      notify.error(t('order.submitError'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex h-full flex-col gap-4 px-4 pb-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <ClipboardList className="size-5" />
        <h3 className="text-base">{t('order.currentOrder')}</h3>
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
      <ScrollArea ref={scrollRef} className="flex-1" watchDeps={[items.length, lastAddedItem]}>
        {isEmpty ? (
          <p className="py-8 text-center text-muted-foreground">
            {t('order.emptyOrder')}
          </p>
        ) : (
          <div className="divide-y divide-border pr-2">
            {items.map((item) => (
              <div key={item.id} data-cart-item-id={item.id}>
                <SwipeToDelete onDelete={() => removeItem(item.id)}>
                  <OrderItemRow
                    item={item}
                    onRemove={removeItem}
                    onUpdateQuantity={updateQuantity}
                    onUpdateNote={updateNote}
                  />
                </SwipeToDelete>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Divider */}
      <hr className="border-border" />

      {/* Order summary */}
      <OrderSummary
        subtotal={subtotal}
        total={total}
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
