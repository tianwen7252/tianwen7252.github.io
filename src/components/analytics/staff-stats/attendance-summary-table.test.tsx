/**
 * Tests for AttendanceSummaryTable component.
 * Verifies table structure, column headers, data rows, sorting, and edge cases.
 */

import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { AttendanceSummaryTable } from './attendance-summary-table'
import type { EmployeeHours } from '@/lib/repositories/statistics-repository'

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const SAMPLE_DATA: EmployeeHours[] = [
  {
    employeeId: 'emp-001',
    employeeName: '陳小明',
    regular: 22,
    paidLeave: 1,
    sickLeave: 0,
    personalLeave: 0,
    absent: 0,
  },
  {
    employeeId: 'emp-002',
    employeeName: '王大華',
    regular: 18,
    paidLeave: 0,
    sickLeave: 2,
    personalLeave: 1,
    absent: 0,
  },
  {
    employeeId: 'emp-003',
    employeeName: '林美玲',
    regular: 20,
    paidLeave: 2,
    sickLeave: 0,
    personalLeave: 0,
    absent: 1,
  },
]

const SINGLE_ROW: EmployeeHours[] = [
  {
    employeeId: 'emp-001',
    employeeName: '單一員工',
    regular: 20,
    paidLeave: 0,
    sickLeave: 0,
    personalLeave: 0,
    absent: 0,
  },
]

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('AttendanceSummaryTable', () => {
  describe('accessibility', () => {
    it('renders aria-label "出勤明細表" on the outer element', () => {
      render(<AttendanceSummaryTable data={SAMPLE_DATA} />)
      expect(screen.getByRole('region', { name: '出勤明細表' })).toBeTruthy()
    })
  })

  describe('column headers', () => {
    it('renders 員工姓名 column header', () => {
      render(<AttendanceSummaryTable data={SAMPLE_DATA} />)
      expect(screen.getByText('員工姓名')).toBeTruthy()
    })

    it('renders 正班工時 column header', () => {
      render(<AttendanceSummaryTable data={SAMPLE_DATA} />)
      expect(screen.getByText('正班工時')).toBeTruthy()
    })

    it('renders 特休 column header', () => {
      render(<AttendanceSummaryTable data={SAMPLE_DATA} />)
      expect(screen.getByText('特休')).toBeTruthy()
    })

    it('renders 病假 column header', () => {
      render(<AttendanceSummaryTable data={SAMPLE_DATA} />)
      expect(screen.getByText('病假')).toBeTruthy()
    })

    it('renders 事假 column header', () => {
      render(<AttendanceSummaryTable data={SAMPLE_DATA} />)
      expect(screen.getByText('事假')).toBeTruthy()
    })

    it('renders 缺席 column header', () => {
      render(<AttendanceSummaryTable data={SAMPLE_DATA} />)
      expect(screen.getByText('缺席')).toBeTruthy()
    })
  })

  describe('data rows', () => {
    it('renders a row for each employee', () => {
      render(<AttendanceSummaryTable data={SAMPLE_DATA} />)
      expect(screen.getByText('陳小明')).toBeTruthy()
      expect(screen.getByText('王大華')).toBeTruthy()
      expect(screen.getByText('林美玲')).toBeTruthy()
    })

    it('renders regular hours (正班工時) values', () => {
      render(<AttendanceSummaryTable data={SINGLE_ROW} />)
      expect(screen.getByText('20')).toBeTruthy()
    })

    it('renders paidLeave (特休) values', () => {
      render(<AttendanceSummaryTable data={SAMPLE_DATA} />)
      // 陳小明 has paidLeave=1
      const cells = screen.getAllByText('1')
      expect(cells.length).toBeGreaterThan(0)
    })

    it('renders sickLeave (病假) values for 王大華', () => {
      render(<AttendanceSummaryTable data={SAMPLE_DATA} />)
      const cells = screen.getAllByText('2')
      expect(cells.length).toBeGreaterThan(0)
    })

    it('renders zero values as "0"', () => {
      render(<AttendanceSummaryTable data={SINGLE_ROW} />)
      const zeros = screen.getAllByText('0')
      expect(zeros.length).toBeGreaterThan(0)
    })
  })

  describe('default sort by 員工姓名 ascending', () => {
    it('sorts employees alphabetically by name by default', () => {
      render(<AttendanceSummaryTable data={SAMPLE_DATA} />)
      const rows = screen.getAllByRole('row')
      // rows[0] is the header, rows[1..] are data
      // Default sort: ascending by name — 王大華, 林美玲, 陳小明
      expect(rows[1]?.textContent).toContain('王大華')
      expect(rows[2]?.textContent).toContain('林美玲')
      expect(rows[3]?.textContent).toContain('陳小明')
    })
  })

  describe('sorting', () => {
    it('sorts by 員工姓名 descending when header is clicked twice', () => {
      render(<AttendanceSummaryTable data={SAMPLE_DATA} />)
      // Click twice: first click = already asc so desc, or first = asc then desc
      const nameHeader = screen.getByText('員工姓名')
      fireEvent.click(nameHeader) // second click = descending
      const rows = screen.getAllByRole('row')
      // Descending: 陳小明, 林美玲, 王大華
      expect(rows[1]?.textContent).toContain('陳小明')
    })

    it('sorts by 正班工時 ascending when that header is clicked', () => {
      render(<AttendanceSummaryTable data={SAMPLE_DATA} />)
      const regularHeader = screen.getByText('正班工時')
      fireEvent.click(regularHeader)
      const rows = screen.getAllByRole('row')
      // Ascending: 王大華(18), 林美玲(20), 陳小明(22)
      expect(rows[1]?.textContent).toContain('王大華')
      expect(rows[3]?.textContent).toContain('陳小明')
    })

    it('sorts by 正班工時 descending when header is clicked twice', () => {
      render(<AttendanceSummaryTable data={SAMPLE_DATA} />)
      const regularHeader = screen.getByText('正班工時')
      fireEvent.click(regularHeader) // ascending
      fireEvent.click(regularHeader) // descending
      const rows = screen.getAllByRole('row')
      // Descending: 陳小明(22), 林美玲(20), 王大華(18)
      expect(rows[1]?.textContent).toContain('陳小明')
    })

    it('reverts to ascending when a new column header is clicked', () => {
      render(<AttendanceSummaryTable data={SAMPLE_DATA} />)
      // Click 特休 (paidLeave) — first click = ascending
      const paidLeaveHeader = screen.getByText('特休')
      fireEvent.click(paidLeaveHeader)
      const rows = screen.getAllByRole('row')
      // Ascending by paidLeave: 王大華(0), 林美玲(2) vs 陳小明(1)
      // 0 < 1 < 2 → 王大華, 陳小明, 林美玲
      expect(rows[1]?.textContent).toContain('王大華')
      expect(rows[3]?.textContent).toContain('林美玲')
    })

    it('toggles sort direction on the same column when clicked again', () => {
      render(<AttendanceSummaryTable data={SAMPLE_DATA} />)
      const regularHeader = screen.getByText('正班工時')
      fireEvent.click(regularHeader) // asc
      const rowsAsc = screen.getAllByRole('row')
      const firstAsc = rowsAsc[1]?.textContent ?? ''

      fireEvent.click(regularHeader) // desc
      const rowsDesc = screen.getAllByRole('row')
      const firstDesc = rowsDesc[1]?.textContent ?? ''

      expect(firstAsc).not.toBe(firstDesc)
    })
  })

  describe('empty state', () => {
    it('renders without crashing when data is empty', () => {
      const { container } = render(<AttendanceSummaryTable data={[]} />)
      expect(container).toBeTruthy()
    })

    it('still renders column headers with empty data', () => {
      render(<AttendanceSummaryTable data={[]} />)
      expect(screen.getByText('員工姓名')).toBeTruthy()
      expect(screen.getByText('正班工時')).toBeTruthy()
    })

    it('renders aria-label region even with empty data', () => {
      render(<AttendanceSummaryTable data={[]} />)
      expect(screen.getByRole('region', { name: '出勤明細表' })).toBeTruthy()
    })

    it('renders zero data rows when data is empty', () => {
      render(<AttendanceSummaryTable data={[]} />)
      const rows = screen.getAllByRole('row')
      // Only header row
      expect(rows).toHaveLength(1)
    })
  })

  describe('single row', () => {
    it('renders a single employee row correctly', () => {
      render(<AttendanceSummaryTable data={SINGLE_ROW} />)
      expect(screen.getByText('單一員工')).toBeTruthy()
    })
  })
})
