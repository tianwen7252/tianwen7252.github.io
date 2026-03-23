import { useState, useRef, useEffect } from 'react'
import { ClipboardList } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useOrderStore } from '@/stores/order-store'
import { SwipeToDelete } from '@/components/ui/swipe-to-delete'
import { OrderItemRow } from './order-item-row'
import { DiscountSection } from './discount-section'
import { OrderSummary } from './order-summary'

/** Main order panel (right sidebar) wiring store data to presentational components */
export function OrderPanel() {
  const items = useOrderStore(s => s.items)
  const discounts = useOrderStore(s => s.discounts)
  const removeItem = useOrderStore(s => s.removeItem)
  const updateQuantity = useOrderStore(s => s.updateQuantity)
  const updateNote = useOrderStore(s => s.updateNote)
  const removeDiscount = useOrderStore(s => s.removeDiscount)
  const getSubtotal = useOrderStore(s => s.getSubtotal)
  const getTotalDiscount = useOrderStore(s => s.getTotalDiscount)
  const getTotal = useOrderStore(s => s.getTotal)
  const submitOrder = useOrderStore(s => s.submitOrder)

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
  const isEmpty = items.length === 0

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      await submitOrder()
      toast.success('訂單已提交')
    } catch {
      toast.error('提交失敗，請重試')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <ClipboardList className="size-5" />
        <h3 className="text-base font-semibold">目前訂單</h3>
      </div>

      {/* Order items list */}
      <div ref={listRef} className="flex-1 overflow-y-auto">
        {isEmpty ? (
          <p className="py-8 text-center text-muted-foreground">
            尚無訂單項目
          </p>
        ) : (
          <div className="divide-y divide-border">
            {items.map(item => (
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
        提交訂單
      </Button>
    </div>
  )
}
