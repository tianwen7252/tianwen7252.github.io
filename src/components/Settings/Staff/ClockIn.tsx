import React, { useState, useMemo, useCallback, useEffect } from 'react'
import { Badge, Button, message } from 'antd'
import { useLiveQuery } from 'dexie-react-hooks'
import dayjs from 'dayjs'
import * as API from 'src/libs/api'
import { AvatarImage } from 'src/components/AvatarImage'
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

// Derive the correct action from an employee's current attendance record
function deriveCardAction(
  record: RestaDB.Table.Attendance | undefined,
): ClockInAction {
  if (!record) return 'clockIn'
  if (record.type === 'vacation') return 'cancelVacation'
  // Has clockIn (may or may not have clockOut) -> clock out / re-clock-out
  return 'clockOut'
}

// Badge colors matching avatar border state colors
const BADGE_COLOR_DEFAULT = '#dbe3d2'
const BADGE_COLOR_CLOCKED_IN = '#7f956a'
const BADGE_COLOR_CLOCKED_OUT = '#cab3f3'
const BADGE_COLOR_VACATION = '#f88181'

// Determine status badge configuration from attendance record
function deriveStatus(record: RestaDB.Table.Attendance | undefined): {
  badgeColor: string
  badgeText: string
} {
  if (!record) {
    return { badgeColor: BADGE_COLOR_DEFAULT, badgeText: '未打卡' }
  }
  if (record.type === 'vacation') {
    return { badgeColor: BADGE_COLOR_VACATION, badgeText: '休假' }
  }
  if (record.clockOut) {
    return { badgeColor: BADGE_COLOR_CLOCKED_OUT, badgeText: '已下班' }
  }
  return { badgeColor: BADGE_COLOR_CLOCKED_IN, badgeText: '已上班' }
}

// Choose the avatar border style class based on attendance state
function deriveAvatarBorderCss(
  record: RestaDB.Table.Attendance | undefined,
): string {
  if (!record) return styles.avatarBorderDefaultCss
  if (record.type === 'vacation') return styles.avatarBorderVacationCss
  if (record.clockOut) return styles.avatarBorderClockedOutCss
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

  // Build an O(1) lookup map from employeeId to attendance record (immutable reduce)
  const attendanceMap = useMemo(
    () =>
      (todayAttendances ?? []).reduce(
        (map, r) => ({ ...map, [r.employeeId as number]: r }),
        {} as Record<number, RestaDB.Table.Attendance>,
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

  // Handle card click — derive action from attendance and open modal state
  const handleCardClick = (
    employee: RestaDB.Table.Employee,
    record: RestaDB.Table.Attendance | undefined,
  ) => {
    const action = deriveCardAction(record)
    setModalState({
      visible: true,
      employee,
      action,
      attendance: record,
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
          const record = attendanceMap[employee.id!]
          const { badgeColor, badgeText } = deriveStatus(record)
          const avatarBorderCss = deriveAvatarBorderCss(record)
          const isVacation = record?.type === 'vacation'

          return (
            <div
              key={employee.id}
              className={`${styles.cardCss}${isVacation ? ` ${styles.cardVacationBgCss}` : ''}`}
              data-testid="employee-card"
              role="button"
              tabIndex={0}
              aria-label={`${employee.name} 打卡 — ${badgeText}`}
              onClick={() => handleCardClick(employee, record)}
              onKeyDown={e =>
                e.key === 'Enter' && handleCardClick(employee, record)
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
              {/* Always render two lines to keep consistent card height */}
              {record?.type === 'vacation' ? (
                <div className={styles.timesCss}>
                  <div>休假：{formatTime(record?.clockIn)}</div>
                  <div>&nbsp;</div>
                </div>
              ) : (
                <div className={styles.timesCss}>
                  <div>上班：{formatTime(record?.clockIn)}</div>
                  <div>下班：{formatTime(record?.clockOut)}</div>
                </div>
              )}

              {/* Action buttons — layout depends on attendance state */}
              <div className={styles.actionBtnRowCss}>
                {!record && (
                  <>
                    <Button
                      type="primary"
                      size="small"
                      onClick={e =>
                        handleButtonAction(e, employee, 'clockIn', record)
                      }
                    >
                      打卡上班
                    </Button>
                    <Button
                      danger
                      size="small"
                      onClick={e =>
                        handleButtonAction(e, employee, 'vacation', record)
                      }
                    >
                      申請休假
                    </Button>
                  </>
                )}
                {record && record.type !== 'vacation' && (
                  <Button
                    type="primary"
                    size="small"
                    onClick={e =>
                      handleButtonAction(e, employee, 'clockOut', record)
                    }
                  >
                    打卡下班
                  </Button>
                )}
                {record?.type === 'vacation' && (
                  <Button
                    size="small"
                    onClick={e =>
                      handleButtonAction(
                        e,
                        employee,
                        'cancelVacation',
                        record,
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
