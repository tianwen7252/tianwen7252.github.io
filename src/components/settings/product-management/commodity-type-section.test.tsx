/**
 * Tests for CommodityTypeSection component.
 * Verifies rendering of commodity type cards, inline label editing,
 * and update operations via the repository.
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
vi.mock('@/components/ui/sonner', () => ({
  notify: {
    success: (...args: unknown[]) => mockNotifySuccess(...args),
  },
}))

describe('CommodityTypeSection', () => {
  beforeEach(() => {
    resetMockRepositories()
    mockNotifySuccess.mockClear()
  })

  afterEach(() => {
    resetMockRepositories()
  })

  describe('rendering', () => {
    it('should render the section title', async () => {
      render(<CommodityTypeSection />)
      await screen.findByText('商品種類')
    })

    it('should render all 4 commodity type cards', async () => {
      render(<CommodityTypeSection />)
      await screen.findByText('餐盒')
      expect(screen.getByText('單點')).toBeTruthy()
      expect(screen.getByText('飲料')).toBeTruthy()
      expect(screen.getByText('水餃')).toBeTruthy()
    })

    it('should render typeId badges for each type', async () => {
      render(<CommodityTypeSection />)
      await screen.findByText('bento')
      expect(screen.getByText('single')).toBeTruthy()
      expect(screen.getByText('drink')).toBeTruthy()
      expect(screen.getByText('dumpling')).toBeTruthy()
    })

    it('should render color dots for each type', async () => {
      render(<CommodityTypeSection />)
      await screen.findByText('餐盒')

      // Each card should have a color dot element
      const dots = screen.getAllByTestId('type-color-dot')
      expect(dots.length).toBe(4)
    })
  })

  describe('inline label editing', () => {
    it('should enter edit mode when label is clicked', async () => {
      const user = userEvent.setup()
      render(<CommodityTypeSection />)

      const label = await screen.findByText('餐盒')
      await user.click(label)

      // Should show an input with the current label value
      const input = screen.getByDisplayValue('餐盒')
      expect(input).toBeTruthy()
    })

    it('should save on Enter key', async () => {
      const user = userEvent.setup()
      render(<CommodityTypeSection />)

      const label = await screen.findByText('餐盒')
      await user.click(label)

      const input = screen.getByDisplayValue('餐盒')
      await user.clear(input)
      await user.type(input, '主食{Enter}')

      // Should exit edit mode and show new label
      await waitFor(() => {
        expect(screen.getByText('主食')).toBeTruthy()
        expect(screen.queryByDisplayValue('主食')).toBeNull()
      })

      // Should show success toast
      expect(mockNotifySuccess).toHaveBeenCalledWith('種類名稱已更新')
    })

    it('should cancel on Escape key', async () => {
      const user = userEvent.setup()
      render(<CommodityTypeSection />)

      const label = await screen.findByText('餐盒')
      await user.click(label)

      const input = screen.getByDisplayValue('餐盒')
      await user.clear(input)
      await user.type(input, '主食')
      await user.keyboard('{Escape}')

      // Should revert to the original label
      await waitFor(() => {
        expect(screen.getByText('餐盒')).toBeTruthy()
        expect(screen.queryByDisplayValue('主食')).toBeNull()
      })

      // Should NOT call the notify
      expect(mockNotifySuccess).not.toHaveBeenCalled()
    })

    it('should save on blur', async () => {
      const user = userEvent.setup()
      render(<CommodityTypeSection />)

      const label = await screen.findByText('餐盒')
      await user.click(label)

      const input = screen.getByDisplayValue('餐盒')
      await user.clear(input)
      await user.type(input, '便當')
      await user.tab() // blur the input

      await waitFor(() => {
        expect(screen.getByText('便當')).toBeTruthy()
      })

      expect(mockNotifySuccess).toHaveBeenCalledWith('種類名稱已更新')
    })

    it('should update the repository when saving', async () => {
      const user = userEvent.setup()
      render(<CommodityTypeSection />)

      const label = await screen.findByText('餐盒')
      await user.click(label)

      const input = screen.getByDisplayValue('餐盒')
      await user.clear(input)
      await user.type(input, '主食{Enter}')

      await waitFor(async () => {
        const updated = await getCommodityTypeRepo().findById('ct-001')
        expect(updated?.label).toBe('主食')
      })
    })

    it('should not save when label is unchanged', async () => {
      const user = userEvent.setup()
      render(<CommodityTypeSection />)

      const label = await screen.findByText('餐盒')
      await user.click(label)

      // Press Enter without changing value
      await user.keyboard('{Enter}')

      // Should exit edit mode but not show toast
      expect(mockNotifySuccess).not.toHaveBeenCalled()
    })

    it('should not save when label is empty', async () => {
      const user = userEvent.setup()
      render(<CommodityTypeSection />)

      const label = await screen.findByText('餐盒')
      await user.click(label)

      const input = screen.getByDisplayValue('餐盒')
      await user.clear(input)
      await user.keyboard('{Enter}')

      // Should revert to original label
      await waitFor(() => {
        expect(screen.getByText('餐盒')).toBeTruthy()
      })

      expect(mockNotifySuccess).not.toHaveBeenCalled()
    })
  })
})
