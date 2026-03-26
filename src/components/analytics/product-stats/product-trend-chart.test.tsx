/**
 * Tests for ProductTrendChart component.
 * Uses a recharts mock to avoid JSDOM SVG rendering issues.
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import type { ReactNode } from 'react'
import type { DailyRevenue } from '@/lib/repositories/statistics-repository'

// Mock recharts so SVG elements don't fail in JSDOM
vi.mock('recharts', () => ({
  LineChart: ({ children }: { children: ReactNode }) => (
    <div data-testid="line-chart">{children}</div>
  ),
  Line: () => <div data-testid="line" />,
  XAxis: () => null,
  YAxis: () => null,
  Tooltip: () => null,
  ResponsiveContainer: ({ children }: { children: ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
}))

// Mock the shadcn chart components
vi.mock('@/components/ui/chart', () => ({
  ChartContainer: ({ children }: { children: ReactNode }) => (
    <div data-testid="chart-container">{children}</div>
  ),
  ChartTooltip: () => null,
  ChartTooltipContent: () => null,
}))

import { ProductTrendChart } from './product-trend-chart'

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const COMMODITIES = [
  { id: 'com-001', name: '招牌便當' },
  { id: 'com-002', name: '排骨便當' },
  { id: 'com-003', name: '雞腿便當' },
]

function buildTrendData(): DailyRevenue[] {
  return Array.from({ length: 30 }, (_, i) => ({
    date: `2026-03-${String(i + 1).padStart(2, '0')}`,
    revenue: Math.floor(Math.random() * 50) + 10,
  }))
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('ProductTrendChart', () => {
  describe('accessibility', () => {
    it('renders aria-label "商品銷售趨勢" on the outer div', () => {
      render(
        <ProductTrendChart
          data={buildTrendData()}
          commodities={COMMODITIES}
          selectedId="com-001"
          onSelectChange={vi.fn()}
        />,
      )
      expect(screen.getByRole('region', { name: '商品銷售趨勢' })).toBeTruthy()
    })
  })

  describe('chart rendering', () => {
    it('renders a ChartContainer', () => {
      render(
        <ProductTrendChart
          data={buildTrendData()}
          commodities={COMMODITIES}
          selectedId="com-001"
          onSelectChange={vi.fn()}
        />,
      )
      expect(screen.getByTestId('chart-container')).toBeTruthy()
    })

    it('renders a LineChart', () => {
      render(
        <ProductTrendChart
          data={buildTrendData()}
          commodities={COMMODITIES}
          selectedId="com-001"
          onSelectChange={vi.fn()}
        />,
      )
      expect(screen.getByTestId('line-chart')).toBeTruthy()
    })

    it('renders a Line element', () => {
      render(
        <ProductTrendChart
          data={buildTrendData()}
          commodities={COMMODITIES}
          selectedId="com-001"
          onSelectChange={vi.fn()}
        />,
      )
      expect(screen.getByTestId('line')).toBeTruthy()
    })
  })

  describe('commodity select', () => {
    it('renders a select element', () => {
      render(
        <ProductTrendChart
          data={buildTrendData()}
          commodities={COMMODITIES}
          selectedId="com-001"
          onSelectChange={vi.fn()}
        />,
      )
      expect(screen.getByRole('combobox')).toBeTruthy()
    })

    it('renders an option for each commodity', () => {
      render(
        <ProductTrendChart
          data={buildTrendData()}
          commodities={COMMODITIES}
          selectedId="com-001"
          onSelectChange={vi.fn()}
        />,
      )
      for (const c of COMMODITIES) {
        expect(screen.getByRole('option', { name: c.name })).toBeTruthy()
      }
    })

    it('shows the selectedId as the current value', () => {
      render(
        <ProductTrendChart
          data={buildTrendData()}
          commodities={COMMODITIES}
          selectedId="com-002"
          onSelectChange={vi.fn()}
        />,
      )
      const select = screen.getByRole('combobox') as HTMLSelectElement
      expect(select.value).toBe('com-002')
    })

    it('calls onSelectChange with new id when user changes selection', () => {
      const onSelectChange = vi.fn()
      render(
        <ProductTrendChart
          data={buildTrendData()}
          commodities={COMMODITIES}
          selectedId="com-001"
          onSelectChange={onSelectChange}
        />,
      )
      const select = screen.getByRole('combobox')
      fireEvent.change(select, { target: { value: 'com-003' } })
      expect(onSelectChange).toHaveBeenCalledWith('com-003')
    })
  })

  describe('empty data', () => {
    it('does not crash when data is empty', () => {
      const { container } = render(
        <ProductTrendChart
          data={[]}
          commodities={COMMODITIES}
          selectedId="com-001"
          onSelectChange={vi.fn()}
        />,
      )
      expect(container).toBeTruthy()
    })

    it('does not crash when commodities list is empty', () => {
      const { container } = render(
        <ProductTrendChart
          data={[]}
          commodities={[]}
          selectedId=""
          onSelectChange={vi.fn()}
        />,
      )
      expect(container).toBeTruthy()
    })

    it('renders aria-label even with empty data', () => {
      render(
        <ProductTrendChart
          data={[]}
          commodities={[]}
          selectedId=""
          onSelectChange={vi.fn()}
        />,
      )
      expect(screen.getByRole('region', { name: '商品銷售趨勢' })).toBeTruthy()
    })
  })

  describe('single commodity', () => {
    it('renders without crashing with a single commodity', () => {
      render(
        <ProductTrendChart
          data={buildTrendData()}
          commodities={[{ id: 'com-001', name: '招牌便當' }]}
          selectedId="com-001"
          onSelectChange={vi.fn()}
        />,
      )
      expect(screen.getByRole('option', { name: '招牌便當' })).toBeTruthy()
    })
  })
})
