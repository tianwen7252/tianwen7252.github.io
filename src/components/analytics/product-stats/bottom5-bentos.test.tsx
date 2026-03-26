/**
 * Tests for Bottom5Bentos component.
 * Verifies ranking display, warning colors, and aria label.
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { ProductRanking } from '@/lib/repositories/statistics-repository'
import { Bottom5Bentos } from './bottom5-bentos'

// ─── Fixtures ─────────────────────────────────────────────────────────────────

function buildItems(count: number): ProductRanking[] {
  return Array.from({ length: count }, (_, i) => ({
    comId: `com-${i + 1}`,
    name: `便當 ${i + 1}`,
    quantity: (i + 1) * 2,
    revenue: (i + 1) * 100,
  }))
}

const FIVE_ITEMS = buildItems(5)
const THREE_ITEMS = buildItems(3)

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Bottom5Bentos', () => {
  describe('accessibility', () => {
    it('renders the aria-label "銷量最低便當" on the outer element', () => {
      render(<Bottom5Bentos items={FIVE_ITEMS} />)
      expect(screen.getByRole('region', { name: '銷量最低便當' })).toBeTruthy()
    })
  })

  describe('item rendering', () => {
    it('renders all 5 items when given 5 items', () => {
      render(<Bottom5Bentos items={FIVE_ITEMS} />)
      for (const item of FIVE_ITEMS) {
        expect(screen.getByText(item.name)).toBeTruthy()
      }
    })

    it('renders 3 items correctly when given fewer than 5', () => {
      render(<Bottom5Bentos items={THREE_ITEMS} />)
      for (const item of THREE_ITEMS) {
        expect(screen.getByText(item.name)).toBeTruthy()
      }
    })

    it('renders quantity for each item', () => {
      render(<Bottom5Bentos items={FIVE_ITEMS} />)
      // First item (rank 1) has quantity 2 — query by data-rank + text content
      const firstRankEl = document.querySelector('[data-rank="1"]')
      expect(firstRankEl?.textContent).toContain('2')
    })

    it('renders rank numbers (1 through 5)', () => {
      render(<Bottom5Bentos items={FIVE_ITEMS} />)
      for (let rank = 1; rank <= 5; rank++) {
        // Each [data-rank] element should include the rank number in its text
        const rankEl = document.querySelector(`[data-rank="${rank}"]`)
        expect(rankEl).toBeTruthy()
        expect(rankEl?.textContent).toContain(String(rank))
      }
    })
  })

  describe('warning colors', () => {
    it('applies text-destructive class to the first item (lowest sales)', () => {
      render(<Bottom5Bentos items={FIVE_ITEMS} />)
      // The first item wrapper should have text-destructive
      const firstItem = screen.getByText('便當 1').closest('[data-rank="1"]')
      expect(firstItem?.className).toContain('text-destructive')
    })

    it('applies text-orange-500 class to the second item', () => {
      render(<Bottom5Bentos items={FIVE_ITEMS} />)
      const secondItem = screen.getByText('便當 2').closest('[data-rank="2"]')
      expect(secondItem?.className).toContain('text-orange-500')
    })

    it('applies text-yellow-500 class to items ranked 3–5', () => {
      render(<Bottom5Bentos items={FIVE_ITEMS} />)
      for (let rank = 3; rank <= 5; rank++) {
        const item = screen.getByText(`便當 ${rank}`).closest(`[data-rank="${rank}"]`)
        expect(item?.className).toContain('text-yellow-500')
      }
    })
  })

  describe('edge cases', () => {
    it('renders without crashing when items array is empty', () => {
      const { container } = render(<Bottom5Bentos items={[]} />)
      expect(container).toBeTruthy()
    })

    it('renders a single item without crashing', () => {
      render(<Bottom5Bentos items={buildItems(1)} />)
      expect(screen.getByText('便當 1')).toBeTruthy()
    })
  })
})
