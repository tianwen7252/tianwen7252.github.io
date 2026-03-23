import { Minus, Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { CartItem } from '@/stores/order-store'

export interface OrderItemRowProps {
  readonly item: CartItem
  readonly onRemove: (cartItemId: string) => void
  readonly onUpdateQuantity: (cartItemId: string, quantity: number) => void
  readonly onUpdateNote: (cartItemId: string, note: string) => void
}

/** Single cart item row displaying name, quantity controls, price, and optional note */
export function OrderItemRow({
  item,
  onRemove,
  onUpdateQuantity,
}: OrderItemRowProps) {
  const totalPrice = item.price * item.quantity

  const handleDecrease = () => {
    if (item.quantity <= 1) {
      onRemove(item.id)
    } else {
      onUpdateQuantity(item.id, item.quantity - 1)
    }
  }

  const handleIncrease = () => {
    onUpdateQuantity(item.id, item.quantity + 1)
  }

  return (
    <div className="flex flex-col gap-1 py-2">
      {/* Top row: name, quantity controls, price */}
      <div className="flex items-center justify-between gap-2">
        <span className="flex-1 truncate font-medium">{item.name}</span>

        {/* Quantity controls */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label="decrease"
            onClick={handleDecrease}
          >
            <Minus className="size-3" />
          </Button>
          <span className="min-w-[1.5rem] text-center text-base">
            x{item.quantity}
          </span>
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label="increase"
            onClick={handleIncrease}
          >
            <Plus className="size-3" />
          </Button>
        </div>

        {/* Price */}
        <span className="min-w-[3rem] text-right text-base font-medium">
          ${totalPrice.toLocaleString()}
        </span>

        {/* Remove button */}
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label="remove"
          onClick={() => onRemove(item.id)}
          className="text-muted-foreground hover:text-destructive"
        >
          <X className="size-3" />
        </Button>
      </div>

      {/* Note (only shown when non-empty) */}
      {item.note !== '' && (
        <p
          data-testid="order-item-note"
          className="pl-1 text-xs text-muted-foreground"
        >
          {item.note}
        </p>
      )}
    </div>
  )
}
