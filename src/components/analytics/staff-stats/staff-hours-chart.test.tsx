/**
 * Tests for StaffHoursChart component.
 * Uses a recharts mock to avoid JSDOM SVG rendering issues.
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import type { EmployeeHours } from '@/lib/repositories/statistics-repository'

// Mock recharts so SVG elements don't fail in JSDOM
vi.mock('recharts', () => ({
  BarChart: ({ children }: { children: ReactNode }) => (
    <div data-testid="bar-chart">{children}</div>
  ),
  Bar: ({ dataKey, name }: { dataKey: string; name: string }) => (
    <div data-testid={`bar-${dataKey}`} data-name={name} />
  ),
  XAxis: () => null,
  YAxis: () => null,
  Tooltip: () => null,
  Legend: () => <div data-testid="legend" />,
  ResponsiveContainer: ({ children }: { children: ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
}))

import { StaffHoursChart } from './staff-hours-chart'

// ─── Fixtures ─────────────────────────────────────────────────────────────────

function buildEmployeeHours(count: number): EmployeeHours[] {
  return Array.from({ length: count }, (_, i) => ({
    employeeId: `emp-${i + 1}`,
    employeeName: `員工 ${i + 1}`,
    regular: 160 - i * 5,
    paidLeave: i * 2,
    sickLeave: i,
    personalLeave: 0,
    absent: 0,
  }))
}

const SAMPLE_DATA = buildEmployeeHours(3)

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('StaffHoursChart', () => {
  describe('accessibility', () => {
    it('renders aria-label "員工工時分布" on the outer element', () => {
      render(<StaffHoursChart data={SAMPLE_DATA} />)
      expect(screen.getByRole('region', { name: '員工工時分布' })).toBeTruthy()
    })
  })

  describe('chart rendering', () => {
    it('renders a ResponsiveContainer', () => {
      render(<StaffHoursChart data={SAMPLE_DATA} />)
      expect(screen.getByTestId('responsive-container')).toBeTruthy()
    })

    it('renders a BarChart', () => {
      render(<StaffHoursChart data={SAMPLE_DATA} />)
      expect(screen.getByTestId('bar-chart')).toBeTruthy()
    })

    it('renders a Bar for regular hours (dataKey="regular")', () => {
      render(<StaffHoursChart data={SAMPLE_DATA} />)
      expect(screen.getByTestId('bar-regular')).toBeTruthy()
    })

    it('renders a Bar for paid leave (dataKey="paidLeave")', () => {
      render(<StaffHoursChart data={SAMPLE_DATA} />)
      expect(screen.getByTestId('bar-paidLeave')).toBeTruthy()
    })

    it('renders a Bar for sick leave (dataKey="sickLeave")', () => {
      render(<StaffHoursChart data={SAMPLE_DATA} />)
      expect(screen.getByTestId('bar-sickLeave')).toBeTruthy()
    })

    it('renders a Bar for personal leave (dataKey="personalLeave")', () => {
      render(<StaffHoursChart data={SAMPLE_DATA} />)
      expect(screen.getByTestId('bar-personalLeave')).toBeTruthy()
    })

    it('renders a Bar for absent (dataKey="absent")', () => {
      render(<StaffHoursChart data={SAMPLE_DATA} />)
      expect(screen.getByTestId('bar-absent')).toBeTruthy()
    })

    it('renders all 5 bar segments', () => {
      render(<StaffHoursChart data={SAMPLE_DATA} />)
      // regular, paidLeave, sickLeave, personalLeave, absent
      expect(screen.getByTestId('bar-regular')).toBeTruthy()
      expect(screen.getByTestId('bar-paidLeave')).toBeTruthy()
      expect(screen.getByTestId('bar-sickLeave')).toBeTruthy()
      expect(screen.getByTestId('bar-personalLeave')).toBeTruthy()
      expect(screen.getByTestId('bar-absent')).toBeTruthy()
    })
  })

  describe('empty data', () => {
    it('renders without crashing when data is empty', () => {
      const { container } = render(<StaffHoursChart data={[]} />)
      expect(container).toBeTruthy()
    })

    it('renders aria-label even with empty data', () => {
      render(<StaffHoursChart data={[]} />)
      expect(screen.getByRole('region', { name: '員工工時分布' })).toBeTruthy()
    })

    it('still renders ResponsiveContainer with empty data', () => {
      render(<StaffHoursChart data={[]} />)
      expect(screen.getByTestId('responsive-container')).toBeTruthy()
    })
  })

  describe('large data', () => {
    it('renders without crashing with 20 employees', () => {
      const { container } = render(<StaffHoursChart data={buildEmployeeHours(20)} />)
      expect(container).toBeTruthy()
    })
  })
})
