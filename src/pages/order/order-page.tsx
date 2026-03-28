import { ProductGrid, OrderPanel } from '@/components/order'

/** Main order page combining product menu (left) and order summary (right) */
export function OrderPage() {
  return (
    <div className="flex h-[calc(100vh-57px)] gap-0">
      {/* Left panel — product menu (65%), relative for calculator overlay */}
      <div className="relative flex-64 overflow-y-auto px-4 py-2">
        <ProductGrid />
      </div>

      {/* Right panel — order summary (35%) */}
      <div className="flex-36 overflow-y-auto border-l border-border bg-card p-4">
        <OrderPanel />
      </div>
    </div>
  )
}
