import React from 'react'
import { AvatarImage } from 'src/components/AvatarImage'
import {
  type CellDisplayType,
  type DayRow,
  formatClockTime,
  getCellDisplayType,
} from './recordsUtils'
import { recordsStyles as styles } from './styles/recordsStyles'

// ---- Props ----

interface RecordsTableViewProps {
  readonly dayRows: readonly DayRow[]
  readonly employees: readonly RestaDB.Table.Employee[]
  readonly onCellClick: (
    employee: RestaDB.Table.Employee,
    date: string,
    attendance: RestaDB.Table.Attendance | undefined,
  ) => void
}

// ---- Helper: render cell content based on display type ----

function renderCellContent(
  displayType: CellDisplayType,
  attendance: RestaDB.Table.Attendance | undefined,
): React.ReactNode {
  switch (displayType) {
    case 'normal':
      return (
        <span className={styles.cellTimeCss}>
          {formatClockTime(attendance?.clockIn)} -{' '}
          {formatClockTime(attendance?.clockOut)}
        </span>
      )
    case 'clockInOnly':
      return (
        <span className={styles.cellTimeCss}>
          {formatClockTime(attendance?.clockIn)} - ??:??
        </span>
      )
    case 'vacation':
      return <span className={styles.cellVacationCss}>休假</span>
    case 'noRecord':
      return <span className={styles.cellNoRecordCss}>未打卡</span>
  }
}

// ---- Component ----

export const RecordsTableView: React.FC<RecordsTableViewProps> = ({
  dayRows,
  employees,
  onCellClick,
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
                    非工作日
                  </td>
                </tr>
              )
            }

            return (
              <tr key={row.date} className={styles.tableRowCss}>
                <td className={styles.tableDateCellCss}>
                  {row.displayDate}
                </td>
                {row.cells.map(cell => {
                  const displayType = getCellDisplayType(cell.attendance)
                  return (
                    <td
                      key={cell.employee.id}
                      className={styles.tableBodyCellCss}
                      onClick={() =>
                        onCellClick(cell.employee, row.date, cell.attendance)
                      }
                    >
                      <div className={styles.cellClickableCss}>
                        {renderCellContent(displayType, cell.attendance)}
                      </div>
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default RecordsTableView
