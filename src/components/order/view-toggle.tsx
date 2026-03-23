import { Calculator } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ViewToggleProps {
  readonly mode: 'grid' | 'list'
  readonly onToggle: () => void
}

/**
 * Calculator button — placeholder for future calculator/quick-entry feature.
 * Positioned at the top-right of the product grid header.
 */
export function ViewToggle({ onToggle }: ViewToggleProps) {
  return (
    <Button
      variant="outline"
      size="icon-sm"
      onClick={onToggle}
      aria-label="計算機"
      className="border"
    >
      <Calculator className="size-5" />
    </Button>
  )
}
