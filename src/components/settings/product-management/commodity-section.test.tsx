/**
 * Tests for CommoditySection component.
 * Verifies tab rendering, tab switching, product list, add/edit/delete flows.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, within, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CommoditySection } from './commodity-section'
import {
  getCommodityTypeRepo,
  getCommodityRepo,
  resetMockRepositories,
} from '@/test/mock-repositories'

// Mock the repository provider to use in-memory mock repositories
vi.mock('@/lib/repositories', () => ({
  getCommodityTypeRepo: () => getCommodityTypeRepo(),
  getCommodityRepo: () => getCommodityRepo(),
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
vi.mock('@/components/ui/sonner', () => ({
  notify: {
    success: (...args: unknown[]) => mockNotifySuccess(...args),
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

describe('CommoditySection', () => {
  beforeEach(() => {
    resetMockRepositories()
    mockNotifySuccess.mockClear()
  })

  afterEach(() => {
    resetMockRepositories()
  })

  describe('rendering', () => {
    it('should render the section title', async () => {
      render(<CommoditySection />)
      await screen.findByText('商品設定')
    })

    it('should render category tabs', async () => {
      render(<CommoditySection />)
      await screen.findByText('餐盒')
      expect(screen.getByText('單點')).toBeTruthy()
      expect(screen.getByText('飲料')).toBeTruthy()
      expect(screen.getByText('水餃')).toBeTruthy()
    })

    it('should render add product button', async () => {
      render(<CommoditySection />)
      await screen.findByText('新增商品')
    })

    it('should show item count badges on tabs', async () => {
      render(<CommoditySection />)
      // Wait for data to load
      await screen.findByText('餐盒')

      // Item count badges should appear on tabs
      const tabs = screen.getAllByTestId(/^category-tab-/)
      expect(tabs.length).toBe(4)
    })
  })

  describe('tab switching', () => {
    it('should show bento products by default (first tab selected)', async () => {
      render(<CommoditySection />)
      // The first commodity type (bento) should be selected by default
      // Wait for items to load and show some bento names
      await screen.findByText('油淋雞腿飯')
    })

    it('should switch to a different tab when clicked', async () => {
      const user = userEvent.setup()
      render(<CommoditySection />)

      // Wait for initial render
      await screen.findByText('油淋雞腿飯')

      // Click on drink tab
      const drinkTab = screen.getByTestId('category-tab-drink')
      await user.click(drinkTab)

      // Should show drink commodities instead of bento
      await waitFor(() => {
        expect(screen.queryByText('油淋雞腿飯')).toBeNull()
      })
    })
  })

  describe('add product', () => {
    it('should open add product modal when add button is clicked', async () => {
      const user = userEvent.setup()
      render(<CommoditySection />)

      await screen.findByText('新增商品')
      await user.click(screen.getByText('新增商品'))

      // Should open the form modal in add mode
      expect(screen.getByRole('dialog', { name: '新增商品' })).toBeTruthy()
    })
  })

  describe('swipe to delete', () => {
    it('should wrap each commodity card with SwipeToDelete', async () => {
      render(<CommoditySection />)
      await screen.findByText('油淋雞腿飯')

      // Each card should be wrapped in SwipeToDelete
      const swipeWrappers = screen.getAllByTestId('swipe-to-delete')
      expect(swipeWrappers.length).toBeGreaterThan(0)
    })
  })

  describe('delete product', () => {
    it('should open confirm modal when delete button is clicked', async () => {
      const user = userEvent.setup()
      render(<CommoditySection />)

      // Wait for products to load
      await screen.findByText('油淋雞腿飯')

      // Click delete on the first product
      const deleteButtons = screen.getAllByTestId('delete-button')
      await user.click(deleteButtons[0]!)

      // Confirm modal should appear
      expect(screen.getByTestId('confirm-modal')).toBeTruthy()
    })

    it('should soft delete product after confirm', async () => {
      const user = userEvent.setup()
      render(<CommoditySection />)

      await screen.findByText('油淋雞腿飯')

      // Click delete on first product
      const deleteButtons = screen.getAllByTestId('delete-button')
      await user.click(deleteButtons[0]!)

      // Confirm deletion
      const confirmModal = screen.getByTestId('confirm-modal')
      await user.click(within(confirmModal).getByText('確認'))

      // Should show success toast
      await waitFor(() => {
        expect(mockNotifySuccess).toHaveBeenCalledWith('商品已刪除')
      })
    })

    it('should cancel deletion and keep product', async () => {
      const user = userEvent.setup()
      render(<CommoditySection />)

      await screen.findByText('油淋雞腿飯')

      // Click delete
      const deleteButtons = screen.getAllByTestId('delete-button')
      await user.click(deleteButtons[0]!)

      // Cancel
      const confirmModal = screen.getByTestId('confirm-modal')
      await user.click(within(confirmModal).getByText('取消'))

      // Confirm modal should close
      expect(screen.queryByTestId('confirm-modal')).toBeNull()

      // Product should still be visible
      expect(screen.getByText('油淋雞腿飯')).toBeTruthy()
    })
  })
})
