/**
 * Tests for CommodityTypeSection component.
 * Verifies rendering as row list with drag handle, edit via modal,
 * and reorder operations via the repository.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CommodityTypeSection } from './commodity-type-section'
import {
  getCommodityTypeRepo,
  resetMockRepositories,
} from '@/test/mock-repositories'

// Mock the repository provider to use in-memory mock repositories
vi.mock('@/lib/repositories', () => ({
  getCommodityTypeRepo: () => getCommodityTypeRepo(),
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

// Mock the modal components to avoid Radix Portal issues in tests
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
        <button onClick={onConfirm}>confirm-save</button>
        <button onClick={onCancel}>cancel-save</button>
      </div>
    ) : null,
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

describe('CommodityTypeSection', () => {
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
      render(<CommodityTypeSection refreshKey={0} onRefresh={vi.fn()} />)
      await screen.findByText('商品種類')
    })

    it('should render all 4 commodity types as rows in a sortable list', async () => {
      render(<CommodityTypeSection refreshKey={0} onRefresh={vi.fn()} />)
      await screen.findByText('餐盒')
      expect(screen.getByText('單點')).toBeTruthy()
      expect(screen.getByText('飲料')).toBeTruthy()
      expect(screen.getByText('水餃')).toBeTruthy()
      expect(screen.getByTestId('sortable-list')).toBeTruthy()
    })

    it('should render priority badges for each type', async () => {
      render(<CommodityTypeSection refreshKey={0} onRefresh={vi.fn()} />)
      await screen.findByText('餐盒')

      // Priority badges show numbers 1-4
      expect(screen.getByText('1')).toBeTruthy()
      expect(screen.getByText('2')).toBeTruthy()
      expect(screen.getByText('3')).toBeTruthy()
      expect(screen.getByText('4')).toBeTruthy()
    })

    it('should render drag handles for each type', async () => {
      render(<CommodityTypeSection refreshKey={0} onRefresh={vi.fn()} />)
      await screen.findByText('餐盒')

      const handles = screen.getAllByTestId('drag-handle')
      expect(handles.length).toBe(4)
    })

    it('should render edit buttons for each type', async () => {
      render(<CommodityTypeSection refreshKey={0} onRefresh={vi.fn()} />)
      await screen.findByText('餐盒')

      const editButtons = screen.getAllByTestId('edit-button')
      expect(editButtons.length).toBe(4)
    })

    it('should NOT render typeId badges (removed from UI)', async () => {
      render(<CommodityTypeSection refreshKey={0} onRefresh={vi.fn()} />)
      await screen.findByText('餐盒')

      // typeId values should not appear in the rendered output
      expect(screen.queryByText('bento')).toBeNull()
      expect(screen.queryByText('single')).toBeNull()
      expect(screen.queryByText('drink')).toBeNull()
      expect(screen.queryByText('dumpling')).toBeNull()
    })
  })

  describe('edit via modal', () => {
    it('should open edit modal when edit button is clicked', async () => {
      const user = userEvent.setup()
      render(<CommodityTypeSection refreshKey={0} onRefresh={vi.fn()} />)

      await screen.findByText('餐盒')

      const editButtons = screen.getAllByTestId('edit-button')
      await user.click(editButtons[0]!)

      // Modal should be open with edit title
      expect(screen.getByRole('dialog', { name: '編輯種類名稱' })).toBeTruthy()
    })

    it('should pre-fill the input with the current label', async () => {
      const user = userEvent.setup()
      render(<CommodityTypeSection refreshKey={0} onRefresh={vi.fn()} />)

      await screen.findByText('餐盒')

      const editButtons = screen.getAllByTestId('edit-button')
      await user.click(editButtons[0]!)

      expect(screen.getByDisplayValue('餐盒')).toBeTruthy()
    })

    it('should apply label change locally when confirm is clicked', async () => {
      const user = userEvent.setup()
      render(<CommodityTypeSection refreshKey={0} onRefresh={vi.fn()} />)

      await screen.findByText('餐盒')

      const editButtons = screen.getAllByTestId('edit-button')
      await user.click(editButtons[0]!)

      const input = screen.getByDisplayValue('餐盒')
      await user.clear(input)
      await user.type(input, '主食')

      await user.click(screen.getByRole('button', { name: '確認' }))

      // Label should update locally (not in DB yet)
      await waitFor(() => {
        expect(screen.getByText('主食')).toBeTruthy()
      })
      // DB should NOT be updated yet
      const dbValue = await getCommodityTypeRepo().findById('ct-001')
      expect(dbValue?.label).toBe('餐盒')
    })

    it('should show save settings button after changes', async () => {
      const user = userEvent.setup()
      render(<CommodityTypeSection refreshKey={0} onRefresh={vi.fn()} />)

      await screen.findByText('餐盒')

      // Save button exists but is disabled initially
      const saveBtn = screen.getByText('儲存設定')
      expect(saveBtn.closest('button')?.disabled).toBe(true)

      // Make a change
      const editButtons = screen.getAllByTestId('edit-button')
      await user.click(editButtons[0]!)
      const input = screen.getByDisplayValue('餐盒')
      await user.clear(input)
      await user.type(input, '主食')
      await user.click(screen.getByRole('button', { name: '確認' }))

      // Save button should be enabled
      await waitFor(() => {
        expect(screen.getByText('儲存設定').closest('button')?.disabled).toBe(false)
      })
    })

    it('should close modal when cancel is clicked', async () => {
      const user = userEvent.setup()
      render(<CommodityTypeSection refreshKey={0} onRefresh={vi.fn()} />)

      await screen.findByText('餐盒')

      const editButtons = screen.getAllByTestId('edit-button')
      await user.click(editButtons[0]!)

      // Modal is open
      expect(screen.getByTestId('modal')).toBeTruthy()

      await user.click(screen.getByRole('button', { name: '取消' }))

      // Modal should close
      expect(screen.queryByTestId('modal')).toBeNull()
    })
  })
})
