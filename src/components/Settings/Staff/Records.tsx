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
import { EditRecordModal } from './EditRecordModal'
import { AddRecordModal } from './AddRecordModal'
import { recordsStyles as styles } from './styles/recordsStyles'

// Immutable type for edit target state
interface EditTarget {
  readonly employee: RestaDB.Table.Employee
  readonly date: string
  readonly attendance: RestaDB.Table.Attendance | undefined
}

export const Records: React.FC = () => {
  // View state
  const [viewMode, setViewMode] = useState<'table' | 'calendar'>('table')
  const [selectedYear, setSelectedYear] = useState(() => dayjs().year())
  const [selectedMonth, setSelectedMonth] = useState(() => dayjs().month() + 1)
  const [searchQuery, setSearchQuery] = useState('')

  // Modal state
  const [editTarget, setEditTarget] = useState<EditTarget | null>(null)
  const [addModalOpen, setAddModalOpen] = useState(false)

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

  // Options for selects
  const yearOptions = useMemo(() => getYearOptions(dayjs().year()), [])
  const monthOptions = useMemo(() => getMonthOptions(), [])

  // Cell click handler — opens EditRecordModal or AddRecordModal
  const handleCellClick = (
    employee: RestaDB.Table.Employee,
    date: string,
    attendance: RestaDB.Table.Attendance | undefined,
  ) => {
    setEditTarget({ employee, date, attendance })
  }

  // Close all modals
  const handleModalClose = () => {
    setEditTarget(null)
    setAddModalOpen(false)
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

  // Determine which modal to show
  const showEditModal =
    editTarget !== null && editTarget.attendance !== undefined
  const showAddModal =
    addModalOpen ||
    (editTarget !== null && editTarget.attendance === undefined)

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
      </div>

      {/* View content */}
      {viewMode === 'table' ? (
        <RecordsTableView
          dayRows={dayRows}
          employees={filteredEmployees}
          onCellClick={handleCellClick}
        />
      ) : (
        <RecordsCalendarView
          calendarGrid={calendarGrid}
          onCellClick={handleCellClick}
        />
      )}

      {/* Bottom hint */}
      <div className={styles.hintCss}>
        <InfoCircleOutlined />
        <span>點擊儲存格即可直接編輯打卡時間</span>
      </div>

      {/* Edit modal — existing record */}
      {showEditModal && editTarget?.attendance && (
        <EditRecordModal
          record={editTarget.attendance}
          empName={editTarget.employee.name}
          onCancel={handleModalClose}
          onSuccess={handleModalClose}
        />
      )}

      {/* Add modal — empty cell click or add button */}
      <AddRecordModal
        open={showAddModal}
        onCancel={handleModalClose}
        onSuccess={handleModalClose}
        employees={activeEmployees}
        defaultDate={editTarget?.date ?? dayjs().format('YYYY-MM-DD')}
        defaultEmployeeId={
          typeof editTarget?.employee?.id === 'number'
            ? editTarget.employee.id
            : undefined
        }
      />
    </div>
  )
}

export default Records
