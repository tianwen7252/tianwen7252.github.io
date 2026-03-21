/**
 * RecordModal - Modal for adding/editing attendance records.
 * Supports regular and vacation attendance types with time inputs.
 * Uses React Hook Form + Zod for form validation.
 */

import { useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import dayjs from 'dayjs'
import { toast } from 'sonner'
import { Modal, ModalCard } from '@/components/modal'
import { AvatarImage } from '@/components/avatar-image'
import { ATTENDANCE_TYPES } from '@/constants/attendance-types'
import { buildTimestamp } from '@/lib/attendance-utils'
import { recordFormSchema } from '@/lib/form-schemas'
import { api } from '@/api'
import { cn } from '@/lib/cn'
import type { Employee, Attendance } from '@/lib/schemas'
import type { RecordFormValues } from '@/lib/form-schemas'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface RecordModalProps {
  readonly open: boolean
  readonly mode: 'add' | 'edit'
  readonly employee: Employee
  readonly date: string
  readonly record?: Attendance
  readonly shiftNumber?: number
  readonly onCancel: () => void
  readonly onSuccess: () => void
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Convert a Unix timestamp (ms) to "HH:mm" string. */
function timestampToTimeString(ts: number | undefined): string {
  if (ts === undefined || ts === 0) return ''
  return dayjs(ts).format('HH:mm')
}

/** Determine initial attendance type from a record. */
function resolveAttendanceType(
  record: Attendance | undefined,
): 'regular' | 'vacation' {
  if (record === undefined) return 'regular'
  return record.type === 'regular' ? 'regular' : 'vacation'
}

/** Convert "HH:mm" string to a dayjs on the given date. */
function timeStringToDayjs(
  dateStr: string,
  timeStr: string,
): dayjs.Dayjs | null {
  if (!timeStr) return null
  const parts = timeStr.split(':').map(Number)
  const hours = parts[0] ?? 0
  const minutes = parts[1] ?? 0
  return dayjs(dateStr).hour(hours).minute(minutes).second(0)
}

/** Build form default values from a record. */
function buildFormValues(record: Attendance | undefined): RecordFormValues {
  return {
    attendanceType: resolveAttendanceType(record),
    clockInTime: timestampToTimeString(record?.clockIn),
    clockOutTime: timestampToTimeString(record?.clockOut),
  }
}

// ─── Component ──────────────────────────────────────────────────────────────

export function RecordModal({
  open,
  mode,
  employee,
  date,
  record,
  shiftNumber,
  onCancel,
  onSuccess,
}: RecordModalProps) {
  const form = useForm<RecordFormValues>({
    resolver: zodResolver(recordFormSchema),
    defaultValues: buildFormValues(record),
  })

  const { watch, setValue, formState: { errors }, setError, clearErrors } = form

  const attendanceType = watch('attendanceType')
  const clockInTime = watch('clockInTime') ?? ''
  const clockOutTime = watch('clockOutTime') ?? ''

  const isVacation = attendanceType === ATTENDANCE_TYPES.VACATION

  // Re-initialize form when modal opens or record changes
  // Using the "derive state from props" pattern to avoid stale closures
  const prevOpenRef = { current: open }
  const prevRecordRef = { current: record }

  if (open !== prevOpenRef.current || record !== prevRecordRef.current) {
    prevOpenRef.current = open
    prevRecordRef.current = record
    if (open) {
      form.reset(buildFormValues(record))
    }
  }

  const handleTypeChange = useCallback(
    (type: 'regular' | 'vacation') => {
      setValue('attendanceType', type)
      clearErrors()
      if (type === ATTENDANCE_TYPES.VACATION) {
        setValue('clockOutTime', '')
      }
    },
    [setValue, clearErrors],
  )

  const handleSave = useCallback(() => {
    // Manual cross-field validation for clockOut > clockIn
    if (!isVacation && clockInTime && clockOutTime) {
      const clockInDayjs = timeStringToDayjs(date, clockInTime)
      const clockOutDayjs = timeStringToDayjs(date, clockOutTime)
      if (
        clockInDayjs &&
        clockOutDayjs &&
        clockOutDayjs.isBefore(clockInDayjs)
      ) {
        setError('clockOutTime', {
          type: 'manual',
          message: '下班時間必須晚於上班時間',
        })
        return
      }
    }

    const clockInTs = buildTimestamp(date, timeStringToDayjs(date, clockInTime))
    const clockOutTs = isVacation
      ? undefined
      : buildTimestamp(date, timeStringToDayjs(date, clockOutTime))
    const dbType = isVacation ? 'paid_leave' : 'regular'

    if (mode === 'add') {
      api.attendances.add({
        employeeId: employee.id,
        date,
        clockIn: clockInTs,
        clockOut: clockOutTs,
        type: dbType,
      })
      toast.success('出勤記錄已新增')
    } else if (record) {
      api.attendances.update(record.id, {
        clockIn: clockInTs,
        clockOut: clockOutTs,
        type: dbType,
      })
      toast.success('出勤記錄已更新')
    }

    onSuccess()
  }, [
    isVacation,
    clockInTime,
    clockOutTime,
    date,
    mode,
    employee.id,
    record,
    onSuccess,
    setError,
  ])

  const handleDelete = useCallback(() => {
    if (record) {
      api.attendances.remove(record.id)
      toast.success('出勤記錄已刪除')
    }
    onSuccess()
  }, [record, onSuccess])

  const title = mode === 'add' ? '新增打卡紀錄' : '編輯打卡紀錄'
  const gradientVariant = mode === 'add' ? 'green' : 'warm'
  const shineVariant = mode === 'add' ? 'green' : 'purple'

  return (
    <Modal
      open={open}
      variant={gradientVariant}
      title={title}
      shineColor={shineVariant}
      onClose={onCancel}
      footer={
        <div className="flex w-full justify-center gap-3">
          <button
            type="button"
            role="button"
            onClick={onCancel}
            className="flex-1 rounded-lg border border-border bg-white/50 px-4 py-2.5 text-sm font-semibold text-gray-600 shadow-[0_0_10px_#ccc] transition-transform hover:-translate-y-0.5"
          >
            取消
          </button>
          {mode === 'edit' && (
            <button
              type="button"
              role="button"
              onClick={handleDelete}
              className="flex-1 rounded-lg bg-red-500 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_0_10px_#ccc] transition-transform hover:-translate-y-0.5"
            >
              刪除
            </button>
          )}
          <button
            type="button"
            role="button"
            onClick={handleSave}
            className="flex-1 rounded-lg bg-[#7f956a] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_0_10px_#ccc] transition-transform hover:-translate-y-0.5"
          >
            儲存
          </button>
        </div>
      }
    >
      <ModalCard className="w-full gap-4">
        {/* Employee info */}
        <div className="flex items-center gap-3">
          <AvatarImage avatar={employee.avatar} size={40} />
          <div>
            <div className="text-sm font-medium">{employee.name}</div>
            <div className="text-sm text-muted-foreground">{date}</div>
          </div>
        </div>

        {/* Shift badge */}
        {shiftNumber !== undefined && (
          <div className="rounded-full bg-blue-100 px-3 py-0.5 text-sm font-medium text-blue-700">
            第 {shiftNumber} 班
          </div>
        )}

        {/* Attendance type toggle */}
        <div className="flex gap-2">
          <button
            type="button"
            className={cn(
              'rounded-lg px-4 py-1.5 text-sm font-semibold shadow-[0_0_10px_#ccc] transition-colors',
              attendanceType === ATTENDANCE_TYPES.REGULAR
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-accent',
            )}
            onClick={() => handleTypeChange('regular')}
          >
            一般
          </button>
          <button
            type="button"
            className={cn(
              'rounded-lg px-4 py-1.5 text-sm font-semibold shadow-[0_0_10px_#ccc] transition-colors',
              attendanceType === ATTENDANCE_TYPES.VACATION
                ? 'bg-red-500 text-white'
                : 'bg-muted text-muted-foreground hover:bg-accent',
            )}
            onClick={() => handleTypeChange('vacation')}
          >
            休假
          </button>
        </div>

        {/* Time inputs */}
        <div className="flex w-full gap-4">
          <div className="flex flex-1 flex-col gap-1">
            <label
              htmlFor="clock-in-time"
              className="text-sm font-medium text-[#718096]"
            >
              上班時間
            </label>
            <input
              id="clock-in-time"
              type="time"
              value={clockInTime}
              onChange={e => {
                setValue('clockInTime', e.target.value)
                clearErrors('clockOutTime')
              }}
              className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm"
            />
          </div>
          <div className="flex flex-1 flex-col gap-1">
            <label
              htmlFor="clock-out-time"
              className="text-sm font-medium text-[#718096]"
            >
              下班時間
            </label>
            <input
              id="clock-out-time"
              type="time"
              value={clockOutTime}
              disabled={isVacation}
              onChange={e => {
                setValue('clockOutTime', e.target.value)
                clearErrors('clockOutTime')
              }}
              className={cn(
                'rounded-lg border border-border bg-card px-3 py-1.5 text-sm',
                isVacation && 'cursor-not-allowed opacity-50',
              )}
            />
          </div>
        </div>

        {/* Validation error */}
        {errors.clockOutTime && (
          <div className="text-sm text-red-500">
            {errors.clockOutTime.message}
          </div>
        )}
      </ModalCard>
    </Modal>
  )
}
