import { cn } from '@/lib/cn'
import type { CommondityType } from '@/lib/schemas'

interface CategoryTabsProps {
  readonly categories: readonly CommondityType[]
  readonly selectedTypeId: string | null
  readonly onSelect: (typeId: string) => void
}

/**
 * Horizontal pill-shaped category tabs for filtering products.
 * Active tab uses the primary (Moss green) theme color.
 */
export function CategoryTabs({
  categories,
  selectedTypeId,
  onSelect,
}: CategoryTabsProps) {
  if (categories.length === 0) {
    return <div role="tablist" aria-label="商品分類" />
  }

  return (
    <div
      role="tablist"
      aria-label="商品分類"
      className="flex flex-wrap gap-2"
    >
      {categories.map(category => {
        const isActive = category.typeId === selectedTypeId
        return (
          <button
            key={category.id}
            role="tab"
            type="button"
            data-active={isActive}
            aria-selected={isActive}
            onClick={() => onSelect(category.typeId)}
            className={cn(
              'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80',
            )}
          >
            {category.label}
          </button>
        )
      })}
    </div>
  )
}
