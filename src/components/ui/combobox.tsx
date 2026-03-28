import { useState, useRef, useEffect } from 'react'
import { X } from 'lucide-react'
import { Popover, PopoverContent, PopoverAnchor } from '@/components/ui/popover'
import { RippleButton } from '@/components/ui/ripple-button'
import { cn } from '@/lib/cn'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface ComboboxOption {
  readonly value: string
  readonly label: string
}

interface ComboboxProps {
  /** Available options to select from */
  readonly options: readonly ComboboxOption[]
  /** Current value */
  readonly value: string
  /** Called when the value changes (via selection or custom input) */
  readonly onChange: (value: string) => void
  /** Called when an option is deleted */
  readonly onDelete?: (value: string) => void
  /** Placeholder text */
  readonly placeholder?: string
  /** CSS class for the input wrapper */
  readonly className?: string
}

// ─── Component ──────────────────────────────────────────────────────────────

/**
 * Combobox with search filtering, custom value support, and option deletion.
 * When search text doesn't match any option, the typed text is used as the value.
 */
export function Combobox({
  options,
  value,
  onChange,
  onDelete,
  placeholder,
  className,
}: ComboboxProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  // Sync external value changes to search
  useEffect(() => {
    setSearch(value)
  }, [value])

  const filtered = options.filter(opt =>
    opt.label.toLowerCase().includes(search.toLowerCase()),
  )

  const handleInputChange = (text: string) => {
    setSearch(text)
    onChange(text)
    if (!open) setOpen(true)
  }

  const handleSelect = (optionValue: string) => {
    const option = options.find(o => o.value === optionValue)
    const label = option?.label ?? optionValue
    setSearch(label)
    onChange(label)
    setOpen(false)
  }

  const handleDelete = (optionValue: string, e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete?.(optionValue)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        <input
          ref={inputRef}
          type="text"
          value={search}
          placeholder={placeholder}
          onChange={e => handleInputChange(e.target.value)}
          onFocus={() => setOpen(true)}
          className={cn(
            'w-full rounded-md border border-border bg-card px-3 py-2 text-base outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring',
            className,
          )}
        />
      </PopoverAnchor>

      <PopoverContent
        className="w-(--radix-popover-trigger-width) p-1"
        align="start"
        onOpenAutoFocus={e => e.preventDefault()}
      >
        {filtered.length === 0 ? (
          <p className="px-2 py-1.5 text-base text-muted-foreground">
            {search ? search : '—'}
          </p>
        ) : (
          <ul className="max-h-48 overflow-y-auto">
            {filtered.map(opt => (
              <li
                key={opt.value}
                onClick={() => handleSelect(opt.value)}
                className="flex cursor-pointer items-center justify-between rounded px-2 py-1.5 text-base hover:bg-accent"
              >
                <span className="truncate">{opt.label}</span>
                {onDelete && (
                  <RippleButton
                    onClick={e => handleDelete(opt.value, e)}
                    rippleColor="rgba(0,0,0,0.1)"
                    className="ml-2 flex shrink-0 items-center justify-center rounded text-muted-foreground hover:text-destructive"
                  >
                    <X className="size-3.5" />
                  </RippleButton>
                )}
              </li>
            ))}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  )
}
