/**
 * CommodityTypeSection -- Row list showing all commodity types
 * with drag-and-drop reorder and edit-via-modal capability.
 * Changes are accumulated locally and committed via "Save Settings" button.
 */

import { useState, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { GripVertical, Pencil, Save } from 'lucide-react'
import { Modal, ConfirmModal } from '@/components/modal'
import { RippleButton } from '@/components/ui/ripple-button'
import { Input } from '@/components/ui/input'
import { notify } from '@/components/ui/sonner'
import { ShineBorder } from '@/components/ui/shine-border'
import { cn } from '@/lib/cn'
import { getCommodityTypeRepo } from '@/lib/repositories'
import { useDbQuery } from '@/hooks/use-db-query'
import { SortableList } from './sortable-list'
import type { CommodityType } from '@/lib/schemas'
import type { DragHandleProps } from './sortable-list'

// ── Pending change types ─────────────────────────────────────────────────

interface LabelChange {
  readonly id: string
  readonly oldLabel: string
  readonly newLabel: string
}

interface OrderChange {
  readonly oldOrder: readonly string[]
  readonly newOrder: readonly string[]
  readonly labels: ReadonlyMap<string, string>
}

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
    <div className={cn(
      'relative flex items-center gap-3 rounded-lg border border-border bg-card p-3',
    )}>
      {dragHandleProps.isOverlay && (
        <ShineBorder shineColor={['#a8c896', '#c8deb8', '#e4fad9']} duration={4} borderWidth={2} />
      )}
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

interface CommodityTypeSectionProps {
  readonly refreshKey: number
  readonly onRefresh: () => void
}

export function CommodityTypeSection({ refreshKey, onRefresh }: CommodityTypeSectionProps) {
  const { t } = useTranslation()

  // DB source of truth
  const dbTypes = useDbQuery(
    () => getCommodityTypeRepo().findAll(),
    [refreshKey],
    [] as CommodityType[],
  )

  // Local working copy — starts as null (no changes), set on first edit/reorder
  const [localTypes, setLocalTypes] = useState<readonly CommodityType[] | null>(null)

  // Edit modal state
  const [editingType, setEditingType] = useState<CommodityType | null>(null)
  const [editValue, setEditValue] = useState('')

  // Save confirm modal state
  const [isSaveOpen, setIsSaveOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // The displayed types — local changes override DB
  const displayedTypes = localTypes ?? dbTypes

  // Reset local state when refreshKey changes (after save or external refresh)
  const [prevRefreshKey, setPrevRefreshKey] = useState(refreshKey)
  if (prevRefreshKey !== refreshKey) {
    setPrevRefreshKey(refreshKey)
    setLocalTypes(null)
  }

  // Compute pending changes for the confirm modal
  const pendingChanges = useMemo(() => {
    if (!localTypes) return null

    const labelChanges: LabelChange[] = []
    let orderChange: OrderChange | null = null

    // Check label changes
    for (const local of localTypes) {
      const original = dbTypes.find(db => db.id === local.id)
      if (original && original.label !== local.label) {
        labelChanges.push({
          id: local.id,
          oldLabel: original.label,
          newLabel: local.label,
        })
      }
    }

    // Check order changes
    const dbOrder = dbTypes.map(t => t.id)
    const localOrder = localTypes.map(t => t.id)
    const orderChanged = dbOrder.some((id, i) => id !== localOrder[i])
    if (orderChanged) {
      const labels = new Map(localTypes.map(t => [t.id, t.label]))
      orderChange = { oldOrder: dbOrder, newOrder: localOrder, labels }
    }

    if (labelChanges.length === 0 && !orderChange) return null
    return { labelChanges, orderChange }
  }, [localTypes, dbTypes])

  const hasChanges = pendingChanges !== null

  // ── Handlers ──────────────────────────────────────────────────────────

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

  // Apply label change locally (not to DB)
  const handleEditApply = useCallback(() => {
    if (!editingType) return
    const trimmed = editValue.trim()
    if (!trimmed || trimmed === editingType.label) {
      handleEditClose()
      return
    }

    const current = localTypes ?? dbTypes
    setLocalTypes(
      current.map(ct =>
        ct.id === editingType.id ? { ...ct, label: trimmed } : ct,
      ),
    )
    handleEditClose()
  }, [editingType, editValue, localTypes, dbTypes, handleEditClose])

  // Drag reorder — apply locally
  const handleReorder = useCallback(
    (orderedIds: readonly string[]) => {
      const current = localTypes ?? dbTypes
      const reordered = orderedIds
        .map((id, i) => {
          const item = current.find(ct => ct.id === id)
          return item ? { ...item, priority: i + 1 } : null
        })
        .filter((ct): ct is CommodityType => ct !== null)
      setLocalTypes(reordered)
    },
    [localTypes, dbTypes],
  )

  // Open save confirm modal
  const handleSaveClick = useCallback(() => {
    setIsSaveOpen(true)
  }, [])

  // Confirm save — write all changes to DB
  const handleSaveConfirm = useCallback(async () => {
    if (!localTypes || !pendingChanges) return
    setIsSaving(true)

    try {
      // Write label changes
      for (const change of pendingChanges.labelChanges) {
        await getCommodityTypeRepo().update(change.id, { label: change.newLabel })
      }

      // Write order changes
      if (pendingChanges.orderChange) {
        await getCommodityTypeRepo().updatePriorities([...pendingChanges.orderChange.newOrder])
      }

      setIsSaveOpen(false)
      notify.success(t('productMgmt.types.saveSuccess'))
      onRefresh()
    } catch {
      notify.error(t('productMgmt.types.saveError'))
    } finally {
      setIsSaving(false)
    }
  }, [localTypes, pendingChanges, t, onRefresh])

  const handleSaveCancel = useCallback(() => {
    setIsSaveOpen(false)
  }, [])

  return (
    <section className="mb-8">
      {/* Header with title and save button */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg text-foreground">
          {t('productMgmt.types.title')}
        </h2>
        <RippleButton
            disabled={!hasChanges}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-base text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleSaveClick}
          >
            <Save size={16} />
            {t('productMgmt.types.saveSettings')}
          </RippleButton>
      </div>

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
              onClick={handleEditApply}
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

      {/* Save confirm modal — shows pending changes */}
      <ConfirmModal
        open={isSaveOpen}
        title={t('productMgmt.types.saveConfirmTitle')}
        variant="green"
        shineColor="green"
        confirmText={t('common.confirm')}
        loading={isSaving}
        onConfirm={handleSaveConfirm}
        onCancel={handleSaveCancel}
      >
        <div className="space-y-3 text-base text-foreground">
          {pendingChanges?.labelChanges.map(change => (
            <div key={change.id} className="flex items-center gap-2">
              <span className="text-muted-foreground">{change.oldLabel}</span>
              <span className="text-muted-foreground">→</span>
              <span>{change.newLabel}</span>
            </div>
          ))}
          {pendingChanges?.orderChange && (
            <div>
              <span className="text-muted-foreground">
                {t('productMgmt.types.orderChanged')}
              </span>
              <div className="mt-1 flex items-center gap-2">
                {pendingChanges.orderChange.newOrder.map((id, i) => (
                  <span key={id}>
                    {i > 0 && <span className="mr-2 text-muted-foreground">→</span>}
                    {pendingChanges!.orderChange!.labels.get(id)}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </ConfirmModal>
    </section>
  )
}
