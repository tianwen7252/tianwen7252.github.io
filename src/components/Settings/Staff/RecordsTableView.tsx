import React from 'react'
import { AvatarImage } from 'src/components/AvatarImage'
import { ATTENDANCE_TYPES } from 'src/constants/defaults/attendanceTypes'
import {
  type DayRow,
  type EmployeeAttendanceCell,
  formatClockTime,
} from './recordsUtils'
import { recordsStyles as styles } from './styles/recordsStyles'

// ---- Props ----

interface RecordsTableViewProps {
  readonly dayRows: readonly DayRow[]
  readonly employees: readonly RestaDB.Table.Employee[]
  readonly onEditRecord: (
    employee: RestaDB.Table.Employee,
    date: string,
    record: RestaDB.Table.Attendance,
  ) => void
  readonly onAddRecord: (
    employee: RestaDB.Table.Employee,
    date: string,
  ) => void
  readonly todayDate?: string
}

// ---- Helper: render attendance cards inside a cell ----

function renderCellCards(
  cell: EmployeeAttendanceCell,
  date: string,
  onEditRecord: RecordsTableViewProps['onEditRecord'],
): React.ReactNode {
  const { attendances, employee } = cell

  if (attendances.length === 0) {
    return <span className={styles.cellNoRecordCss}>未打卡</span>
  }

  return attendances.map((att, index) => {
    const isVacation = att.type === ATTENDANCE_TYPES.VACATION

    const handleCardClick = (e: React.MouseEvent) => {
      e.stopPropagation()
      onEditRecord(employee, date, att)
    }

    const handleCardKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        e.stopPropagation()
        onEditRecord(employee, date, att)
      }
    }

    if (isVacation) {
      return (
        <div
          key={att.id ?? index}
          className={styles.cellCardVacationCss}
          onClick={handleCardClick}
          onKeyDown={handleCardKeyDown}
          role="button"
          tabIndex={0}
        >
          休假
        </div>
      )
    }

    return (
      <div
        key={att.id ?? index}
        className={styles.cellCardCss}
        onClick={handleCardClick}
        onKeyDown={handleCardKeyDown}
        role="button"
        tabIndex={0}
      >
        {formatClockTime(att.clockIn)} -{' '}
        {att.clockOut !== undefined ? formatClockTime(att.clockOut) : '??:??'}
      </div>
    )
  })
}

// ---- Component ----

export const RecordsTableView: React.FC<RecordsTableViewProps> = ({
  dayRows,
  employees,
  onEditRecord,
  onAddRecord,
  todayDate,
}) => {
  return (
    <div className={styles.tableWrapperCss}>
      <table className={styles.tableCss}>
        <thead>
          <tr className={styles.tableHeadRowCss}>
            <th className={styles.tableDateHeadCellCss}>日期</th>
            {employees.map(emp => (
              <th key={emp.id} className={styles.tableHeadCellCss}>
                <div className={styles.employeeHeaderCss}>
                  <AvatarImage avatar={emp.avatar} size={32} />
                  <span>{emp.name}</span>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dayRows.map(row => {
            if (row.isWeekend) {
              return (
                <tr key={row.date} className={styles.tableWeekendRowCss}>
                  <td className={styles.tableWeekendDateCellCss}>
                    {row.displayDate}
                  </td>
                  <td
                    colSpan={employees.length}
                    className={styles.tableWeekendContentCss}
                  >
                    休
                  </td>
                </tr>
              )
            }

            return (
              <tr
                key={row.date}
                className={styles.tableRowCss}
                {...(row.date === todayDate
                  ? { 'data-today': 'true' }
                  : {})}
              >
                <td className={styles.tableDateCellCss}>
                  {row.displayDate}
                </td>
                {row.cells.map(cell => (
                  <td
                    key={cell.employee.id}
                    className={styles.tableBodyCellCss}
                    onClick={() => onAddRecord(cell.employee, row.date)}
                    role="button"
                    tabIndex={0}
                    aria-label={`${cell.employee.name} ${row.displayDate} 新增`}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        onAddRecord(cell.employee, row.date)
                      }
                    }}
                  >
                    {renderCellCards(cell, row.date, onEditRecord)}
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default RecordsTableView
