import { useState, useCallback, useMemo } from 'react'
import { X, Square, SquareCheckBig } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/cn'
import { Input } from '@/components/ui/input'

// ─── Constants ──────────────────────────────────────────────────────────────

const DEFAULT_TAGS = ['攤位', '外送', '電話自取'] as const
const STORAGE_KEY = 'order-note-tags'

// ─── Types ──────────────────────────────────────────────────────────────────

interface OrderNoteTagsProps {
  /** Currently selected tag labels */
  readonly selectedTags: readonly string[]
  /** Callback when selected tags change */
  readonly onSelectedTagsChange: (tags: string[]) => void
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Load custom tags from localStorage. Returns empty array on failure. */
function loadCustomTags(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((item): item is string => typeof item === 'string')
  } catch {
    return []
  }
}

/** Save custom tags to localStorage. */
function saveCustomTags(tags: readonly string[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tags))
  } catch {
    // Quota exceeded or private browsing — tags remain in memory for this session
  }
}

// ─── Component ──────────────────────────────────────────────────────────────

/**
 * Renders order note tags (default + custom) as toggleable pills.
 * Custom tags are persisted to localStorage.
 */
export function OrderNoteTags({
  selectedTags,
  onSelectedTagsChange,
}: OrderNoteTagsProps) {
  const { t } = useTranslation()
  const [customTags, setCustomTags] =
    useState<readonly string[]>(loadCustomTags)
  const [inputValue, setInputValue] = useState('')

  const allTags = useMemo(() => [...DEFAULT_TAGS, ...customTags], [customTags])

  const handleToggleTag = useCallback(
    (tag: string) => {
      const isSelected = selectedTags.includes(tag)
      const nextTags = isSelected
        ? selectedTags.filter((t) => t !== tag)
        : [...selectedTags, tag]
      onSelectedTagsChange(nextTags)
    },
    [selectedTags, onSelectedTagsChange],
  )

  const handleAddTag = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key !== 'Enter') return
      const trimmed = inputValue.trim()
      if (!trimmed) return

      // Reject duplicates
      if (allTags.includes(trimmed)) {
        setInputValue('')
        return
      }

      const nextCustomTags = [...customTags, trimmed]
      setCustomTags(nextCustomTags)
      saveCustomTags(nextCustomTags)
      setInputValue('')
    },
    [inputValue, allTags, customTags],
  )

  const handleDeleteTag = useCallback(
    (tag: string) => {
      const nextCustomTags = customTags.filter((t) => t !== tag)
      setCustomTags(nextCustomTags)
      saveCustomTags(nextCustomTags)

      // Also remove from selected if it was selected
      if (selectedTags.includes(tag)) {
        onSelectedTagsChange(selectedTags.filter((t) => t !== tag))
      }
    },
    [customTags, selectedTags, onSelectedTagsChange],
  )

  const isDefaultTag = (tag: string): boolean =>
    (DEFAULT_TAGS as readonly string[]).includes(tag)

  return (
    <div className="space-y-2.5">
      <h4 className="text-md tracking-wide text-gray-500">
        {t('order.orderNote')}
      </h4>

      {/* Tag pills */}
      <div className="flex flex-wrap gap-2">
        {allTags.map((tag) => {
          const isSelected = selectedTags.includes(tag)
          const isDefault = isDefaultTag(tag)

          return (
            <span
              key={tag}
              data-tag={tag}
              className={cn(
                'inline-flex cursor-pointer items-center gap-1 rounded-full px-3 py-1 text-sm transition-colors select-none',
                isSelected
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground',
              )}
              onClick={() => handleToggleTag(tag)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') handleToggleTag(tag)
              }}
            >
              {isSelected ? (
                <SquareCheckBig className="size-3.5" />
              ) : (
                <Square className="size-3.5" />
              )}
              {tag}
              {!isDefault && (
                <button
                  data-tag-delete={tag}
                  type="button"
                  className="ml-0.5 inline-flex items-center rounded-full p-0.5 hover:bg-destructive/20"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteTag(tag)
                  }}
                  aria-label={`delete ${tag}`}
                >
                  <X className="size-3" />
                </button>
              )}
            </span>
          )
        })}
      </div>

      {/* Add new tag input */}
      <Input
        placeholder={t('order.addTag')}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleAddTag}
        className="h-8 w-[calc(100%-6px)] rounded-lg border-gray-200 bg-white/60 text-sm placeholder:text-gray-400"
      />
    </div>
  )
}
