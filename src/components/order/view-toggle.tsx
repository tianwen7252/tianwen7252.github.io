import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation()
  return (
    <Button
      variant="outline"
      size="icon-sm"
      onClick={onToggle}
      aria-label={t('order.calculator')}
      className="border text-muted-foreground"
    >
      <Calculator className="size-5" />
    </Button>
  )
}
