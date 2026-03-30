/**
 * OrderTypeSection -- Section with sortable list of order types.
 * Supports add/edit/delete with modals, drag reorder, and a max of 10 types.
 */

import { useState, useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'
import { ConfirmModal } from '@/components/modal'
import { RippleButton } from '@/components/ui/ripple-button'
import { SwipeToDelete } from '@/components/ui/swipe-to-delete'
import { notify } from '@/components/ui/sonner'
import { getOrderTypeRepo } from '@/lib/repositories'
import { useDbQuery } from '@/hooks/use-db-query'
import { SortableList } from './sortable-list'
import { OrderTypeCard } from './order-type-card'
import { OrderTypeForm } from './order-type-form'
import type { OrderType } from '@/lib/schemas'
import type { OrderTypeFormValues } from '@/lib/form-schemas'

// ── Constants ─────────────────────────────────────────────────────────────

const MAX_ORDER_TYPES = 10

export function OrderTypeSection() {
  const { t } = useTranslation()
  const [refreshKey, setRefreshKey] = useState(0)

  // Optimistic reorder state
  const [optimisticOrderTypes, setOptimisticOrderTypes] = useState<
    readonly OrderType[] | null
  >(null)

  // Modal state
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingOrderType, setEditingOrderType] = useState<OrderType | null>(
    null,
  )
  const [deleteTarget, setDeleteTarget] = useState<OrderType | null>(null)

  // Load order types from DB
  const orderTypes = useDbQuery(
    () => getOrderTypeRepo().findAll(),
    [refreshKey],
    [] as OrderType[],
  )

  const isMaxReached = orderTypes.length >= MAX_ORDER_TYPES

  // Refresh data
  const refresh = useCallback(() => {
    setRefreshKey(k => k + 1)
  }, [])

  // Add order type
  const handleAdd = useCallback(() => {
    setEditingOrderType(null)
    setIsFormOpen(true)
  }, [])

  // Edit order type
  const handleEdit = useCallback((orderType: OrderType) => {
    setEditingOrderType(orderType)
    setIsFormOpen(true)
  }, [])

  // Close form modal
  const handleFormClose = useCallback(() => {
    setIsFormOpen(false)
    setEditingOrderType(null)
  }, [])

  // Form submit (add or edit)
  const handleFormSubmit = useCallback(
    async (values: OrderTypeFormValues) => {
      try {
        if (editingOrderType) {
          // Edit mode
          await getOrderTypeRepo().update(editingOrderType.id, {
            name: values.name,
            color: values.color,
          })
          notify.success(t('productMgmt.orderTypes.toastUpdated'))
        } else {
          // Add mode
          const maxPriority = orderTypes.reduce(
            (max, ot) => Math.max(max, ot.priority),
            0,
          )

          await getOrderTypeRepo().create({
            name: values.name,
            priority: maxPriority + 1,
            type: 'order',
            color: values.color,
          })
          notify.success(t('productMgmt.orderTypes.toastAdded'))
        }

        refresh()
        handleFormClose()
      } catch {
        notify.error(t('productMgmt.orderTypes.saveError'))
      }
    },
    [editingOrderType, orderTypes, refresh, handleFormClose, t],
  )

  // Delete order type
  const handleDeleteClick = useCallback((orderType: OrderType) => {
    setDeleteTarget(orderType)
  }, [])

  // Confirm deletion
  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return

    try {
      await getOrderTypeRepo().remove(deleteTarget.id)
      notify.success(t('productMgmt.orderTypes.toastDeleted'))
      refresh()
    } catch {
      notify.error(t('productMgmt.orderTypes.deleteError'))
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
      const displayItems = optimisticOrderTypes ?? orderTypes
      const reordered = orderedIds
        .map((id, i) => {
          const item = displayItems.find(ot => ot.id === id)
          return item ? { ...item, priority: i + 1 } : null
        })
        .filter((ot): ot is OrderType => ot !== null)
      setOptimisticOrderTypes(reordered)

      try {
        await getOrderTypeRepo().updatePriorities([...orderedIds])
        refresh()
      } catch {
        notify.error(t('productMgmt.orderTypes.reorderError'))
        setOptimisticOrderTypes(null)
      }
    },
    [orderTypes, optimisticOrderTypes, refresh, t],
  )

  // Clear optimistic state when DB data refreshes
  const displayedOrderTypes = optimisticOrderTypes ?? orderTypes
  const prevOrderTypesRef = useRef(orderTypes)
  if (prevOrderTypesRef.current !== orderTypes) {
    prevOrderTypesRef.current = orderTypes
    if (optimisticOrderTypes) setOptimisticOrderTypes(null)
  }

  return (
    <section className="mb-8">
      {/* Header with title and add button */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg text-foreground">
          {t('productMgmt.orderTypes.title')}
        </h2>
        <RippleButton
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-base text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          onClick={handleAdd}
          disabled={isMaxReached}
          title={
            isMaxReached ? t('productMgmt.orderTypes.maxReached') : undefined
          }
        >
          <Plus size={16} />
          {t('productMgmt.orderTypes.addType')}
        </RippleButton>
      </div>

      {/* Sortable order type list */}
      <SortableList
        items={displayedOrderTypes}
        getId={ot => ot.id}
        renderItem={(orderType, dragHandleProps) => (
          <SwipeToDelete onDelete={() => handleDeleteClick(orderType)}>
            <OrderTypeCard
              orderType={orderType}
              dragHandleProps={dragHandleProps}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
            />
          </SwipeToDelete>
        )}
        onReorder={handleReorder}
      />

      {/* Add/Edit form modal */}
      <OrderTypeForm
        open={isFormOpen}
        orderType={editingOrderType}
        onSubmit={handleFormSubmit}
        onClose={handleFormClose}
      />

      {/* Delete confirmation modal */}
      <ConfirmModal
        open={!!deleteTarget}
        title={t('productMgmt.orderTypes.deleteConfirmTitle')}
        variant="red"
        shineColor="red"
        confirmText={t('common.confirm')}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      >
        {deleteTarget && (
          <p className="text-center text-base text-foreground">
            {t('productMgmt.orderTypes.deleteConfirmMessage', {
              name: deleteTarget.name,
            })}
          </p>
        )}
      </ConfirmModal>
    </section>
  )
}
