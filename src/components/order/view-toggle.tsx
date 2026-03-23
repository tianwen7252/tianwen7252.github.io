import { LayoutGrid, List } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ViewToggleProps {
  readonly mode: 'grid' | 'list'
  readonly onToggle: () => void
}

/**
 * Toggle button that switches between grid and list view modes.
 * Currently only grid mode is functional (list is a visual placeholder).
 */
export function ViewToggle({ mode, onToggle }: ViewToggleProps) {
  const isGrid = mode === 'grid'

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={onToggle}
      aria-label={isGrid ? '切換列表檢視' : '切換格狀檢視'}
    >
      {isGrid ? <LayoutGrid className="size-5" /> : <List className="size-5" />}
    </Button>
  )
}
