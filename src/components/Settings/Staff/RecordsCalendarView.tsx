import React from 'react'
import { ATTENDANCE_TYPES } from 'src/constants/defaults/attendanceTypes'
import {
  type CalendarDay,
  type EmployeeAttendanceCell,
  WEEKDAY_LABELS,
  formatClockTime,
} from './recordsUtils'
import { recordsStyles as styles } from './styles/recordsStyles'

// ---- Props ----

interface RecordsCalendarViewProps {
  readonly calendarGrid: readonly (readonly CalendarDay[])[]
  readonly onEditRecord: (
    employee: RestaDB.Table.Employee,
    date: string,
    record: RestaDB.Table.Attendance,
  ) => void
  readonly onAddRecord: (
    employee: RestaDB.Table.Employee,
    date: string,
  ) => void
}

// ---- Helper: keyboard handler factory ----

function makeKeyHandler(handler: () => void) {
  return (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handler()
    }
  }
}

// ---- Helper: render employee cards (supports multi-shift) ----

function renderEmployeeCards(
  cell: EmployeeAttendanceCell,
  date: string,
  onEditRecord: RecordsCalendarViewProps['onEditRecord'],
  onAddRecord: RecordsCalendarViewProps['onAddRecord'],
): React.ReactNode {
  const { attendances, employee } = cell

  // No records — show "未打卡", click to add
  if (attendances.length === 0) {
    return (
      <div
        key={employee.id}
        className={styles.employeeCardCss}
        onClick={e => { e.stopPropagation(); onAddRecord(employee, date) }}
        onKeyDown={makeKeyHandler(() => onAddRecord(employee, date))}
        role="button"
        tabIndex={0}
      >
        <span className={styles.employeeCardNameCss}>{employee.name}</span>
        <span className={styles.employeeCardNoRecordCss}>未打卡</span>
      </div>
    )
  }

  // Has records — render each shift as a separate clickable card
  return attendances.map((att, index) => {
    const isVacation = att.type === ATTENDANCE_TYPES.VACATION
    const handleClick = (e: React.MouseEvent) => {
      e.stopPropagation()
      onEditRecord(employee, date, att)
    }

    if (isVacation) {
      return (
        <div
          key={att.id ?? index}
          className={styles.employeeCardVacationCss}
          onClick={handleClick}
          onKeyDown={makeKeyHandler(() => onEditRecord(employee, date, att))}
          role="button"
          tabIndex={0}
        >
          <span className={styles.employeeCardNameCss}>{employee.name}</span>
          <span className={styles.employeeCardVacationLabelCss}>休假</span>
        </div>
      )
    }

    return (
      <div
        key={att.id ?? index}
        className={styles.employeeCardCss}
        onClick={handleClick}
        onKeyDown={makeKeyHandler(() => onEditRecord(employee, date, att))}
        role="button"
        tabIndex={0}
      >
        <div className={styles.employeeCardNameCss}>
          {attendances.length > 1 ? `${employee.name} (班${index + 1})` : employee.name}
        </div>
        <div className={styles.employeeCardTimeCss}>
          <span>
            上{' '}
            <span className={styles.employeeCardClockInCss}>
              {formatClockTime(att.clockIn)}
            </span>
          </span>
          <span>
            下{' '}
            <span
              className={
                att.clockOut !== undefined
                  ? styles.employeeCardClockOutCss
                  : styles.employeeCardClockMissingCss
              }
            >
              {att.clockOut !== undefined ? formatClockTime(att.clockOut) : '??:??'}
            </span>
          </span>
        </div>
      </div>
    )
  })
}

// ---- Helper: render a single day cell ----

function renderDayCell(
  day: CalendarDay,
  onEditRecord: RecordsCalendarViewProps['onEditRecord'],
  onAddRecord: RecordsCalendarViewProps['onAddRecord'],
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
            renderEmployeeCards(cell, day.date, onEditRecord, onAddRecord),
          )}
        </div>
      )}
    </div>
  )
}

// ---- Component ----

export const RecordsCalendarView: React.FC<RecordsCalendarViewProps> = ({
  calendarGrid,
  onEditRecord,
  onAddRecord,
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
          week.map(day => renderDayCell(day, onEditRecord, onAddRecord)),
        )}
      </div>
    </div>
  )
}

export default RecordsCalendarView
