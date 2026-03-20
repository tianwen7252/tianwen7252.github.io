import React, { useState, useMemo, useCallback, useEffect } from 'react'
import { Badge, Button, message } from 'antd'
import { useLiveQuery } from 'dexie-react-hooks'
import dayjs from 'dayjs'
import * as API from 'src/libs/api'
import { AvatarImage } from 'src/components/AvatarImage'
import { calcTotalHours, formatTotalHours } from './attendanceUtils'
import { ClockInModal } from './ClockInModal'
import { styles } from './styles/clockInStyles'

// Chinese weekday labels — index matches dayjs().day() (0=Sunday)
const WEEKDAYS = [
  '星期日',
  '星期一',
  '星期二',
  '星期三',
  '星期四',
  '星期五',
  '星期六',
] as const

// Format a timestamp to HH:mm, or return placeholder when absent
function formatTime(ts?: number): string {
  return ts ? dayjs(ts).format('HH:mm') : '?? : ??'
}

// Possible actions that the modal (Phase 3) will handle
export type ClockInAction =
  | 'clockIn'
  | 'clockOut'
  | 'vacation'
  | 'cancelVacation'

export interface ModalState {
  visible: boolean
  employee: RestaDB.Table.Employee | null
  action: ClockInAction
  attendance?: RestaDB.Table.Attendance
}

// Derive the correct action from an employee's attendance records array
function deriveCardAction(
  records: readonly RestaDB.Table.Attendance[],
): ClockInAction {
  if (records.length === 0) return 'clockIn'
  const lastRecord = records[records.length - 1]
  if (lastRecord.type === 'vacation') return 'cancelVacation'
  // Last shift is complete (has both clockIn and clockOut) -> start new shift
  if (lastRecord.clockIn !== undefined && lastRecord.clockOut !== undefined)
    return 'clockIn'
  // Last shift only has clockIn -> clock out
  return 'clockOut'
}

// Badge colors matching avatar border state colors
const BADGE_COLOR_DEFAULT = '#dbe3d2'
const BADGE_COLOR_CLOCKED_IN = '#7f956a'
const BADGE_COLOR_CLOCKED_OUT = '#cab3f3'
const BADGE_COLOR_VACATION = '#f88181'

// Determine status badge configuration from attendance records array
function deriveStatus(records: readonly RestaDB.Table.Attendance[]): {
  badgeColor: string
  badgeText: string
} {
  if (records.length === 0) {
    return { badgeColor: BADGE_COLOR_DEFAULT, badgeText: '未打卡' }
  }
  const lastRecord = records[records.length - 1]
  if (lastRecord.type === 'vacation') {
    return { badgeColor: BADGE_COLOR_VACATION, badgeText: '休假' }
  }
  if (lastRecord.clockOut) {
    return { badgeColor: BADGE_COLOR_CLOCKED_OUT, badgeText: '已下班' }
  }
  return { badgeColor: BADGE_COLOR_CLOCKED_IN, badgeText: '已上班' }
}

// Choose the avatar border style class based on attendance state
function deriveAvatarBorderCss(
  records: readonly RestaDB.Table.Attendance[],
): string {
  if (records.length === 0) return styles.avatarBorderDefaultCss
  const lastRecord = records[records.length - 1]
  if (lastRecord.type === 'vacation') return styles.avatarBorderVacationCss
  if (lastRecord.clockOut) return styles.avatarBorderClockedOutCss
  return styles.avatarBorderGreenCss
}

export const ClockIn: React.FC = () => {
  const allEmployees = useLiveQuery(() => API.employees.get()) || []

  // Filter out resigned employees — client-side only so StaffAdmin still shows all
  const employees = useMemo(
    () => allEmployees.filter(e => !e.resignationDate),
    [allEmployees],
  )

  // Auto-update date at midnight for POS iPad left running overnight
  const [today, setToday] = useState(() => dayjs().format('YYYY-MM-DD'))
  useEffect(() => {
    const msUntilMidnight =
      dayjs().endOf('day').valueOf() - dayjs().valueOf() + 1000
    const timer = setTimeout(
      () => setToday(dayjs().format('YYYY-MM-DD')),
      msUntilMidnight,
    )
    return () => clearTimeout(timer)
  }, [today])

  const todayAttendances = useLiveQuery(
    () => API.attendances.getByDate(today),
    [today],
  )

  // Build an O(1) lookup map from employeeId to attendance records array (immutable reduce)
  const attendanceMap = useMemo(
    () =>
      (todayAttendances ?? []).reduce(
        (map, r) => {
          const empId = r.employeeId as number
          const existing = map[empId] ?? []
          return { ...map, [empId]: [...existing, r] }
        },
        {} as Record<number, readonly RestaDB.Table.Attendance[]>,
      ),
    [todayAttendances],
  )

  // Modal state for ClockInModal
  const [modalState, setModalState] = useState<ModalState>({
    visible: false,
    employee: null,
    action: 'clockIn',
  })
  const [loading, setLoading] = useState(false)

  // Section header date string — derive from `today` state (single source of truth)
  const todayDayjs = dayjs(today)
  const weekday = WEEKDAYS[todayDayjs.day()]
  const dateString = `今天日期: ${todayDayjs.format('YYYY年M月D日')} ${weekday}`

  // Handle card click — derive action from attendance records and open modal state
  const handleCardClick = (
    employee: RestaDB.Table.Employee,
    records: readonly RestaDB.Table.Attendance[],
  ) => {
    const action = deriveCardAction(records)
    const lastRecord =
      records.length > 0 ? records[records.length - 1] : undefined
    setModalState({
      visible: true,
      employee,
      action,
      attendance:
        action === 'clockOut' || action === 'cancelVacation'
          ? lastRecord
          : undefined,
    })
  }

  // Handle explicit action button click (stopPropagation to avoid card click)
  const handleButtonAction = (
    e: React.MouseEvent,
    employee: RestaDB.Table.Employee,
    action: ClockInAction,
    record?: RestaDB.Table.Attendance,
  ) => {
    e.stopPropagation()
    setModalState({
      visible: true,
      employee,
      action,
      attendance: record,
    })
  }

  // Close modal and reset state
  const handleModalClose = useCallback(() => {
    setModalState({
      visible: false,
      employee: null,
      action: 'clockIn',
    })
  }, [])

  // Handle confirm action from modal — dispatches the correct API call
  // Uses fresh dayjs() at click time to avoid stale date across midnight
  const handleConfirm = useCallback(async () => {
    const { employee: emp, action, attendance: record } = modalState
    if (!emp?.id) return

    setLoading(true)
    try {
      const now = dayjs()
      const currentDate = now.format('YYYY-MM-DD')

      switch (action) {
        case 'clockIn':
          await API.attendances.add({
            employeeId: emp.id,
            date: currentDate,
            clockIn: now.valueOf(),
            type: 'regular',
          })
          message.success(`${emp.name} 已打卡上班`)
          break

        case 'clockOut':
          if (record?.id != null) {
            await API.attendances.set(record.id, {
              clockOut: now.valueOf(),
            })
            message.success(`${emp.name} 已打卡下班`)
          } else {
            message.error('無法打卡下班：找不到打卡記錄')
            return
          }
          break

        case 'vacation':
          await API.attendances.add({
            employeeId: emp.id,
            date: currentDate,
            clockIn: now.valueOf(),
            type: 'vacation',
          })
          message.success(`${emp.name} 已登記休假`)
          break

        case 'cancelVacation':
          if (record?.id != null) {
            await API.attendances.delete(record.id)
            message.success(`${emp.name} 已取消休假`)
          } else {
            message.error('無法取消休假：找不到打卡記錄')
            return
          }
          break
      }
      handleModalClose()
    } catch (error) {
      message.error('操作失敗，請稍後再試')
    } finally {
      setLoading(false)
    }
  }, [modalState, handleModalClose])

  return (
    <div className={styles.containerCss}>
      {/* Section header */}
      <div className={styles.headerCss}>
        <span className={styles.headerTitleCss}>員工考勤狀況</span>
        <span className={styles.headerDateCss}>{dateString}</span>
      </div>

      {/* Card grid */}
      <div className={styles.gridCss}>
        {employees.map(employee => {
          const records = attendanceMap[employee.id!] ?? []
          const { badgeColor, badgeText } = deriveStatus(records)
          const avatarBorderCss = deriveAvatarBorderCss(records)
          const lastRecord =
            records.length > 0 ? records[records.length - 1] : undefined
          const isVacation = lastRecord?.type === 'vacation'
          const totalHours = calcTotalHours(records)
          const action = deriveCardAction(records)

          return (
            <div
              key={employee.id}
              className={`${styles.cardCss}${isVacation ? ` ${styles.cardVacationBgCss}` : ''}`}
              data-testid="employee-card"
              role="button"
              tabIndex={0}
              aria-label={`${employee.name} 打卡 — ${badgeText}`}
              onClick={() => handleCardClick(employee, records)}
              onKeyDown={e =>
                e.key === 'Enter' && handleCardClick(employee, records)
              }
            >
              {/* Avatar with colored border */}
              <div className={styles.avatarWrapCss}>
                <div className={avatarBorderCss}>
                  <AvatarImage avatar={employee.avatar} size={80} />
                </div>
              </div>

              {/* Name */}
              <div className={styles.nameCss}>{employee.name}</div>

              {/* Admin role label — always rendered for consistent card height */}
              <div className={styles.roleCss}>
                {employee.isAdmin ? '管理員' : ''}
              </div>

              {/* Status badge */}
              <div className={styles.statusCss}>
                <Badge color={badgeColor} text={badgeText} />
              </div>

              {/* Clock-in / clock-out times — vacation shows differently */}
              {/* Multi-shift: each shift as a labelled tag with #F2D680 border */}
              {isVacation ? (
                <div className={styles.timesCss}>
                  <div>休假：{formatTime(lastRecord?.clockIn)}</div>
                  <div>&nbsp;</div>
                </div>
              ) : (
                <div className={styles.timesCss}>
                  {records.map((shift, index) => (
                    <div
                      key={shift.id ?? index}
                      className={styles.shiftTimeLabelCss}
                    >
                      上班：{formatTime(shift.clockIn)} 下班：
                      {formatTime(shift.clockOut)}
                    </div>
                  ))}
                  {records.length === 0 && (
                    <>
                      <div>上班：{formatTime(undefined)}</div>
                      <div>下班：{formatTime(undefined)}</div>
                    </>
                  )}
                </div>
              )}

              {/* Total hours label — displayed above action buttons */}
              {totalHours > 0 && (
                <div className={styles.totalHoursLabelCss}>
                  總工時: {formatTotalHours(totalHours)}
                </div>
              )}

              {/* Action buttons — layout depends on attendance state */}
              <div className={styles.actionBtnRowCss}>
                {records.length === 0 && (
                  <>
                    <Button
                      type="primary"
                      size="small"
                      onClick={e =>
                        handleButtonAction(e, employee, 'clockIn', undefined)
                      }
                    >
                      打卡上班
                    </Button>
                    <Button
                      type="primary"
                      danger
                      size="small"
                      onClick={e =>
                        handleButtonAction(e, employee, 'vacation', undefined)
                      }
                    >
                      申請休假
                    </Button>
                  </>
                )}
                {records.length > 0 && !isVacation && action === 'clockOut' && (
                  <Button
                    type="primary"
                    size="small"
                    onClick={e =>
                      handleButtonAction(e, employee, 'clockOut', lastRecord)
                    }
                  >
                    打卡下班
                  </Button>
                )}
                {records.length > 0 && !isVacation && action === 'clockIn' && (
                  <Button
                    type="primary"
                    size="small"
                    onClick={e =>
                      handleButtonAction(e, employee, 'clockIn', undefined)
                    }
                  >
                    打卡上班
                  </Button>
                )}
                {isVacation && (
                  <Button
                    size="small"
                    onClick={e =>
                      handleButtonAction(
                        e,
                        employee,
                        'cancelVacation',
                        lastRecord,
                      )
                    }
                  >
                    取消休假
                  </Button>
                )}
              </div>
            </div>
          )
        })}

        {employees.length === 0 && (
          <div className={styles.emptyTextCss}>
            目前無員工資料，請前往「員工管理」頁面新增員工
          </div>
        )}
      </div>

      {/* Confirmation modal */}
      <ClockInModal
        open={modalState.visible}
        employee={modalState.employee}
        action={modalState.action}
        attendance={modalState.attendance}
        loading={loading}
        onConfirm={handleConfirm}
        onCancel={handleModalClose}
      />
    </div>
  )
}

export default ClockIn
