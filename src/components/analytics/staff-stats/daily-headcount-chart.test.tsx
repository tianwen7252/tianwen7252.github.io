/**
 * Tests for DailyHeadcountChart component.
 * Verifies accessibility, chart rendering, and edge cases.
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import type { DailyHeadcount } from '@/lib/repositories/statistics-repository'

// Mock recharts to avoid JSDOM SVG rendering issues
vi.mock('recharts', () => ({
  LineChart: ({ children }: { children: ReactNode }) => (
    <div data-testid="line-chart">{children}</div>
  ),
  Line: ({ dataKey }: { dataKey: string }) => (
    <div data-testid={`line-${dataKey}`} />
  ),
  XAxis: () => null,
  YAxis: () => null,
  Tooltip: () => null,
  CartesianGrid: () => null,
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

import { DailyHeadcountChart } from './daily-headcount-chart'

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const SAMPLE_DATA: DailyHeadcount[] = [
  { date: '2026-03-01', count: 8 },
  { date: '2026-03-02', count: 10 },
  { date: '2026-03-03', count: 0 },
  { date: '2026-03-04', count: 5 },
]

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('DailyHeadcountChart', () => {
  describe('accessibility', () => {
    it('renders aria-label "每日到班人數" section', () => {
      render(<DailyHeadcountChart data={SAMPLE_DATA} />)
      expect(screen.getByRole('region', { name: '每日到班人數' })).toBeTruthy()
    })
  })

  describe('chart rendering', () => {
    it('renders a ChartContainer', () => {
      render(<DailyHeadcountChart data={SAMPLE_DATA} />)
      expect(screen.getByTestId('chart-container')).toBeTruthy()
    })

    it('renders line chart element', () => {
      render(<DailyHeadcountChart data={SAMPLE_DATA} />)
      expect(screen.getByTestId('line-chart')).toBeTruthy()
    })

    it('renders the count data line', () => {
      render(<DailyHeadcountChart data={SAMPLE_DATA} />)
      expect(screen.getByTestId('line-count')).toBeTruthy()
    })

    it('does not crash with empty data', () => {
      const { container } = render(<DailyHeadcountChart data={[]} />)
      expect(container).toBeTruthy()
    })

    it('renders with single data point', () => {
      render(<DailyHeadcountChart data={[{ date: '2026-03-01', count: 5 }]} />)
      expect(screen.getByTestId('line-chart')).toBeTruthy()
    })
  })
})
