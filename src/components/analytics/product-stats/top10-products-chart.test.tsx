/**
 * Tests for Top10ProductsChart component.
 * Verifies item rendering, sort toggle buttons, and aria label.
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import type { ProductRanking } from '@/lib/repositories/statistics-repository'
import { Top10ProductsChart } from './top10-products-chart'

// ─── Fixtures ─────────────────────────────────────────────────────────────────

function buildItems(count: number): ProductRanking[] {
  return Array.from({ length: count }, (_, i) => ({
    comId: `com-${i + 1}`,
    name: `商品 ${i + 1}`,
    quantity: (count - i) * 10,
    revenue: (count - i) * 500,
  }))
}

const TEN_ITEMS = buildItems(10)
const FIVE_ITEMS = buildItems(5)

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Top10ProductsChart', () => {
  describe('accessibility', () => {
    it('renders the aria-label "商品排行" on the outer element', () => {
      render(
        <Top10ProductsChart
          items={TEN_ITEMS}
          sortBy="quantity"
          onSortChange={vi.fn()}
        />,
      )
      expect(screen.getByRole('region', { name: '商品排行' })).toBeTruthy()
    })
  })

  describe('item rendering', () => {
    it('renders all 10 items when given 10 items', () => {
      render(
        <Top10ProductsChart
          items={TEN_ITEMS}
          sortBy="quantity"
          onSortChange={vi.fn()}
        />,
      )
      for (const item of TEN_ITEMS) {
        expect(screen.getByText(item.name)).toBeTruthy()
      }
    })

    it('renders 5 items correctly when given fewer than 10', () => {
      render(
        <Top10ProductsChart
          items={FIVE_ITEMS}
          sortBy="quantity"
          onSortChange={vi.fn()}
        />,
      )
      for (const item of FIVE_ITEMS) {
        expect(screen.getByText(item.name)).toBeTruthy()
      }
    })

    it('displays quantity with 份 suffix when sortBy is quantity', () => {
      render(
        <Top10ProductsChart
          items={FIVE_ITEMS}
          sortBy="quantity"
          onSortChange={vi.fn()}
        />,
      )
      // First item has quantity 50 (5 items, first is (5-0)*10=50)
      const quantityTexts = screen.getAllByText(/份/)
      expect(quantityTexts.length).toBeGreaterThan(0)
    })

    it('displays revenue with $ prefix when sortBy is revenue', () => {
      render(
        <Top10ProductsChart
          items={FIVE_ITEMS}
          sortBy="revenue"
          onSortChange={vi.fn()}
        />,
      )
      const revenueTexts = screen.getAllByText(/\$/)
      expect(revenueTexts.length).toBeGreaterThan(0)
    })

    it('renders rank numbers starting at #1', () => {
      render(
        <Top10ProductsChart
          items={TEN_ITEMS}
          sortBy="quantity"
          onSortChange={vi.fn()}
        />,
      )
      expect(screen.getByText('#1')).toBeTruthy()
      expect(screen.getByText('#10')).toBeTruthy()
    })
  })

  describe('sort toggle buttons', () => {
    it('renders both 銷量 and 金額 toggle buttons', () => {
      render(
        <Top10ProductsChart
          items={TEN_ITEMS}
          sortBy="quantity"
          onSortChange={vi.fn()}
        />,
      )
      expect(screen.getByRole('button', { name: '銷量' })).toBeTruthy()
      expect(screen.getByRole('button', { name: '金額' })).toBeTruthy()
    })

    it('calls onSortChange with "revenue" when 金額 button is clicked', () => {
      const onSortChange = vi.fn()
      render(
        <Top10ProductsChart
          items={TEN_ITEMS}
          sortBy="quantity"
          onSortChange={onSortChange}
        />,
      )
      fireEvent.click(screen.getByRole('button', { name: '金額' }))
      expect(onSortChange).toHaveBeenCalledWith('revenue')
    })

    it('calls onSortChange with "quantity" when 銷量 button is clicked', () => {
      const onSortChange = vi.fn()
      render(
        <Top10ProductsChart
          items={TEN_ITEMS}
          sortBy="revenue"
          onSortChange={onSortChange}
        />,
      )
      fireEvent.click(screen.getByRole('button', { name: '銷量' }))
      expect(onSortChange).toHaveBeenCalledWith('quantity')
    })
  })

  describe('edge cases', () => {
    it('renders without crashing when items array is empty', () => {
      const { container } = render(
        <Top10ProductsChart
          items={[]}
          sortBy="quantity"
          onSortChange={vi.fn()}
        />,
      )
      expect(container).toBeTruthy()
    })

    it('renders without crashing when given a single item', () => {
      render(
        <Top10ProductsChart
          items={buildItems(1)}
          sortBy="quantity"
          onSortChange={vi.fn()}
        />,
      )
      expect(screen.getByText('商品 1')).toBeTruthy()
    })
  })
})
