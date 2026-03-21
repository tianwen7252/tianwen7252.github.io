/**
 * Records container - main attendance records view with table/calendar toggle,
 * search filter, year/month selects, and RecordModal integration.
 */

import { useState, useMemo, useCallback } from 'react'
import dayjs from 'dayjs'
import { LayoutList, Calendar, Info } from 'lucide-react'
import { cn } from '@/lib/cn'
import {
  buildDayRows,
  buildCalendarGrid,
  filterEmployeesByName,
  getYearOptions,
  getMonthOptions,
} from '@/lib/records-utils'
import {
  mockEmployeeService,
  mockAttendanceService,
} from '@/services/mock-data'
import { RecordsTableView } from './records-table-view'
import { RecordsCalendarView } from './records-calendar-view'
import { RecordModal } from '@/components/record-modal'
import type { Employee, Attendance } from '@/lib/schemas'

// ─── Types ──────────────────────────────────────────────────────────────────

type ViewMode = 'table' | 'calendar'

interface ModalState {
  readonly open: boolean
  readonly mode: 'add' | 'edit'
  readonly employee: Employee | null
  readonly date: string
  readonly record?: Attendance
}

const INITIAL_MODAL_STATE: ModalState = {
  open: false,
  mode: 'add',
  employee: null,
  date: '',
}

// ─── Component ──────────────────────────────────────────────────────────────

export function Records() {
  const now = dayjs()
  const [viewMode, setViewMode] = useState<ViewMode>('table')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedYear, setSelectedYear] = useState(now.year())
  const [selectedMonth, setSelectedMonth] = useState(now.month() + 1)
  const [modalState, setModalState] = useState<ModalState>(INITIAL_MODAL_STATE)
  const [refreshKey, setRefreshKey] = useState(0)

  const todayStr = now.format('YYYY-MM-DD')
  const currentYear = now.year()
  const currentMonth = now.month() + 1

  // Fetch data — refreshKey forces re-computation after mutations
  const allEmployees = useMemo(
    () => mockEmployeeService.getActive(),
    [refreshKey],
  )
  const attendances = useMemo(
    () => mockAttendanceService.getByMonth(selectedYear, selectedMonth),
    [selectedYear, selectedMonth, refreshKey],
  )

  // Filter employees by search
  const filteredEmployees = useMemo(
    () => filterEmployeesByName(allEmployees, searchQuery),
    [allEmployees, searchQuery],
  )

  // Build view data
  const dayRows = useMemo(
    () =>
      buildDayRows(
        selectedYear,
        selectedMonth,
        filteredEmployees,
        attendances,
        todayStr,
      ),
    [selectedYear, selectedMonth, filteredEmployees, attendances, todayStr],
  )

  const calendarGrid = useMemo(
    () =>
      buildCalendarGrid(
        selectedYear,
        selectedMonth,
        filteredEmployees,
        attendances,
        todayStr,
      ),
    [selectedYear, selectedMonth, filteredEmployees, attendances, todayStr],
  )

  // Options
  const yearOptions = useMemo(() => getYearOptions(currentYear), [currentYear])
  const monthOptions = useMemo(
    () => getMonthOptions(selectedYear, currentYear, currentMonth),
    [selectedYear, currentYear, currentMonth],
  )

  // Modal handlers
  const handleAddRecord = useCallback(
    (employee: Employee, date: string) => {
      setModalState({
        open: true,
        mode: 'add',
        employee,
        date,
      })
    },
    [setModalState],
  )

  const handleEditRecord = useCallback(
    (employee: Employee, date: string, record: Attendance) => {
      setModalState({
        open: true,
        mode: 'edit',
        employee,
        date,
        record,
      })
    },
    [setModalState],
  )

  const handleModalCancel = useCallback(() => {
    setModalState(INITIAL_MODAL_STATE)
  }, [setModalState])

  const handleModalSuccess = useCallback(() => {
    setModalState(INITIAL_MODAL_STATE)
    setRefreshKey(k => k + 1)
  }, [setModalState, setRefreshKey])

  // "Today" button handler — uses fresh dayjs() to avoid stale closure
  const handleTodayClick = useCallback(() => {
    const today = dayjs()
    setSelectedYear(today.year())
    setSelectedMonth(today.month() + 1)
  }, [setSelectedYear, setSelectedMonth])

  return (
    <div className="p-4">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-2xl font-black -tracking-wider">員工考勤狀況</h3>
        <div className="flex gap-1 rounded-xl bg-muted p-1">
          <button
            type="button"
            className={cn(
              'rounded-lg px-3 py-1.5 text-[13px]',
              viewMode === 'table' ? 'bg-card shadow-[0_0_10px_#ccc]' : '',
            )}
            onClick={() => setViewMode('table')}
          >
            <LayoutList size={14} className="mr-1 inline" />
            表格
          </button>
          <button
            type="button"
            className={cn(
              'rounded-lg px-3 py-1.5 text-[13px]',
              viewMode === 'calendar' ? 'bg-card shadow-[0_0_10px_#ccc]' : '',
            )}
            onClick={() => setViewMode('calendar')}
          >
            <Calendar size={14} className="mr-1 inline" />
            月曆
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="mb-4 grid w-full grid-cols-[2fr_1fr_1fr_auto] items-center gap-3">
        <input
          type="text"
          placeholder="搜尋員工姓名"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full rounded-lg border border-border bg-card px-3 py-1.5 text-sm"
        />
        <select
          value={selectedYear}
          onChange={e => setSelectedYear(Number(e.target.value))}
          className="w-full rounded-lg border border-border bg-card px-3 py-1.5 text-sm"
        >
          {yearOptions.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <select
          value={selectedMonth}
          onChange={e => setSelectedMonth(Number(e.target.value))}
          className="w-full rounded-lg border border-border bg-card px-3 py-1.5 text-sm"
        >
          {monthOptions.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="rounded-lg border border-[#7f956a] bg-transparent px-3 py-1.5 text-sm font-semibold text-[#7f956a] transition-colors hover:bg-[#7f956a] hover:text-white"
          onClick={handleTodayClick}
        >
          今天
        </button>
      </div>

      {/* Hint */}
      <div className="mb-3 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Info size={14} />
        <span>點擊儲存格即可直接編輯打卡時間</span>
      </div>

      {/* View content */}
      {viewMode === 'table' ? (
        <RecordsTableView
          dayRows={dayRows}
          employees={filteredEmployees}
          onEditRecord={handleEditRecord}
          onAddRecord={handleAddRecord}
          todayDate={todayStr}
        />
      ) : (
        <RecordsCalendarView
          calendarGrid={calendarGrid}
          onEditRecord={handleEditRecord}
          onAddRecord={handleAddRecord}
        />
      )}

      {/* RecordModal */}
      {modalState.employee && (
        <RecordModal
          open={modalState.open}
          mode={modalState.mode}
          employee={modalState.employee}
          date={modalState.date}
          record={modalState.record}
          onCancel={handleModalCancel}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  )
}
