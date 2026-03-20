import React, { useState, useEffect } from 'react'
import { Modal } from 'antd'
import dayjs from 'dayjs'
import { AvatarImage } from 'src/components/AvatarImage'
import { SHIFT_TYPES } from 'src/constants/defaults/shiftTypes'
import type { ClockInAction } from './ClockIn'
import {
  styles,
  GRADIENT_ROOT_MAP,
  CONFIRM_COLOR_MAP,
} from './styles/clockInModalStyles'

// Title text per action type
const TITLE_MAP: Record<ClockInAction, (name: string) => string> = {
  clockIn: name => `確認 ${name} 的上班打卡？`,
  clockOut: name => `確認 ${name} 的下班打卡？`,
  vacation: name => `確認 ${name} 的休假打卡？`,
  cancelVacation: name => `取消 ${name} 的休假？`,
}

// Confirm button label per action type
const CONFIRM_TEXT_MAP: Record<ClockInAction, string> = {
  clockIn: '確認打卡',
  clockOut: '確認下班',
  vacation: '確認休假',
  cancelVacation: '確認取消',
}

// Format time to "HH:mm AM/PM" style using English locale
// (global dayjs locale is zh-tw, which renders AM/PM as Chinese text)
function formatTimeAmPm(date: dayjs.Dayjs): string {
  return date.locale('en').format('hh:mm A')
}

interface ClockInModalProps {
  open: boolean
  employee: RestaDB.Table.Employee | null
  action: ClockInAction
  attendance?: RestaDB.Table.Attendance
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export const ClockInModal: React.FC<ClockInModalProps> = ({
  open,
  employee,
  action,
  attendance,
  loading = false,
  onConfirm,
  onCancel,
}) => {
  // Real-time clock state
  const [currentTime, setCurrentTime] = useState(() => dayjs())

  // Update time every second — only when modal is open to avoid wasting CPU
  useEffect(() => {
    if (!open) return undefined
    setCurrentTime(dayjs())
    const intervalId = setInterval(() => {
      setCurrentTime(dayjs())
    }, 1000)
    return () => clearInterval(intervalId)
  }, [open])

  // Early return if no employee
  if (!employee) {
    return null
  }

  // Derive display values from action
  const title = TITLE_MAP[action](employee.name)
  const confirmText = CONFIRM_TEXT_MAP[action]
  const gradientRootCss = GRADIENT_ROOT_MAP[action]
  const confirmColorCss = CONFIRM_COLOR_MAP[action]

  // Get shift type label with fallback to first entry
  const shiftTypeEntry = SHIFT_TYPES.find(s => s.key === employee.shiftType)
  const shiftTypeLabel = shiftTypeEntry?.label ?? SHIFT_TYPES[0].label

  // Determine whether to show re-clock-out hint
  const showReClockOutHint =
    action === 'clockOut' && attendance?.clockOut != null

  // Determine time display based on action type
  const isCancelVacation = action === 'cancelVacation'
  const isVacation = action === 'vacation'

  let timeLabel: string
  let timeValue: string

  if (isCancelVacation) {
    timeLabel = '休假打卡時間'
    timeValue =
      attendance?.clockIn != null
        ? formatTimeAmPm(dayjs(attendance.clockIn))
        : '--:--'
  } else if (isVacation) {
    timeLabel = '休假時間'
    timeValue = formatTimeAmPm(currentTime)
  } else {
    timeLabel = '目前時間'
    timeValue = formatTimeAmPm(currentTime)
  }

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      closable={false}
      width={500}
      centered
      rootClassName={gradientRootCss}
    >
      <div className={styles.modalContainerCss}>
        {/* System label */}
        <div className={styles.systemLabelCss}>系統確認</div>

        {/* Title */}
        <div className={styles.titleCss}>{title}</div>

        {/* Glass card */}
        <div className={styles.glassCardCss}>
          {/* Avatar */}
          <div className={styles.avatarModalCss}>
            <AvatarImage avatar={employee.avatar} size={120} />
          </div>

          {/* Name */}
          <div className={styles.employeeNameCss}>{employee.name}</div>

          {/* Admin role label */}
          {employee.isAdmin && (
            <div className={styles.roleLabelCss}>管理員</div>
          )}

          {/* Re-clock-out hint (above info grid) */}
          {showReClockOutHint && (
            <div className={styles.reClockOutHintCss}>
              目前下班時間: {dayjs(attendance!.clockOut).format('HH:mm')}
            </div>
          )}

          {/* Info grid */}
          <div className={styles.infoGridCss}>
            {/* Left column: time */}
            <div>
              <div className={styles.infoLabelCss}>{timeLabel}</div>
              <div className={styles.infoValueCss}>{timeValue}</div>
            </div>

            {/* Right column: shift type */}
            <div>
              <div className={styles.infoLabelCss}>班別類型</div>
              <div className={styles.infoValueCss}>{shiftTypeLabel}</div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className={styles.buttonRowCss}>
          <button
            type="button"
            className={styles.cancelBtnCss}
            onClick={onCancel}
          >
            取消
          </button>
          <button
            type="button"
            className={`${styles.confirmBtnBaseCss} ${confirmColorCss}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default ClockInModal
