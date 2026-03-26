/**
 * AttendanceSummaryTable — sortable table of per-employee attendance data.
 * Columns: 員工姓名, 出勤天, 特休, 病假, 事假, 缺席.
 * Clicking a column header toggles asc/desc for that column.
 * Default sort: 員工姓名 ascending.
 */

import { useState } from 'react'
import type { EmployeeHours } from '@/lib/repositories/statistics-repository'

// ─── Types ────────────────────────────────────────────────────────────────────

interface AttendanceSummaryTableProps {
  data: EmployeeHours[]
}

type SortKey = 'employeeName' | 'regular' | 'paidLeave' | 'sickLeave' | 'personalLeave' | 'absent'
type SortDir = 'asc' | 'desc'

interface SortState {
  key: SortKey
  dir: SortDir
}

// ─── Column config ────────────────────────────────────────────────────────────

interface ColumnDef {
  key: SortKey
  label: string
}

const COLUMNS: ColumnDef[] = [
  { key: 'employeeName', label: '員工姓名' },
  { key: 'regular', label: '正班工時' },
  { key: 'paidLeave', label: '特休' },
  { key: 'sickLeave', label: '病假' },
  { key: 'personalLeave', label: '事假' },
  { key: 'absent', label: '缺席' },
]

// ─── Sort helper ──────────────────────────────────────────────────────────────

/**
 * Returns a sorted copy of rows by the given key and direction.
 * Never mutates the input array.
 */
function sortRows(rows: EmployeeHours[], key: SortKey, dir: SortDir): EmployeeHours[] {
  return [...rows].sort((a, b) => {
    const aVal = a[key]
    const bVal = b[key]

    if (typeof aVal === 'string' && typeof bVal === 'string') {
      const cmp = aVal.localeCompare(bVal, 'zh-Hant')
      return dir === 'asc' ? cmp : -cmp
    }

    const aNum = Number(aVal)
    const bNum = Number(bVal)
    return dir === 'asc' ? aNum - bNum : bNum - aNum
  })
}

// ─── Main component ───────────────────────────────────────────────────────────

/**
 * Renders an attendace detail table with clickable column headers for sorting.
 * Defaults to ascending sort by employee name.
 */
export function AttendanceSummaryTable({ data }: AttendanceSummaryTableProps) {
  const [sort, setSort] = useState<SortState>({ key: 'employeeName', dir: 'asc' })

  function handleHeaderClick(key: SortKey): void {
    setSort(prev => {
      if (prev.key === key) {
        // Toggle direction on the same column
        return { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
      }
      // New column always starts ascending
      return { key, dir: 'asc' }
    })
  }

  const sorted = sortRows(data, sort.key, sort.dir)

  return (
    <section aria-label="出勤明細表">
      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-base">
          <thead>
            <tr className="border-b bg-muted/50">
              {COLUMNS.map(col => {
                const isActive = sort.key === col.key
                const ariaSort = isActive
                  ? (sort.dir === 'asc' ? 'ascending' : 'descending')
                  : 'none'
                return (
                  <th
                    key={col.key}
                    onClick={() => handleHeaderClick(col.key)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        handleHeaderClick(col.key)
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    aria-sort={ariaSort}
                    className="cursor-pointer select-none px-4 py-3 text-left font-medium text-muted-foreground hover:text-foreground"
                  >
                    {col.label}
                    {isActive && (
                      <span className="ml-1 text-xs" aria-hidden>
                        {sort.dir === 'asc' ? '▲' : '▼'}
                      </span>
                    )}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {sorted.map(row => (
              <tr
                key={row.employeeId}
                className="border-b last:border-b-0 hover:bg-muted/30"
              >
                <td className="px-4 py-3">{row.employeeName}</td>
                <td className="px-4 py-3 tabular-nums">{row.regular}</td>
                <td className="px-4 py-3 tabular-nums">{row.paidLeave}</td>
                <td className="px-4 py-3 tabular-nums">{row.sickLeave}</td>
                <td className="px-4 py-3 tabular-nums">{row.personalLeave}</td>
                <td className="px-4 py-3 tabular-nums">{row.absent}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
