/**
 * Tests for OrderTypeSection component.
 * Verifies section rendering, add/edit/delete flows, reorder, max limit.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, within, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { OrderTypeSection } from './order-type-section'
import {
  getOrderTypeRepo,
  resetMockRepositories,
} from '@/test/mock-repositories'

// Mock the repository provider to use in-memory mock repositories
vi.mock('@/lib/repositories', () => ({
  getOrderTypeRepo: () => getOrderTypeRepo(),
}))

// Mock the modal component to avoid Radix Portal issues in tests
vi.mock('@/components/modal', () => ({
  Modal: ({
    open,
    title,
    children,
    footer,
    onClose,
  }: {
    open: boolean
    title: string
    children: React.ReactNode
    footer?: React.ReactNode
    onClose: () => void
  }) =>
    open ? (
      <div data-testid="modal" role="dialog" aria-label={title}>
        <h2>{title}</h2>
        {children}
        {footer}
        <button onClick={onClose}>close-modal</button>
      </div>
    ) : null,
  ConfirmModal: ({
    open,
    title,
    children,
    onConfirm,
    onCancel,
  }: {
    open: boolean
    title: string
    children?: React.ReactNode
    onConfirm: () => void
    onCancel: () => void
  }) =>
    open ? (
      <div data-testid="confirm-modal" role="dialog" aria-label={title}>
        <h2>{title}</h2>
        {children}
        <button onClick={onConfirm}>確認</button>
        <button onClick={onCancel}>取消</button>
      </div>
    ) : null,
}))

// Mock sonner notify
const mockNotifySuccess = vi.fn()
const mockNotifyError = vi.fn()
vi.mock('@/components/ui/sonner', () => ({
  notify: {
    success: (...args: unknown[]) => mockNotifySuccess(...args),
    error: (...args: unknown[]) => mockNotifyError(...args),
  },
}))

// Mock SortableList to avoid dnd-kit complexity in unit tests
vi.mock('./sortable-list', () => ({
  SortableList: ({
    items,
    renderItem,
    getId,
  }: {
    items: readonly unknown[]
    renderItem: (item: unknown, dragProps: unknown) => React.ReactNode
    getId: (item: unknown) => string
    onReorder: (ids: readonly string[]) => void
  }) => (
    <div data-testid="sortable-list">
      {items.map(item => (
        <div key={getId(item)} data-testid={`sortable-item-${getId(item)}`}>
          {renderItem(item, {
            attributes: {
              role: 'button',
              tabIndex: 0,
              'aria-disabled': false,
              'aria-pressed': undefined,
              'aria-roledescription': 'sortable',
              'aria-describedby': 'test-desc',
            },
            listeners: undefined,
          })}
        </div>
      ))}
    </div>
  ),
}))

describe('OrderTypeSection', () => {
  beforeEach(() => {
    resetMockRepositories()
    mockNotifySuccess.mockClear()
    mockNotifyError.mockClear()
  })

  afterEach(() => {
    resetMockRepositories()
  })

  describe('rendering', () => {
    it('should render the section title', async () => {
      render(<OrderTypeSection refreshKey={0} onRefresh={vi.fn()} />)
      // i18n: productMgmt.orderTypes.title -> '訂單分類'
      await screen.findByText('訂單分類')
    })

    it('should render the add button', async () => {
      render(<OrderTypeSection refreshKey={0} onRefresh={vi.fn()} />)
      // i18n: productMgmt.orderTypes.addType -> '新增分類'
      await screen.findByText('新增分類')
    })

    it('should render all default order types', async () => {
      render(<OrderTypeSection refreshKey={0} onRefresh={vi.fn()} />)
      // Default order types: 攤位, 外送, 電話自取
      await screen.findByText('攤位')
      expect(screen.getByText('外送')).toBeTruthy()
      expect(screen.getByText('電話自取')).toBeTruthy()
    })

    it('should render default badges on default order types', async () => {
      render(<OrderTypeSection refreshKey={0} onRefresh={vi.fn()} />)
      await screen.findByText('攤位')

      // All default order types should have default badges
      const badges = screen.getAllByTestId('default-badge')
      expect(badges.length).toBe(3)
    })
  })

  describe('swipe to delete', () => {
    it('should wrap each order type card with SwipeToDelete', async () => {
      render(<OrderTypeSection refreshKey={0} onRefresh={vi.fn()} />)
      await screen.findByText('攤位')

      const swipeWrappers = screen.getAllByTestId('swipe-to-delete')
      expect(swipeWrappers.length).toBeGreaterThan(0)
    })
  })

  describe('add order type', () => {
    it('should open add form modal when add button is clicked', async () => {
      const user = userEvent.setup()
      render(<OrderTypeSection refreshKey={0} onRefresh={vi.fn()} />)

      await screen.findByText('新增分類')
      await user.click(screen.getByText('新增分類'))

      // Should open the form modal in add mode
      expect(screen.getByRole('dialog', { name: '新增分類' })).toBeTruthy()
    })
  })

  describe('delete order type', () => {
    it('should open confirm modal when delete button on custom type is clicked', async () => {
      // First add a custom order type so delete button is visible
      await getOrderTypeRepo().create({
        name: '自訂分類',
        priority: 4,
        type: 'order',
        color: 'red',
      })

      const user = userEvent.setup()
      render(<OrderTypeSection refreshKey={0} onRefresh={vi.fn()} />)

      // Wait for the custom type to appear
      await screen.findByText('自訂分類')

      // Click delete on the custom type
      const deleteButtons = screen.getAllByTestId('delete-button')
      await user.click(deleteButtons[0]!)

      // Confirm modal should appear
      expect(screen.getByTestId('confirm-modal')).toBeTruthy()
    })

    it('should delete order type after confirm', async () => {
      await getOrderTypeRepo().create({
        name: '自訂分類',
        priority: 4,
        type: 'order',
        color: 'red',
      })

      const user = userEvent.setup()
      render(<OrderTypeSection refreshKey={0} onRefresh={vi.fn()} />)

      await screen.findByText('自訂分類')

      const deleteButtons = screen.getAllByTestId('delete-button')
      await user.click(deleteButtons[0]!)

      // Confirm deletion
      const confirmModal = screen.getByTestId('confirm-modal')
      await user.click(within(confirmModal).getByText('確認'))

      await waitFor(() => {
        expect(mockNotifySuccess).toHaveBeenCalledWith('分類已刪除')
      })
    })

    it('should cancel deletion and keep order type', async () => {
      await getOrderTypeRepo().create({
        name: '自訂分類',
        priority: 4,
        type: 'order',
        color: 'red',
      })

      const user = userEvent.setup()
      render(<OrderTypeSection refreshKey={0} onRefresh={vi.fn()} />)

      await screen.findByText('自訂分類')

      const deleteButtons = screen.getAllByTestId('delete-button')
      await user.click(deleteButtons[0]!)

      // Cancel
      const confirmModal = screen.getByTestId('confirm-modal')
      await user.click(within(confirmModal).getByText('取消'))

      // Confirm modal should close
      expect(screen.queryByTestId('confirm-modal')).toBeNull()

      // Order type should still be visible
      expect(screen.getByText('自訂分類')).toBeTruthy()
    })

    it('should not show delete button on default order types', async () => {
      render(<OrderTypeSection refreshKey={0} onRefresh={vi.fn()} />)
      await screen.findByText('攤位')

      // Default order types should not have delete buttons
      expect(screen.queryByTestId('delete-button')).toBeNull()
    })
  })

  describe('max limit', () => {
    it('should disable add button when 10 order types exist', async () => {
      // Add 7 more to reach 10 total (3 defaults + 7 custom)
      for (let i = 0; i < 7; i++) {
        await getOrderTypeRepo().create({
          name: `自訂${i + 1}`,
          priority: 4 + i,
          type: 'order',
          color: '',
        })
      }

      render(<OrderTypeSection refreshKey={0} onRefresh={vi.fn()} />)
      await screen.findByText('自訂7')

      const addButton = screen.getByText('新增分類').closest('button')
      expect(addButton?.disabled).toBe(true)
    })
  })
})
