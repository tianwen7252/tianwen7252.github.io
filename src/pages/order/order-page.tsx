import { ProductGrid, OrderPanel } from '@/components/order'

/** Main order page combining product menu (left) and order summary (right) */
export function OrderPage() {
  return (
    <div className="flex h-[calc(100vh-57px)] gap-0">
      {/* Left panel — product menu (65%) */}
      <div className="flex-[65] overflow-y-auto bg-background p-4">
        <ProductGrid />
      </div>

      {/* Right panel — order summary (35%) */}
      <div className="flex-[35] overflow-y-auto border-l border-border bg-card p-4">
        <OrderPanel />
      </div>
    </div>
  )
}
