import React, { useState, useMemo } from 'react'
import { Input, Select, Spin } from 'antd'
import {
  InfoCircleOutlined,
  TableOutlined,
  CalendarOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import { useLiveQuery } from 'dexie-react-hooks'
import * as API from 'src/libs/api'
import {
  buildDayRows,
  buildCalendarGrid,
  filterEmployeesByName,
  getYearOptions,
  getMonthOptions,
} from './recordsUtils'
import { RecordsTableView } from './RecordsTableView'
import { RecordsCalendarView } from './RecordsCalendarView'
import { RecordModal } from './RecordModal'
import { recordsStyles as styles } from './styles/recordsStyles'

// Immutable type for modal target state
interface ModalTarget {
  readonly mode: 'add' | 'edit'
  readonly employee: RestaDB.Table.Employee
  readonly date: string
  readonly record?: RestaDB.Table.Attendance
  readonly shiftNumber?: number
}

export const Records: React.FC = () => {
  // View state
  const [viewMode, setViewMode] = useState<'table' | 'calendar'>('table')
  const [selectedYear, setSelectedYear] = useState(() => dayjs().year())
  const [selectedMonth, setSelectedMonth] = useState(() => dayjs().month() + 1)
  const [searchQuery, setSearchQuery] = useState('')

  // Modal state (unified for add/edit)
  const [modalTarget, setModalTarget] = useState<ModalTarget | null>(null)

  // Data fetching via Dexie live queries
  const yearMonthStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`
  const allAttendances = useLiveQuery(
    () => API.attendances.getByMonth(yearMonthStr),
    [yearMonthStr],
  )
  const allEmployees = useLiveQuery(() => API.employees.get())

  // Filter active employees (exclude resigned), then apply search
  const activeEmployees = useMemo(
    () => (allEmployees ?? []).filter(e => !e.resignationDate),
    [allEmployees],
  )
  const filteredEmployees = useMemo(
    () => filterEmployeesByName(activeEmployees, searchQuery),
    [activeEmployees, searchQuery],
  )

  // Build view data
  const todayStr = dayjs().format('YYYY-MM-DD')
  const dayRows = useMemo(
    () =>
      buildDayRows(
        selectedYear,
        selectedMonth,
        filteredEmployees,
        allAttendances ?? [],
        todayStr,
      ),
    [selectedYear, selectedMonth, filteredEmployees, allAttendances, todayStr],
  )
  const calendarGrid = useMemo(
    () =>
      buildCalendarGrid(
        selectedYear,
        selectedMonth,
        filteredEmployees,
        allAttendances ?? [],
        todayStr,
      ),
    [selectedYear, selectedMonth, filteredEmployees, allAttendances, todayStr],
  )

  // Options for selects (with future month filtering)
  const yearOptions = useMemo(() => getYearOptions(dayjs().year()), [])
  const monthOptions = useMemo(
    () => getMonthOptions(selectedYear, dayjs().year(), dayjs().month() + 1),
    [selectedYear],
  )

  // Edit record handler — card click in table view
  const handleEditRecord = (
    employee: RestaDB.Table.Employee,
    date: string,
    record: RestaDB.Table.Attendance,
  ) => {
    // Calculate shift number from all attendances for this employee+date
    const key = `${employee.id}-${date}`
    const allShifts = (allAttendances ?? []).filter(
      a => `${a.employeeId}-${a.date}` === key,
    )
    const shiftIndex = allShifts.findIndex(a => a.id === record.id)
    setModalTarget({
      mode: 'edit',
      employee,
      date,
      record,
      shiftNumber: shiftIndex >= 0 ? shiftIndex + 1 : undefined,
    })
  }

  // Add record handler — empty area click in table view
  const handleAddRecord = (
    employee: RestaDB.Table.Employee,
    date: string,
  ) => {
    setModalTarget({
      mode: 'add',
      employee,
      date,
    })
  }

  // Close modal
  const handleModalClose = () => {
    setModalTarget(null)
  }

  // Scroll to today row
  const handleScrollToToday = () => {
    const now = dayjs()
    setSelectedYear(now.year())
    setSelectedMonth(now.month() + 1)
    // Scroll after state update
    setTimeout(() => {
      const todayRow = document.querySelector('[data-today="true"]')
      todayRow?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 100)
  }

  // Loading state — show spinner while data is fetching
  if (allAttendances === undefined || allEmployees === undefined) {
    return (
      <div
        className={styles.containerCss}
        style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}
      >
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div className={styles.containerCss}>
      {/* Header: title + view toggle */}
      <div className={styles.headerCss}>
        <span className={styles.titleCss}>員工考勤狀況</span>
        <div className={styles.toggleGroupCss}>
          <button
            type="button"
            className={
              viewMode === 'table'
                ? styles.toggleBtnActiveCss
                : styles.toggleBtnCss
            }
            onClick={() => setViewMode('table')}
          >
            <TableOutlined />
            表格
          </button>
          <button
            type="button"
            className={
              viewMode === 'calendar'
                ? styles.toggleBtnActiveCss
                : styles.toggleBtnCss
            }
            onClick={() => setViewMode('calendar')}
          >
            <CalendarOutlined />
            月曆
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div className={styles.filterBarCss}>
        <Input
          placeholder="搜尋員工姓名"
          allowClear
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          prefix={<span style={{ color: '#94a3b8' }}>&#x1F50D;</span>}
          className={styles.searchInputCss}
        />
        <Select
          value={selectedYear}
          options={yearOptions as { value: number; label: string }[]}
          onChange={setSelectedYear}
          className={styles.selectCss}
        />
        <Select
          value={selectedMonth}
          options={monthOptions as { value: number; label: string }[]}
          onChange={setSelectedMonth}
          className={styles.selectCss}
        />
        <button
          type="button"
          className={styles.todayBtnCss}
          onClick={handleScrollToToday}
        >
          今天
        </button>
      </div>

      {/* Hint text above the view */}
      <div className={styles.hintCss}>
        <InfoCircleOutlined />
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

      {/* Record modal (unified add/edit) */}
      <RecordModal
        open={modalTarget !== null}
        mode={modalTarget?.mode ?? 'add'}
        employee={modalTarget?.employee ?? null}
        date={modalTarget?.date ?? dayjs().format('YYYY-MM-DD')}
        record={modalTarget?.record}
        shiftNumber={modalTarget?.shiftNumber}
        onCancel={handleModalClose}
        onSuccess={handleModalClose}
      />
    </div>
  )
}

export default Records
