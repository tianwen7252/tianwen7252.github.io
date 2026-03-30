/**
 * CommoditySection — Tabbed product management with drag-and-drop reordering.
 * Shows category tabs (one per commodity type) and a sortable list of products.
 */

import { useState, useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'
import { ConfirmModal } from '@/components/modal'
import { RippleButton } from '@/components/ui/ripple-button'
import { SwipeToDelete } from '@/components/ui/swipe-to-delete'
import { notify } from '@/components/ui/sonner'
import { getCommodityTypeRepo, getCommodityRepo } from '@/lib/repositories'
import { useDbQuery } from '@/hooks/use-db-query'
import { SortableList } from './sortable-list'
import { CommodityCard } from './commodity-card'
import { CommodityForm } from './commodity-form'
import type { CommodityType, Commodity } from '@/lib/schemas'
import type { CommodityFormValues } from '@/lib/form-schemas'

// ── Color mapping for tab pill styling using theme variables ──────────────

// Match the order page category-accent colors (keyed by typeId)
const TAB_COLOR_MAP: Record<string, string> = {
  bento: '#7f956a',
  single: '#d4a76a',
  drink: '#6aa3d4',
  dumpling: '#c47fd4',
}

function resolveTabColor(typeId: string): string {
  return TAB_COLOR_MAP[typeId] ?? '#7f956a'
}

export function CommoditySection() {
  const { t } = useTranslation()
  const [refreshKey, setRefreshKey] = useState(0)
  const [activeTypeId, setActiveTypeId] = useState<string | null>(null)

  // Optimistic reorder state — shows new order immediately while DB updates
  const [optimisticCommodities, setOptimisticCommodities] = useState<
    readonly Commodity[] | null
  >(null)

  // Modal state
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingCommodity, setEditingCommodity] = useState<Commodity | null>(
    null,
  )
  const [deleteTarget, setDeleteTarget] = useState<Commodity | null>(null)

  // Load commodity types
  const commodityTypes = useDbQuery(
    () => getCommodityTypeRepo().findAll(),
    [refreshKey],
    [] as CommodityType[],
  )

  // Determine the selected type (first type as default)
  const selectedTypeId = activeTypeId ?? commodityTypes[0]?.typeId ?? null

  // Load commodities for the selected type
  const commodities = useDbQuery(
    () =>
      selectedTypeId
        ? getCommodityRepo().findByTypeId(selectedTypeId)
        : Promise.resolve([]),
    [selectedTypeId, refreshKey],
    [] as Commodity[],
  )

  // Load all commodities for tab count badges
  const allCommodities = useDbQuery(
    () => getCommodityRepo().findOnMarket(),
    [refreshKey],
    [] as Commodity[],
  )

  // Refresh data
  const refresh = useCallback(() => {
    setRefreshKey(k => k + 1)
  }, [])

  // Count commodities per type for tab badges
  const countByType = useCallback(
    (typeId: string) => allCommodities.filter(c => c.typeId === typeId).length,
    [allCommodities],
  )

  // Tab click
  const handleTabClick = useCallback((typeId: string) => {
    setActiveTypeId(typeId)
  }, [])

  // Add product
  const handleAdd = useCallback(() => {
    setEditingCommodity(null)
    setIsFormOpen(true)
  }, [])

  // Edit product
  const handleEdit = useCallback((commodity: Commodity) => {
    setEditingCommodity(commodity)
    setIsFormOpen(true)
  }, [])

  // Close form modal
  const handleFormClose = useCallback(() => {
    setIsFormOpen(false)
    setEditingCommodity(null)
  }, [])

  // Form submit (add or edit)
  const handleFormSubmit = useCallback(
    async (values: CommodityFormValues) => {
      try {
        if (editingCommodity) {
          // Edit mode
          await getCommodityRepo().update(editingCommodity.id, {
            name: values.name,
            price: values.price,
            includesSoup: values.includesSoup ?? false,
          })
          notify.success(t('productMgmt.commodities.toastUpdated'))
        } else {
          // Add mode — use the selected type
          if (!selectedTypeId) return

          // Get the next priority value
          const existing = await getCommodityRepo().findByTypeId(selectedTypeId)
          const maxPriority = existing.reduce(
            (max, c) => Math.max(max, c.priority),
            0,
          )

          await getCommodityRepo().create({
            typeId: selectedTypeId,
            name: values.name,
            price: values.price,
            priority: maxPriority + 1,
            onMarket: true,
            includesSoup: values.includesSoup ?? false,
          })
          notify.success(t('productMgmt.commodities.toastAdded'))
        }

        refresh()
        handleFormClose()
      } catch {
        notify.error(t('productMgmt.commodities.saveError'))
      }
    },
    [editingCommodity, selectedTypeId, refresh, handleFormClose, t],
  )

  // Delete product
  const handleDeleteClick = useCallback((commodity: Commodity) => {
    setDeleteTarget(commodity)
  }, [])

  // Confirm deletion (soft delete: set onMarket to false)
  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return

    try {
      await getCommodityRepo().update(deleteTarget.id, { onMarket: false })
      notify.success(t('productMgmt.commodities.toastDeleted'))
      refresh()
    } catch {
      notify.error(t('productMgmt.commodities.deleteError'))
    } finally {
      setDeleteTarget(null)
    }
  }, [deleteTarget, refresh, t])

  // Cancel deletion
  const handleDeleteCancel = useCallback(() => {
    setDeleteTarget(null)
  }, [])

  // Drag reorder with optimistic UI
  const handleReorder = useCallback(
    async (orderedIds: readonly string[]) => {
      // Optimistic update — reorder items locally before DB write
      const displayItems = optimisticCommodities ?? commodities
      const reordered = orderedIds
        .map((id, i) => {
          const item = displayItems.find(c => c.id === id)
          return item ? { ...item, priority: i + 1 } : null
        })
        .filter((c): c is Commodity => c !== null)
      setOptimisticCommodities(reordered)

      try {
        await getCommodityRepo().updatePriorities([...orderedIds])
        refresh()
      } catch {
        notify.error(t('productMgmt.commodities.reorderError'))
        setOptimisticCommodities(null)
      }
    },
    [commodities, optimisticCommodities, refresh, t],
  )

  // Clear optimistic state when DB data refreshes
  const displayedCommodities = optimisticCommodities ?? commodities
  // Reset optimistic state when commodities change from DB
  const prevCommoditiesRef = useRef(commodities)
  if (prevCommoditiesRef.current !== commodities) {
    prevCommoditiesRef.current = commodities
    if (optimisticCommodities) setOptimisticCommodities(null)
  }

  return (
    <section>
      {/* Header with title and add button */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg text-foreground">
          {t('productMgmt.commodities.title')}
        </h2>
        <RippleButton
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-base text-primary-foreground hover:bg-primary/90"
          onClick={handleAdd}
        >
          <Plus size={16} />
          {t('productMgmt.commodities.addProduct')}
        </RippleButton>
      </div>

      {/* Category tabs */}
      <div className="mb-4 flex flex-wrap gap-2">
        {commodityTypes.map(ct => {
          const isActive = ct.typeId === selectedTypeId
          const themeColor = resolveTabColor(ct.typeId)
          return (
            <RippleButton
              key={ct.typeId}
              data-testid={`category-tab-${ct.typeId}`}
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-base transition-colors"
              style={
                isActive
                  ? { backgroundColor: themeColor, color: '#fff' }
                  : {
                      backgroundColor: `color-mix(in srgb, ${themeColor} 15%, transparent)`,
                      color: themeColor,
                    }
              }
              onClick={() => handleTabClick(ct.typeId)}
            >
              {ct.label}
              <span
                className="inline-flex size-6 items-center justify-center rounded-full text-base"
                style={{
                  backgroundColor: isActive
                    ? 'rgba(255,255,255,0.2)'
                    : 'rgba(0,0,0,0.05)',
                }}
              >
                {countByType(ct.typeId)}
              </span>
            </RippleButton>
          )
        })}
      </div>

      {/* Sortable commodity list */}
      <SortableList
        items={displayedCommodities}
        getId={c => c.id}
        renderItem={(commodity, dragHandleProps) => {
          const card = (
            <CommodityCard
              commodity={commodity}
              dragHandleProps={dragHandleProps}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
            />
          )
          // Skip SwipeToDelete in DragOverlay (overflow-hidden clips the ring)
          return dragHandleProps.isOverlay ? card : (
            <SwipeToDelete onDelete={() => handleDeleteClick(commodity)}>
              {card}
            </SwipeToDelete>
          )
        }}
        onReorder={handleReorder}
      />

      {/* Add/Edit form modal */}
      <CommodityForm
        open={isFormOpen}
        commodity={editingCommodity}
        onSubmit={handleFormSubmit}
        onClose={handleFormClose}
      />

      {/* Delete confirmation modal */}
      <ConfirmModal
        open={!!deleteTarget}
        title={t('productMgmt.commodities.deleteConfirmTitle')}
        variant="red"
        shineColor="red"
        confirmText={t('common.confirm')}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      >
        {deleteTarget && (
          <p className="text-center text-base text-foreground">
            {t('productMgmt.commodities.deleteConfirmMessage', {
              name: deleteTarget.name,
            })}
          </p>
        )}
      </ConfirmModal>
    </section>
  )
}
