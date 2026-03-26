/**
 * Tests for AvgOrderValueChart component.
 * Uses a recharts mock to avoid JSDOM SVG rendering issues.
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import type { DailyRevenue } from '@/lib/repositories/statistics-repository'

// Mock recharts so SVG elements don't fail in JSDOM
vi.mock('recharts', () => ({
  LineChart: ({ children }: { children: ReactNode }) => (
    <div data-testid="line-chart">{children}</div>
  ),
  Line: ({ name }: { name: string }) => <div data-testid={`line-${name}`} />,
  XAxis: () => null,
  YAxis: () => null,
  Tooltip: () => null,
  Legend: () => <div data-testid="legend" />,
  ResponsiveContainer: ({ children }: { children: ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
}))

import { AvgOrderValueChart } from './avg-order-value-chart'

// ─── Fixtures ─────────────────────────────────────────────────────────────────

function buildAvgData(days = 30): DailyRevenue[] {
  return Array.from({ length: days }, (_, i) => ({
    date: `2026-03-${String(i + 1).padStart(2, '0')}`,
    revenue: 100 + i * 5,
  }))
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('AvgOrderValueChart', () => {
  describe('accessibility', () => {
    it('renders aria-label "平均客單價趨勢" on the outer div', () => {
      render(<AvgOrderValueChart data={buildAvgData()} />)
      expect(screen.getByRole('region', { name: '平均客單價趨勢' })).toBeTruthy()
    })
  })

  describe('chart rendering', () => {
    it('renders a ResponsiveContainer', () => {
      render(<AvgOrderValueChart data={buildAvgData()} />)
      expect(screen.getByTestId('responsive-container')).toBeTruthy()
    })

    it('renders a LineChart', () => {
      render(<AvgOrderValueChart data={buildAvgData()} />)
      expect(screen.getByTestId('line-chart')).toBeTruthy()
    })

    it('renders the 客單價 Line (raw values)', () => {
      render(<AvgOrderValueChart data={buildAvgData()} />)
      expect(screen.getByTestId('line-客單價')).toBeTruthy()
    })

    it('renders the 7日均線 Line (moving average)', () => {
      render(<AvgOrderValueChart data={buildAvgData()} />)
      expect(screen.getByTestId('line-7日均線')).toBeTruthy()
    })
  })

  describe('empty data', () => {
    it('does not crash when data is empty', () => {
      const { container } = render(<AvgOrderValueChart data={[]} />)
      expect(container).toBeTruthy()
    })

    it('renders aria-label even with empty data', () => {
      render(<AvgOrderValueChart data={[]} />)
      expect(screen.getByRole('region', { name: '平均客單價趨勢' })).toBeTruthy()
    })
  })

  describe('moving average computation', () => {
    it('renders without crashing with fewer than 7 data points', () => {
      const { container } = render(<AvgOrderValueChart data={buildAvgData(3)} />)
      expect(container).toBeTruthy()
    })

    it('renders without crashing with exactly 7 data points', () => {
      const { container } = render(<AvgOrderValueChart data={buildAvgData(7)} />)
      expect(container).toBeTruthy()
    })

    it('renders without crashing with 1 data point', () => {
      const { container } = render(
        <AvgOrderValueChart data={[{ date: '2026-03-01', revenue: 150 }]} />,
      )
      expect(container).toBeTruthy()
    })
  })
})
