/**
 * Tests for RevenueComparisonChart component.
 * Uses a recharts mock to avoid JSDOM SVG rendering issues.
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import type { DailyRevenue } from '@/lib/repositories/statistics-repository'

// Mock recharts so SVG elements don't fail in JSDOM
vi.mock('recharts', () => ({
  AreaChart: ({ children }: { children: ReactNode }) => (
    <div data-testid="area-chart">{children}</div>
  ),
  Area: ({ name }: { name: string }) => <div data-testid={`area-${name}`} />,
  XAxis: () => null,
  YAxis: () => null,
  Tooltip: () => null,
  Legend: () => <div data-testid="legend" />,
  ResponsiveContainer: ({ children }: { children: ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
}))

import { RevenueComparisonChart } from './revenue-comparison-chart'

// ─── Fixtures ─────────────────────────────────────────────────────────────────

function buildMonthData(): DailyRevenue[] {
  return Array.from({ length: 31 }, (_, i) => ({
    date: `2026-03-${String(i + 1).padStart(2, '0')}`,
    revenue: (i + 1) * 1000,
  }))
}

function buildPrevMonthData(): DailyRevenue[] {
  return Array.from({ length: 28 }, (_, i) => ({
    date: `2026-02-${String(i + 1).padStart(2, '0')}`,
    revenue: (i + 1) * 900,
  }))
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('RevenueComparisonChart', () => {
  describe('accessibility', () => {
    it('renders aria-label "本月 vs 上月比較" on the outer div', () => {
      render(
        <RevenueComparisonChart
          currentData={buildMonthData()}
          prevData={buildPrevMonthData()}
        />,
      )
      expect(screen.getByRole('region', { name: '本月 vs 上月比較' })).toBeTruthy()
    })
  })

  describe('chart rendering', () => {
    it('renders a ResponsiveContainer', () => {
      render(
        <RevenueComparisonChart
          currentData={buildMonthData()}
          prevData={buildPrevMonthData()}
        />,
      )
      expect(screen.getByTestId('responsive-container')).toBeTruthy()
    })

    it('renders an AreaChart', () => {
      render(
        <RevenueComparisonChart
          currentData={buildMonthData()}
          prevData={buildPrevMonthData()}
        />,
      )
      expect(screen.getByTestId('area-chart')).toBeTruthy()
    })

    it('renders the 本月 Area', () => {
      render(
        <RevenueComparisonChart
          currentData={buildMonthData()}
          prevData={buildPrevMonthData()}
        />,
      )
      expect(screen.getByTestId('area-本月')).toBeTruthy()
    })

    it('renders the 上月 Area', () => {
      render(
        <RevenueComparisonChart
          currentData={buildMonthData()}
          prevData={buildPrevMonthData()}
        />,
      )
      expect(screen.getByTestId('area-上月')).toBeTruthy()
    })

    it('renders a Legend', () => {
      render(
        <RevenueComparisonChart
          currentData={buildMonthData()}
          prevData={buildPrevMonthData()}
        />,
      )
      expect(screen.getByTestId('legend')).toBeTruthy()
    })
  })

  describe('empty data', () => {
    it('does not crash when both arrays are empty', () => {
      const { container } = render(
        <RevenueComparisonChart currentData={[]} prevData={[]} />,
      )
      expect(container).toBeTruthy()
    })

    it('does not crash when currentData is empty but prevData has values', () => {
      const { container } = render(
        <RevenueComparisonChart currentData={[]} prevData={buildPrevMonthData()} />,
      )
      expect(container).toBeTruthy()
    })

    it('renders aria-label even with empty data', () => {
      render(<RevenueComparisonChart currentData={[]} prevData={[]} />)
      expect(screen.getByRole('region', { name: '本月 vs 上月比較' })).toBeTruthy()
    })
  })

  describe('single data point', () => {
    it('renders without crashing when given one data point each', () => {
      const { container } = render(
        <RevenueComparisonChart
          currentData={[{ date: '2026-03-01', revenue: 5000 }]}
          prevData={[{ date: '2026-02-01', revenue: 4000 }]}
        />,
      )
      expect(container).toBeTruthy()
    })
  })
})
