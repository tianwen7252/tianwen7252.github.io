/**
 * CommodityTypeSection — Card grid showing all commodity types
 * with inline label editing capability.
 */

import { useState, useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { notify } from '@/components/ui/sonner'
import { getCommodityTypeRepo } from '@/lib/repositories'
import { useDbQuery } from '@/hooks/use-db-query'
import type { CommodityType } from '@/lib/schemas'

// ── Color mapping for type color dots ──────────────────────────────────────

const COLOR_MAP: Record<string, string> = {
  green: 'var(--color-green)',
  brown: '#8B6914',
  indigo: '#4F46E5',
  red: 'var(--color-red)',
  blue: 'var(--color-blue)',
  gold: 'var(--color-gold)',
}

function resolveColor(color: string): string {
  return COLOR_MAP[color] ?? color
}

// ── TypeCard ───────────────────────────────────────────────────────────────

interface TypeCardProps {
  readonly type: CommodityType
  readonly onLabelSaved: () => void
}

function TypeCard({ type, onLabelSaved }: TypeCardProps) {
  const { t } = useTranslation()
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(type.label)
  const inputRef = useRef<HTMLInputElement>(null)
  // Tracks whether the current edit was cancelled (Escape) to suppress the
  // subsequent blur event from triggering a save.
  const isCancelledRef = useRef(false)

  // Enter edit mode
  const handleStartEdit = useCallback(() => {
    isCancelledRef.current = false
    setEditValue(type.label)
    setIsEditing(true)
    // Focus the input after render
    setTimeout(() => inputRef.current?.focus(), 0)
  }, [type.label])

  // Save the new label
  const handleSave = useCallback(async () => {
    // If cancel was already triggered (Escape), do not save on blur
    if (isCancelledRef.current) return

    const trimmed = editValue.trim()
    setIsEditing(false)

    // If empty or unchanged, revert
    if (!trimmed || trimmed === type.label) {
      setEditValue(type.label)
      return
    }

    try {
      await getCommodityTypeRepo().update(type.id, { label: trimmed })
      notify.success(t('productMgmt.types.labelUpdated'))
      onLabelSaved()
    } catch {
      notify.error(t('productMgmt.types.saveError'))
      setEditValue(type.label)
    }
  }, [editValue, type.id, type.label, t, onLabelSaved])

  // Cancel editing and revert
  const handleCancel = useCallback(() => {
    isCancelledRef.current = true
    setIsEditing(false)
    setEditValue(type.label)
  }, [type.label])

  // Handle keyboard events
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        handleSave()
      } else if (e.key === 'Escape') {
        e.preventDefault()
        handleCancel()
      }
    },
    [handleSave, handleCancel],
  )

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
      {/* Color dot */}
      <span
        data-testid="type-color-dot"
        className="size-3 shrink-0 rounded-full"
        style={{ backgroundColor: resolveColor(type.color) }}
      />

      {/* Label — inline editable */}
      <div className="min-w-0 flex-1">
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={editValue}
            onChange={e => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
            className="w-full rounded border border-input bg-background px-2 py-1 text-base text-foreground outline-none focus:border-primary"
          />
        ) : (
          <span
            className="cursor-pointer text-base text-foreground hover:text-primary"
            onClick={handleStartEdit}
          >
            {type.label}
          </span>
        )}
      </div>

      {/* TypeId badge */}
      <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-base text-muted-foreground">
        {type.typeId}
      </span>
    </div>
  )
}

// ── CommodityTypeSection ───────────────────────────────────────────────────

export function CommodityTypeSection() {
  const { t } = useTranslation()
  const [refreshKey, setRefreshKey] = useState(0)
  const commodityTypes = useDbQuery(
    () => getCommodityTypeRepo().findAll(),
    [refreshKey],
    [] as CommodityType[],
  )

  const handleLabelSaved = useCallback(() => {
    setRefreshKey(k => k + 1)
  }, [])

  return (
    <section className="mb-8">
      <h2 className="mb-4 text-lg text-foreground">
        {t('productMgmt.types.title')}
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {commodityTypes.map(ct => (
          <TypeCard key={ct.id} type={ct} onLabelSaved={handleLabelSaved} />
        ))}
      </div>
    </section>
  )
}
