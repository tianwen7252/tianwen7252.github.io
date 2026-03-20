import React from 'react'
import {
  type CalendarDay,
  type EmployeeAttendanceCell,
  WEEKDAY_LABELS,
  formatClockTime,
  getCellDisplayType,
} from './recordsUtils'
import { recordsStyles as styles } from './styles/recordsStyles'

// ---- Props ----

interface RecordsCalendarViewProps {
  readonly calendarGrid: readonly (readonly CalendarDay[])[]
  readonly onCellClick: (
    employee: RestaDB.Table.Employee,
    date: string,
    attendance: RestaDB.Table.Attendance | undefined,
  ) => void
}

// ---- Helper: render a single employee card ----

function renderEmployeeCard(
  cell: EmployeeAttendanceCell,
  date: string,
  onCellClick: RecordsCalendarViewProps['onCellClick'],
): React.ReactNode {
  const displayType = getCellDisplayType(cell.attendance)

  // Wrap click to stop propagation from bubbling to parent day cell
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onCellClick(cell.employee, date, cell.attendance)
  }

  // Keyboard handler for accessibility
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onCellClick(cell.employee, date, cell.attendance)
    }
  }

  switch (displayType) {
    case 'normal':
      return (
        <div
          key={cell.employee.id}
          className={styles.employeeCardCss}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          role="button"
          tabIndex={0}
        >
          <div className={styles.employeeCardNameCss}>{cell.employee.name}</div>
          <div className={styles.employeeCardTimeCss}>
            <span>
              上{' '}
              <span className={styles.employeeCardClockInCss}>
                {formatClockTime(cell.attendance?.clockIn)}
              </span>
            </span>
            <span>
              下{' '}
              <span className={styles.employeeCardClockOutCss}>
                {formatClockTime(cell.attendance?.clockOut)}
              </span>
            </span>
          </div>
        </div>
      )

    case 'clockInOnly':
      return (
        <div
          key={cell.employee.id}
          className={styles.employeeCardCss}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          role="button"
          tabIndex={0}
        >
          <div className={styles.employeeCardNameCss}>{cell.employee.name}</div>
          <div className={styles.employeeCardTimeCss}>
            <span>
              上{' '}
              <span className={styles.employeeCardClockInCss}>
                {formatClockTime(cell.attendance?.clockIn)}
              </span>
            </span>
            <span>
              下{' '}
              <span className={styles.employeeCardClockMissingCss}>??:??</span>
            </span>
          </div>
        </div>
      )

    case 'vacation':
      return (
        <div
          key={cell.employee.id}
          className={styles.employeeCardVacationCss}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          role="button"
          tabIndex={0}
        >
          <span className={styles.employeeCardNameCss}>{cell.employee.name}</span>
          <span className={styles.employeeCardVacationLabelCss}>休假</span>
        </div>
      )

    case 'noRecord':
      return (
        <div
          key={cell.employee.id}
          className={styles.employeeCardCss}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          role="button"
          tabIndex={0}
        >
          <span className={styles.employeeCardNameCss}>{cell.employee.name}</span>
          <span className={styles.employeeCardNoRecordCss}>未打卡</span>
        </div>
      )
  }
}

// ---- Helper: render a single day cell ----

function renderDayCell(
  day: CalendarDay,
  onCellClick: RecordsCalendarViewProps['onCellClick'],
): React.ReactNode {
  // Build CSS class string based on day state
  const cellClasses = [styles.calendarDayCellCss]
  if (day.isToday) cellClasses.push(styles.calendarTodayCellCss)
  if (!day.isCurrentMonth) cellClasses.push(styles.calendarOutsideCellCss)
  if (day.isWeekend && day.isCurrentMonth) {
    cellClasses.push(styles.calendarWeekendCellCss)
  }
  const className = cellClasses.join(' ')

  // Format display date as "MM/DD"
  const displayMmDd = day.date.slice(5).replace('-', '/') // "2026-03-20" -> "03/20"

  // Weekend cell for current month — show "休"
  if (day.isWeekend && day.isCurrentMonth) {
    return (
      <div key={day.date} className={className}>
        <span className={styles.calendarDateLabelMutedCss}>{displayMmDd}</span>
        <div className={styles.calendarWeekendRestCss}>休</div>
      </div>
    )
  }

  // Regular day cell
  return (
    <div key={day.date} className={className}>
      {/* Date header */}
      {day.isToday ? (
        <div className={styles.calendarTodayHeaderCss}>
          <span className={styles.calendarDateLabelCss}>{displayMmDd}</span>
          <span className={styles.calendarTodayBadgeCss}>今日</span>
        </div>
      ) : (
        <span
          className={
            day.isCurrentMonth
              ? styles.calendarDateLabelCss
              : styles.calendarDateLabelMutedCss
          }
        >
          {displayMmDd}
        </span>
      )}

      {/* Employee cards — only for current month non-weekend days */}
      {day.isCurrentMonth && !day.isWeekend && (
        <div className={styles.calendarCardsContainerCss}>
          {day.cells.map(cell =>
            renderEmployeeCard(cell, day.date, onCellClick),
          )}
        </div>
      )}
    </div>
  )
}

// ---- Component ----

export const RecordsCalendarView: React.FC<RecordsCalendarViewProps> = ({
  calendarGrid,
  onCellClick,
}) => {
  return (
    <div className={styles.calendarWrapperCss}>
      {/* Weekday header row */}
      <div className={styles.calendarHeaderRowCss}>
        <div className={styles.calendarGridCss}>
          {WEEKDAY_LABELS.map(label => (
            <div key={label} className={styles.calendarHeaderCellCss}>
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* Calendar body grid */}
      <div className={styles.calendarBodyGridCss}>
        {calendarGrid.map(week =>
          week.map(day => renderDayCell(day, onCellClick)),
        )}
      </div>
    </div>
  )
}

export default RecordsCalendarView
