/**
 * ClockInModal — confirmation modal for clock-in/out/vacation actions.
 * Ported from V1 ClockInModal with V2 ConfirmModal, ModalCard, AvatarImage.
 */

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import dayjs from 'dayjs'
import { ConfirmModal, ModalCard } from '@/components/modal'
import { AvatarImage } from '@/components/avatar-image'
import { SHIFT_TYPES } from '@/constants/shift-types'
import type { Employee, Attendance } from '@/lib/schemas'
import type {
  GradientVariant,
  ShineColorPreset,
} from '@/components/modal/modal.types'

// ─── Types ──────────────────────────────────────────────────────────────────

export type ClockInAction =
  | 'clockIn'
  | 'clockOut'
  | 'vacation'
  | 'cancelVacation'

export interface ClockInModalProps {
  readonly open: boolean
  readonly employee: Employee | null
  readonly action: ClockInAction
  readonly attendance?: Attendance
  readonly loading?: boolean
  readonly onConfirm: () => void
  readonly onCancel: () => void
}

// ─── Action Configuration Maps ──────────────────────────────────────────────

// Translation key mapping for modal title (with {{name}} interpolation)
const TITLE_KEY_MAP: Record<ClockInAction, string> = {
  clockIn: 'clockIn.confirmClockIn',
  clockOut: 'clockIn.confirmClockOut',
  vacation: 'clockIn.confirmVacation',
  cancelVacation: 'clockIn.confirmCancelVacation',
}

// Translation key mapping for confirm button text
const CONFIRM_TEXT_KEY_MAP: Record<ClockInAction, string> = {
  clockIn: 'clockIn.confirmClockInBtn',
  clockOut: 'clockIn.confirmClockOutBtn',
  vacation: 'clockIn.confirmVacationBtn',
  cancelVacation: 'clockIn.confirmCancelVacationBtn',
}

const VARIANT_MAP: Record<ClockInAction, GradientVariant> = {
  clockIn: 'green',
  clockOut: 'warm',
  vacation: 'red',
  cancelVacation: 'red',
}

const SHINE_MAP: Record<ClockInAction, ShineColorPreset> = {
  clockIn: 'green',
  clockOut: 'purple',
  vacation: 'red',
  cancelVacation: 'red',
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Format time to "HH:mm AM/PM" using English locale.
 * Global dayjs locale may be zh-tw, so force English for AM/PM text.
 */
function formatTimeAmPm(date: dayjs.Dayjs): string {
  return date.locale('en').format('hh:mm A')
}

// ─── Component ──────────────────────────────────────────────────────────────

export function ClockInModal({
  open,
  employee,
  action,
  attendance,
  loading = false,
  onConfirm,
  onCancel,
}: ClockInModalProps) {
  const { t } = useTranslation()
  // Real-time clock — updates every second when modal is open
  const [currentTime, setCurrentTime] = useState(() => dayjs())

  useEffect(() => {
    if (!open) return undefined
    const intervalId = setInterval(() => {
      setCurrentTime(dayjs())
    }, 1000)
    return () => clearInterval(intervalId)
  }, [open])

  // Early return when no employee
  if (!employee) {
    return null
  }

  // Derive display values from action
  const title = t(TITLE_KEY_MAP[action], { name: employee.name })
  const confirmText = t(CONFIRM_TEXT_KEY_MAP[action])
  const variant = VARIANT_MAP[action]
  const shine = SHINE_MAP[action]

  // Shift type label with fallback
  const shiftTypeEntry = SHIFT_TYPES.find(s => s.key === employee.shiftType)
  const shiftTypeLabel = shiftTypeEntry?.label ?? SHIFT_TYPES[0].label

  // Re-clock-out hint
  const showReClockOutHint =
    action === 'clockOut' && attendance?.clockOut != null
  const clockOutTime = attendance?.clockOut
    ? dayjs(attendance.clockOut).format('HH:mm')
    : ''

  // Time display logic based on action
  const isCancelVacation = action === 'cancelVacation'
  const isVacation = action === 'vacation'

  let timeLabel: string
  let timeValue: string

  if (isCancelVacation) {
    timeLabel = t('clockIn.vacationClockTime')
    timeValue =
      attendance?.clockIn != null
        ? formatTimeAmPm(dayjs(attendance.clockIn))
        : '?? : ??'
  } else if (isVacation) {
    timeLabel = t('clockIn.vacationTime')
    timeValue = formatTimeAmPm(currentTime)
  } else {
    timeLabel = t('clockIn.currentTime')
    timeValue = formatTimeAmPm(currentTime)
  }

  return (
    <ConfirmModal
      open={open}
      title={title}
      variant={variant}
      shineColor={shine}
      confirmText={confirmText}
      loading={loading}
      onConfirm={onConfirm}
      onCancel={onCancel}
    >
      <ModalCard>
        <AvatarImage avatar={employee.avatar} size={120} />

        <div className="mt-3 text-xl font-bold" style={{ color: '#1a202c' }}>
          {employee.name}
        </div>

        {employee.isAdmin && (
          <div
            className="mt-1 text-sm font-medium"
            style={{ color: '#7f956a' }}
          >
            {t('staff.admin')}
          </div>
        )}

        {showReClockOutHint && (
          <div className="mt-2 text-sm" style={{ color: '#e53e3e' }}>
            {t('clockIn.reClockOutHint', { time: clockOutTime })}
          </div>
        )}

        <div className="mt-4 grid grid-cols-2 gap-6 text-center">
          <div>
            <div className="text-sm" style={{ color: '#718096' }}>
              {timeLabel}
            </div>
            <div className="text-lg font-semibold" style={{ color: '#1a202c' }}>
              {timeValue}
            </div>
          </div>
          <div>
            <div className="text-sm" style={{ color: '#718096' }}>
              {t('clockIn.shiftTypeLabel')}
            </div>
            <div className="text-lg font-semibold" style={{ color: '#1a202c' }}>
              {shiftTypeLabel}
            </div>
          </div>
        </div>
      </ModalCard>
    </ConfirmModal>
  )
}
