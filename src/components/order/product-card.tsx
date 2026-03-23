import { cn } from '@/lib/cn'
import type { Commondity } from '@/lib/schemas'

interface ProductCardProps {
  readonly commodity: Commondity
  readonly onAdd: (commodity: {
    id: string
    name: string
    price: number
  }) => void
}

/**
 * Product card displaying image, name, and price.
 * The entire card is clickable to add the item to the cart.
 */
export function ProductCard({ commodity, onAdd }: ProductCardProps) {
  const handleClick = () => {
    onAdd({
      id: commodity.id,
      name: commodity.name,
      price: commodity.price,
    })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        'flex w-full cursor-pointer flex-col items-center rounded-xl bg-card p-3 shadow-sm',
        'transition-all hover:shadow-md active:scale-[0.97]',
      )}
    >
      {commodity.image != null && (
        <img
          src={commodity.image}
          alt={commodity.name}
          className="mb-2 size-20 rounded-full object-cover"
        />
      )}
      <span className="text-sm font-bold text-card-foreground">
        {commodity.name}
      </span>
      <span className="text-sm text-muted-foreground">
        ${commodity.price}
      </span>
    </button>
  )
}
