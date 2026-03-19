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
  return ts ? dayjs(ts).format('HH:mm') : '--:--'
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

// Determine status badge configuration from attendance record
function deriveStatus(record: RestaDB.Table.Attendance | undefined): {
  badgeStatus: 'default' | 'processing' | 'success' | 'error'
  badgeText: string
} {
  if (!record) {
    return { badgeStatus: 'default', badgeText: '未打卡' }
  }
  if (record.type === 'vacation') {
    return { badgeStatus: 'error', badgeText: '休假' }
  }
  if (record.clockOut) {
    return { badgeStatus: 'success', badgeText: '已下班' }
  }
  return { badgeStatus: 'processing', badgeText: '已上班' }
}

// Choose the avatar border style class based on attendance state
function deriveAvatarBorderCss(
  record: RestaDB.Table.Attendance | undefined,
): string {
  if (!record) return styles.avatarBorderGreenCss
  if (record.type === 'vacation') return styles.avatarBorderRedCss
  if (record.clockOut) return styles.avatarBorderOrangeCss
  return styles.avatarBorderGreenCss
}

export const ClockIn: React.FC = () => {
  const employees = useLiveQuery(() => API.employees.get()) || []

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

  // Section header date string
  const weekday = WEEKDAYS[dayjs().day()]
  const dateString = `今天日期: ${dayjs().format('YYYY年M月D日')} ${weekday}`

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

  // Handle vacation button click
  const handleVacationClick = (
    e: React.MouseEvent,
    employee: RestaDB.Table.Employee,
  ) => {
    // Prevent the card click from also firing
    e.stopPropagation()
    setModalState({
      visible: true,
      employee,
      action: 'vacation',
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
  const handleConfirm = useCallback(async () => {
    const { employee: emp, action, attendance: record } = modalState
    if (!emp?.id) return

    setLoading(true)
    try {
      switch (action) {
        case 'clockIn':
          await API.attendances.add({
            employeeId: emp.id,
            date: today,
            clockIn: dayjs().valueOf(),
            type: 'regular',
          })
          message.success(`${emp.name} 已打卡上班`)
          break

        case 'clockOut':
          if (record?.id != null) {
            await API.attendances.set(record.id, {
              clockOut: dayjs().valueOf(),
            })
            message.success(`${emp.name} 已打卡下班`)
          }
          break

        case 'vacation':
          await API.attendances.add({
            employeeId: emp.id,
            date: today,
            clockIn: dayjs().valueOf(),
            type: 'vacation',
          })
          message.success(`${emp.name} 已登記休假`)
          break

        case 'cancelVacation':
          if (record?.id != null) {
            await API.attendances.delete(record.id)
            message.success(`${emp.name} 已取消休假`)
          }
          break
      }
      handleModalClose()
    } catch (error) {
      message.error('操作失敗，請稍後再試')
    } finally {
      setLoading(false)
    }
  }, [modalState, today, handleModalClose])

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
          const { badgeStatus, badgeText } = deriveStatus(record)
          const avatarBorderCss = deriveAvatarBorderCss(record)
          const showVacationBtn = !record

          return (
            <div
              key={employee.id}
              className={styles.cardCss}
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

              {/* Admin role label — only for admins */}
              {employee.isAdmin && (
                <div className={styles.roleCss}>管理員</div>
              )}

              {/* Status badge */}
              <div className={styles.statusCss}>
                <Badge status={badgeStatus} text={badgeText} />
              </div>

              {/* Clock-in / clock-out times */}
              <div className={styles.timesCss}>
                <div>
                  上班：{formatTime(record?.clockIn)}
                </div>
                <div>
                  下班：{formatTime(record?.clockOut)}
                </div>
              </div>

              {/* Vacation button — only when no attendance record exists */}
              {showVacationBtn && (
                <div className={styles.vacationBtnCss}>
                  <Button
                    danger
                    onClick={e => handleVacationClick(e, employee)}
                  >
                    休假
                  </Button>
                </div>
              )}
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
