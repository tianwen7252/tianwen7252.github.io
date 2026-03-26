/**
 * StaffStats — composite section for the staff analytics tab.
 * Fetches staff KPIs and employee hours in parallel, then renders:
 *   - StaffKpiGrid (when kpis available)
 *   - StaffHoursChart (when employee hours available)
 *   - AttendanceSummaryTable (always, empty state handled inside)
 */

import { useState, useEffect } from 'react'
import type {
  StatisticsRepository,
  StaffKpis,
  EmployeeHours,
} from '@/lib/repositories/statistics-repository'
import { StaffKpiGrid } from './staff-kpi-grid'
import { StaffHoursChart } from './staff-hours-chart'
import { AttendanceSummaryTable } from './attendance-summary-table'

// ─── Types ────────────────────────────────────────────────────────────────────

interface StaffStatsProps {
  startDate: Date
  endDate: Date
  statisticsRepo: StatisticsRepository
}

// ─── Component ───────────────────────────────────────────────────────────────

/**
 * Loads and displays all staff analytics for the selected date range.
 * Uses the cancelled-flag pattern to prevent state updates after unmount.
 */
export function StaffStats({ startDate, endDate, statisticsRepo }: StaffStatsProps) {
  const [kpis, setKpis] = useState<StaffKpis | null>(null)
  const [employeeHours, setEmployeeHours] = useState<EmployeeHours[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    setKpis(null)
    setEmployeeHours([])
    setLoading(true)
    setError(null)

    const range = {
      startDate: startDate.getTime(),
      endDate: endDate.getTime(),
    }

    Promise.all([
      statisticsRepo.getStaffKpis(range),
      statisticsRepo.getEmployeeHours(range),
    ])
      .then(([kpisResult, hoursResult]) => {
        if (cancelled) return
        setKpis(kpisResult)
        setEmployeeHours(hoursResult)
        setLoading(false)
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : '載入失敗')
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [statisticsRepo, startDate, endDate])

  return (
    <section aria-label="員工統計" className="flex flex-col gap-6">
      {error !== null && (
        <p className="text-destructive text-base">{error}</p>
      )}

      {loading && error === null && (
        <p className="text-muted-foreground text-base" role="status">載入中...</p>
      )}

      {!loading && kpis !== null && <StaffKpiGrid kpis={kpis} />}

      {!loading && employeeHours.length > 0 && <StaffHoursChart data={employeeHours} />}

      {!loading && <AttendanceSummaryTable data={employeeHours} />}
    </section>
  )
}
