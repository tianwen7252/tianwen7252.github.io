/**
 * CommodityTypeSection -- Row list showing all commodity types
 * with drag-and-drop reorder and edit-via-modal capability.
 */

import { useState, useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { GripVertical, Pencil } from 'lucide-react'
import { Modal } from '@/components/modal'
import { RippleButton } from '@/components/ui/ripple-button'
import { Input } from '@/components/ui/input'
import { notify } from '@/components/ui/sonner'
import { getCommodityTypeRepo } from '@/lib/repositories'
import { useDbQuery } from '@/hooks/use-db-query'
import { SortableList } from './sortable-list'
import type { CommodityType } from '@/lib/schemas'
import type { DragHandleProps } from './sortable-list'

// ── TypeRow ───────────────────────────────────────────────────────────────

interface TypeRowProps {
  readonly type: CommodityType
  readonly dragHandleProps: DragHandleProps
  readonly onEdit: (type: CommodityType) => void
}

function TypeRow({ type, dragHandleProps, onEdit }: TypeRowProps) {
  const { t } = useTranslation()

  const handleEdit = useCallback(() => {
    onEdit(type)
  }, [type, onEdit])

  return (
    <div className="mb-2 flex items-center gap-3 rounded-lg border border-border bg-card p-3">
      {/* Drag handle */}
      <div
        data-testid="drag-handle"
        className="flex shrink-0 cursor-grab items-center justify-center touch-none"
        style={{ width: 44, height: 44 }}
        {...dragHandleProps.attributes}
        {...dragHandleProps.listeners}
      >
        <GripVertical size={20} className="text-muted-foreground" />
      </div>

      {/* Priority badge */}
      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-base text-muted-foreground">
        {type.priority}
      </span>

      {/* Label */}
      <span className="min-w-0 flex-1 truncate text-base text-foreground">
        {type.label}
      </span>

      {/* Edit button */}
      <RippleButton
        data-testid="edit-button"
        aria-label={t('common.edit')}
        className="flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"
        onClick={handleEdit}
      >
        <Pencil size={16} />
      </RippleButton>
    </div>
  )
}

// ── CommodityTypeSection ───────────────────────────────────────────────────

export function CommodityTypeSection() {
  const { t } = useTranslation()
  const [refreshKey, setRefreshKey] = useState(0)

  // Optimistic reorder state
  const [optimisticTypes, setOptimisticTypes] = useState<
    readonly CommodityType[] | null
  >(null)

  // Edit modal state
  const [editingType, setEditingType] = useState<CommodityType | null>(null)
  const [editValue, setEditValue] = useState('')

  const commodityTypes = useDbQuery(
    () => getCommodityTypeRepo().findAll(),
    [refreshKey],
    [] as CommodityType[],
  )

  // Refresh data
  const refresh = useCallback(() => {
    setRefreshKey(k => k + 1)
  }, [])

  // Open edit modal
  const handleEdit = useCallback((type: CommodityType) => {
    setEditingType(type)
    setEditValue(type.label)
  }, [])

  // Close edit modal
  const handleEditClose = useCallback(() => {
    setEditingType(null)
    setEditValue('')
  }, [])

  // Save label change
  const handleEditSave = useCallback(async () => {
    if (!editingType) return

    const trimmed = editValue.trim()
    if (!trimmed || trimmed === editingType.label) {
      handleEditClose()
      return
    }

    try {
      await getCommodityTypeRepo().update(editingType.id, { label: trimmed })
      notify.success(t('productMgmt.types.labelUpdated'))
      refresh()
      handleEditClose()
    } catch {
      notify.error(t('productMgmt.types.saveError'))
    }
  }, [editingType, editValue, t, refresh, handleEditClose])

  // Drag reorder with optimistic UI
  const handleReorder = useCallback(
    async (orderedIds: readonly string[]) => {
      const displayItems = optimisticTypes ?? commodityTypes
      const reordered = orderedIds
        .map((id, i) => {
          const item = displayItems.find(ct => ct.id === id)
          return item ? { ...item, priority: i + 1 } : null
        })
        .filter((ct): ct is CommodityType => ct !== null)
      setOptimisticTypes(reordered)

      try {
        await getCommodityTypeRepo().updatePriorities([...orderedIds])
        refresh()
      } catch {
        notify.error(t('productMgmt.types.reorderError'))
        setOptimisticTypes(null)
      }
    },
    [commodityTypes, optimisticTypes, refresh, t],
  )

  // Clear optimistic state when DB data refreshes
  const displayedTypes = optimisticTypes ?? commodityTypes
  const prevTypesRef = useRef(commodityTypes)
  if (prevTypesRef.current !== commodityTypes) {
    prevTypesRef.current = commodityTypes
    if (optimisticTypes) setOptimisticTypes(null)
  }

  return (
    <section className="mb-8">
      <h2 className="mb-4 text-lg text-foreground">
        {t('productMgmt.types.title')}
      </h2>

      {/* Sortable type list */}
      <SortableList
        items={displayedTypes}
        getId={ct => ct.id}
        renderItem={(ct, dragHandleProps) => (
          <TypeRow
            type={ct}
            dragHandleProps={dragHandleProps}
            onEdit={handleEdit}
          />
        )}
        onReorder={handleReorder}
      />

      {/* Edit label modal */}
      <Modal
        open={!!editingType}
        title={t('productMgmt.types.editLabel')}
        variant="warm"
        shineColor="purple"
        onClose={handleEditClose}
        footer={
          <div className="flex justify-center gap-3">
            <RippleButton
              className="rounded-lg border border-border px-6 py-2 text-base text-muted-foreground hover:bg-accent"
              onClick={handleEditClose}
            >
              {t('common.cancel')}
            </RippleButton>
            <RippleButton
              className="rounded-lg bg-primary px-6 py-2 text-base text-primary-foreground hover:bg-primary/90"
              onClick={handleEditSave}
            >
              {t('common.confirm')}
            </RippleButton>
          </div>
        }
      >
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="commodity-type-label"
            className="text-base text-foreground"
          >
            {t('productMgmt.types.labelField')}
          </label>
          <Input
            id="commodity-type-label"
            value={editValue}
            onChange={e => setEditValue(e.target.value)}
            placeholder={t('productMgmt.types.labelField')}
            className="text-base"
          />
        </div>
      </Modal>
    </section>
  )
}
