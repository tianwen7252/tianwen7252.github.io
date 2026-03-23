export interface OrderSummaryProps {
  readonly subtotal: number
  readonly totalDiscount: number
  readonly total: number
}

/** Order summary displaying subtotal, discount, and total */
export function OrderSummary({
  subtotal,
  totalDiscount,
  total,
}: OrderSummaryProps) {
  return (
    <div className="flex flex-col gap-2">
      {/* Subtotal row */}
      <div
        data-testid="subtotal-row"
        className="flex items-center justify-between text-base"
      >
        <span>小計</span>
        <span>${subtotal.toLocaleString()}</span>
      </div>

      {/* Discount line (only shown when discount > 0) */}
      {totalDiscount > 0 && (
        <div
          data-testid="discount-line"
          className="flex items-center justify-between text-base text-muted-foreground"
        >
          <span>折扣</span>
          <span>-${totalDiscount.toLocaleString()}</span>
        </div>
      )}

      {/* Total row */}
      <div className="flex items-center justify-between pt-2">
        <span className="text-xl font-bold">TOTAL</span>
        <span
          data-testid="total-value"
          className="text-3xl font-bold"
        >
          ${total.toLocaleString()}
        </span>
      </div>
    </div>
  )
}
