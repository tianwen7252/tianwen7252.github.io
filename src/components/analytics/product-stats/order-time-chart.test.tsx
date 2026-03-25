/**
 * Tests for OrderTimeChart component.
 * Uses a recharts mock to avoid JSDOM SVG rendering issues.
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import type { HourBucket } from '@/lib/repositories/statistics-repository'

// Mock recharts so SVG elements don't fail in JSDOM
vi.mock('recharts', () => ({
  BarChart: ({ children }: { children: ReactNode }) => (
    <div data-testid="bar-chart">{children}</div>
  ),
  Bar: ({ children }: { children: ReactNode }) => (
    <div data-testid="bar">{children}</div>
  ),
  XAxis: () => null,
  YAxis: () => null,
  Tooltip: () => null,
  ResponsiveContainer: ({ children }: { children: ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  Cell: () => null,
}))

import { OrderTimeChart } from './order-time-chart'

// ─── Fixtures ─────────────────────────────────────────────────────────────────

function buildFullHourlyData(peakHour = 12): HourBucket[] {
  return Array.from({ length: 24 }, (_, hour) => ({
    hour,
    count: hour === peakHour ? 50 : 5,
  }))
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('OrderTimeChart', () => {
  describe('accessibility', () => {
    it('renders the aria-label "訂單時間分布" on the outer div', () => {
      render(<OrderTimeChart data={buildFullHourlyData()} />)
      expect(screen.getByRole('region', { name: '訂單時間分布' })).toBeTruthy()
    })
  })

  describe('chart rendering', () => {
    it('renders a ResponsiveContainer wrapping a BarChart', () => {
      render(<OrderTimeChart data={buildFullHourlyData()} />)
      expect(screen.getByTestId('responsive-container')).toBeTruthy()
      expect(screen.getByTestId('bar-chart')).toBeTruthy()
    })

    it('renders a Bar element', () => {
      render(<OrderTimeChart data={buildFullHourlyData()} />)
      expect(screen.getByTestId('bar')).toBeTruthy()
    })
  })

  describe('empty data', () => {
    it('does not crash when given an empty array', () => {
      const { container } = render(<OrderTimeChart data={[]} />)
      expect(container).toBeTruthy()
    })

    it('renders the aria-label even with empty data', () => {
      render(<OrderTimeChart data={[]} />)
      expect(screen.getByRole('region', { name: '訂單時間分布' })).toBeTruthy()
    })
  })

  describe('peak hour detection', () => {
    it('renders without crashing when all counts are zero', () => {
      const allZero: HourBucket[] = Array.from({ length: 24 }, (_, hour) => ({
        hour,
        count: 0,
      }))
      const { container } = render(<OrderTimeChart data={allZero} />)
      expect(container).toBeTruthy()
    })

    it('renders without crashing when a single hour has data', () => {
      const sparse: HourBucket[] = [{ hour: 10, count: 20 }]
      const { container } = render(<OrderTimeChart data={sparse} />)
      expect(container).toBeTruthy()
    })
  })
})
