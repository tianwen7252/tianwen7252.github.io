import React from 'react'
import { ATTENDANCE_TYPES } from 'src/constants/defaults/attendanceTypes'
import { calcTotalHours, formatTotalHours } from './attendanceUtils'
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
  readonly onCellClick?: (date: string) => void
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

  // Check if all records are vacation
  const isAllVacation = attendances.every(
    a => a.type === ATTENDANCE_TYPES.VACATION,
  )

  if (isAllVacation) {
    const firstVacation = attendances[0]
    return (
      <div
        key={employee.id}
        className={styles.employeeCardVacationCss}
        onClick={e => {
          e.stopPropagation()
          onEditRecord(employee, date, firstVacation)
        }}
        onKeyDown={makeKeyHandler(() =>
          onEditRecord(employee, date, firstVacation),
        )}
        role="button"
        tabIndex={0}
      >
        <span className={styles.employeeCardNameCss}>{employee.name}</span>
        <span className={styles.employeeCardVacationLabelCss}>休假</span>
      </div>
    )
  }

  // Has records — render employee card with time labels (no shift numbering)
  const totalHours = calcTotalHours(attendances)

  return (
    <div
      key={employee.id}
      className={styles.employeeCardCss}
      onClick={e => { e.stopPropagation(); onAddRecord(employee, date) }}
      onKeyDown={makeKeyHandler(() => onAddRecord(employee, date))}
      role="button"
      tabIndex={0}
    >
      <div className={styles.employeeCardNameCss}>{employee.name}</div>
      <div className={styles.employeeCardShiftsCss}>
        {attendances.map((att, index) => {
          if (att.type === ATTENDANCE_TYPES.VACATION) {
            return (
              <span
                key={att.id ?? index}
                className={styles.employeeCardVacationLabelCss}
                onClick={e => {
                  e.stopPropagation()
                  onEditRecord(employee, date, att)
                }}
                onKeyDown={makeKeyHandler(() =>
                  onEditRecord(employee, date, att),
                )}
                role="button"
                tabIndex={0}
              >
                休假
              </span>
            )
          }
          return (
            <span
              key={att.id ?? index}
              className={styles.employeeCardTimeLabelCss}
              onClick={e => {
                e.stopPropagation()
                onEditRecord(employee, date, att)
              }}
              onKeyDown={makeKeyHandler(() =>
                onEditRecord(employee, date, att),
              )}
              role="button"
              tabIndex={0}
            >
              {formatClockTime(att.clockIn)} -{' '}
              {att.clockOut !== undefined
                ? formatClockTime(att.clockOut)
                : '??:??'}
            </span>
          )
        })}
      </div>
      {totalHours > 0 && (
        <div className={styles.employeeCardTotalHoursCss}>
          總工時: {formatTotalHours(totalHours)}
        </div>
      )}
    </div>
  )
}

// ---- Helper: render a single day cell ----

function renderDayCell(
  day: CalendarDay,
  onEditRecord: RecordsCalendarViewProps['onEditRecord'],
  onAddRecord: RecordsCalendarViewProps['onAddRecord'],
  onCellClick?: RecordsCalendarViewProps['onCellClick'],
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

  // Cell click handler — triggers add record for the date
  const handleCellClick = () => {
    if (day.isCurrentMonth && !day.isWeekend && onCellClick) {
      onCellClick(day.date)
    }
  }

  // Weekend cell for current month — show "休"
  if (day.isWeekend && day.isCurrentMonth) {
    return (
      <div key={day.date} className={className}>
        <span className={styles.calendarDateLabelMutedCss}>{displayMmDd}</span>
        <div className={styles.calendarWeekendRestCss}>休</div>
      </div>
    )
  }

  // Regular day cell — clicking the cell (including date) triggers add
  return (
    <div
      key={day.date}
      className={className}
      {...(day.isToday ? { 'data-today': 'true' } : {})}
      onClick={handleCellClick}
      role="button"
      tabIndex={day.isCurrentMonth ? 0 : -1}
    >
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
          week.map(day =>
            renderDayCell(day, onEditRecord, onAddRecord, onCellClick),
          ),
        )}
      </div>
    </div>
  )
}

export default RecordsCalendarView
