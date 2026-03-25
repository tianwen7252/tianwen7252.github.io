/**
 * Orders history page.
 * Shows date header, shift summary, and a grid of order history cards.
 * Supports date navigation, order deletion, and full-text search.
 */

import { useState } from 'react'
import dayjs from 'dayjs'
import type { Dayjs } from 'dayjs'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { PackageOpen } from 'lucide-react'
import { getOrderRepo } from '@/lib/repositories/provider'
import { notify } from '@/components/ui/sonner'
import {
  OrdersDateHeader,
  OrdersShiftSummary,
  OrderHistoryCard,
  DeleteOrderModal,
  OrdersSearch,
} from '@/components/orders'
import type { Order } from '@/lib/schemas'

// ─── Types ───────────────────────────────────────────────────────────────────

interface DeleteTarget {
  readonly id: string
  readonly number: number
}

// ─── Component ───────────────────────────────────────────────────────────────

/** Main orders history page with date filtering, shift summary, order grid, and search */
export function OrdersPage() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs())
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null)
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  // Fetch orders for the selected date
  const dayStart = selectedDate.startOf('day').valueOf()
  const dayEnd = selectedDate.endOf('day').valueOf()

  const { data: orders = [], isLoading, isError } = useQuery({
    queryKey: ['orders', selectedDate.format('YYYY-MM-DD')],
    queryFn: () => getOrderRepo().findByDateRange(dayStart, dayEnd),
    staleTime: 0,
  })

  // Fetch all orders — only when search is open, refresh at most once per minute
  const { data: allOrders = [], isLoading: isAllLoading } = useQuery({
    queryKey: ['orders', 'all'],
    queryFn: () => getOrderRepo().findAll(),
    enabled: isSearchOpen,
    staleTime: 60_000,
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => getOrderRepo().remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      notify.success(t('orders.toastDeleted'))
      setDeleteTarget(null)
    },
    onError: () => {
      notify.error(t('orders.toastDeleteError'))
      setDeleteTarget(null)
    },
  })

  /** Handle date change from the date header calendar */
  function handleDateChange(date: Dayjs) {
    setSelectedDate(date)
  }

  /** Open the delete confirmation modal for a given order */
  function handleDeleteRequest(order: Order) {
    setDeleteTarget({ id: order.id, number: order.number })
  }

  /** Confirm deletion of the targeted order */
  function handleDeleteConfirm() {
    if (deleteTarget) {
      deleteMutation.mutate(deleteTarget.id)
    }
  }

  /** Cancel deletion and close the modal */
  function handleDeleteCancel() {
    setDeleteTarget(null)
  }

  return (
    <div className="h-[calc(100vh-57px)] overflow-y-auto p-4">
      {/* Search view — replaces normal content when open */}
      {isSearchOpen ? (
        <OrdersSearch
          orders={allOrders}
          isLoading={isAllLoading}
          onClose={() => setIsSearchOpen(false)}
          onDelete={handleDeleteRequest}
        />
      ) : (
        <>
          {/* Date header */}
          <OrdersDateHeader
            selectedDate={selectedDate}
            onDateChange={handleDateChange}
            onSearchOpen={() => setIsSearchOpen(true)}
          />

          {/* Loading state */}
          {isLoading && (
            <div className="flex items-center justify-center py-20 text-muted-foreground">
              {t('orders.loading')}
            </div>
          )}

          {/* Error state */}
          {isError && (
            <div className="flex items-center justify-center py-20 text-destructive">
              {t('orders.loadError')}
            </div>
          )}

          {/* Content: summary + grid */}
          {!isLoading && !isError && (
            <>
              {/* Shift summary */}
              <div className="mt-4">
                <OrdersShiftSummary orders={orders} />
              </div>

              {/* Empty state */}
              {orders.length === 0 && (
                <div className="flex flex-col items-center justify-center gap-3 py-20 text-muted-foreground">
                  <PackageOpen className="size-12 opacity-40" />
                  <span className="text-base">{t('orders.noOrders')}</span>
                </div>
              )}

              {/* Order cards grid — 3 per row */}
              {orders.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {orders.map((order) => (
                    <OrderHistoryCard
                      key={order.id}
                      order={order}
                      onDelete={() => handleDeleteRequest(order)}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Delete confirmation modal — always rendered */}
      <DeleteOrderModal
        open={deleteTarget !== null}
        orderNumber={deleteTarget?.number ?? 0}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        loading={deleteMutation.isPending}
      />
    </div>
  )
}
