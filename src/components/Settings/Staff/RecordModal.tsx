import React, { useState, useEffect } from 'react'
import { Modal, TimePicker, message } from 'antd'
import dayjs from 'dayjs'
import { AvatarImage } from 'src/components/AvatarImage'
import {
  ATTENDANCE_TYPES,
  type AttendanceType,
} from 'src/constants/defaults/attendanceTypes'
import * as API from 'src/libs/api'
import { buildTimestamp } from './attendanceUtils'
import {
  recordModalStyles as styles,
  gradientAddRootCss,
  gradientEditRootCss,
} from './styles/recordModalStyles'

export interface RecordModalProps {
  readonly open: boolean
  readonly mode: 'add' | 'edit'
  readonly employee: RestaDB.Table.Employee | null
  readonly date: string // 'YYYY-MM-DD'
  readonly record?: RestaDB.Table.Attendance // for edit mode
  readonly shiftNumber?: number // optional shift badge
  readonly onCancel: () => void
  readonly onSuccess: () => void
}

export const RecordModal: React.FC<RecordModalProps> = ({
  open,
  mode,
  employee,
  date,
  record,
  shiftNumber,
  onCancel,
  onSuccess,
}) => {
  // Form state
  const [attendanceType, setAttendanceType] = useState<AttendanceType>(
    ATTENDANCE_TYPES.REGULAR,
  )
  const [clockInTime, setClockInTime] = useState<dayjs.Dayjs | null>(null)
  const [clockOutTime, setClockOutTime] = useState<dayjs.Dayjs | null>(null)
  const [loading, setLoading] = useState(false)

  // Reset form when modal opens or record changes
  useEffect(() => {
    if (!open) return
    if (mode === 'edit' && record) {
      setAttendanceType(record.type ?? ATTENDANCE_TYPES.REGULAR)
      setClockInTime(record.clockIn != null ? dayjs(record.clockIn) : null)
      setClockOutTime(
        record.type === ATTENDANCE_TYPES.VACATION
          ? null
          : record.clockOut != null
            ? dayjs(record.clockOut)
            : null,
      )
    } else {
      // Add mode defaults
      setAttendanceType(ATTENDANCE_TYPES.REGULAR)
      setClockInTime(null)
      setClockOutTime(null)
    }
  }, [open, mode, record])

  // Early return if no employee
  if (!employee) return null

  const isVacation = attendanceType === ATTENDANCE_TYPES.VACATION
  const isEdit = mode === 'edit'
  const title = isEdit ? '修改打卡紀錄' : '新增打卡紀錄'
  const gradientCss = isEdit ? gradientEditRootCss : gradientAddRootCss

  // Handle type toggle
  const handleTypeChange = (type: AttendanceType) => {
    setAttendanceType(type)
    if (type === ATTENDANCE_TYPES.VACATION) {
      setClockOutTime(null)
    }
  }

  // Handle save
  const handleSave = async () => {
    setLoading(true)
    try {
      const newClockIn = buildTimestamp(date, clockInTime)
      const newClockOut = isVacation
        ? undefined
        : buildTimestamp(date, clockOutTime)

      // Validate: clockOut must be after clockIn for regular type
      if (
        !isVacation &&
        newClockIn != null &&
        newClockOut != null &&
        newClockOut <= newClockIn
      ) {
        message.error('下班時間必須晚於上班時間')
        return
      }

      if (isEdit && record?.id != null) {
        await API.attendances.set(record.id, {
          type: attendanceType,
          clockIn: newClockIn,
          clockOut: newClockOut,
        })
        message.success('更新打卡時間成功')
      } else {
        if (!employee.id) return
        await API.attendances.add({
          employeeId: employee.id,
          date,
          type: attendanceType,
          clockIn: newClockIn,
          clockOut: newClockOut,
        })
        message.success('新增打卡紀錄成功')
      }
      onSuccess()
    } catch (err) {
      console.error('[RecordModal] Save failed:', err)
      message.error('操作失敗，請稍後再試')
    } finally {
      setLoading(false)
    }
  }

  // Handle delete (edit mode only)
  const handleDelete = async () => {
    if (!isEdit || record?.id == null) return
    setLoading(true)
    try {
      await API.attendances.delete(record.id)
      message.success('已刪除打卡紀錄')
      onSuccess()
    } catch (err) {
      console.error('[RecordModal] Delete failed:', err)
      message.error('刪除失敗')
    } finally {
      setLoading(false)
    }
  }

  // Format date for display
  const displayDate = dayjs(date).format('YYYY年M月D日')

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      closable={false}
      width={500}
      centered
      rootClassName={gradientCss}
    >
      <div className={styles.modalContainerCss}>
        {/* System label */}
        <div className={styles.systemLabelCss}>
          {isEdit ? '修改紀錄' : '新增紀錄'}
        </div>

        {/* Title */}
        <div className={styles.titleCss}>{title}</div>

        {/* Glass card */}
        <div className={styles.glassCardCss}>
          {/* Avatar */}
          <div className={styles.avatarCss}>
            <AvatarImage avatar={employee.avatar} size={80} />
          </div>

          {/* Employee name */}
          <div className={styles.employeeNameCss}>{employee.name}</div>

          {/* Date */}
          <div className={styles.dateLabelCss}>{displayDate}</div>

          {/* Shift badge */}
          {shiftNumber != null && shiftNumber > 0 && (
            <div className={styles.shiftBadgeCss}>第 {shiftNumber} 班</div>
          )}

          {/* Form section */}
          <div className={styles.formSectionCss}>
            {/* Type selector */}
            <div className={styles.formRowCss}>
              <span className={styles.formLabelCss}>出勤類型</span>
              <div className={styles.typeGroupCss}>
                <button
                  type="button"
                  className={
                    attendanceType === ATTENDANCE_TYPES.REGULAR
                      ? styles.typeOptionActiveCss
                      : styles.typeOptionCss
                  }
                  onClick={() => handleTypeChange(ATTENDANCE_TYPES.REGULAR)}
                >
                  一般
                </button>
                <button
                  type="button"
                  className={
                    attendanceType === ATTENDANCE_TYPES.VACATION
                      ? styles.typeOptionActiveCss
                      : styles.typeOptionCss
                  }
                  onClick={() => handleTypeChange(ATTENDANCE_TYPES.VACATION)}
                >
                  休假
                </button>
              </div>
            </div>

            {/* Clock-in time */}
            <div className={styles.formRowCss}>
              <span className={styles.formLabelCss}>上班時間</span>
              <TimePicker
                value={clockInTime}
                onChange={setClockInTime}
                format="HH:mm"
                style={{ flex: 1 }}
              />
            </div>

            {/* Clock-out time */}
            <div className={styles.formRowCss}>
              <span className={styles.formLabelCss}>下班時間</span>
              <TimePicker
                value={clockOutTime}
                onChange={setClockOutTime}
                format="HH:mm"
                disabled={isVacation}
                style={{ flex: 1 }}
              />
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className={styles.buttonRowCss}>
          {isEdit && (
            <button
              type="button"
              className={styles.deleteBtnCss}
              onClick={handleDelete}
              disabled={loading}
            >
              刪除
            </button>
          )}
          <button
            type="button"
            className={styles.cancelBtnCss}
            onClick={onCancel}
          >
            取消
          </button>
          <button
            type="button"
            className={styles.saveBtnCss}
            onClick={handleSave}
            disabled={loading}
          >
            {isEdit ? '儲存' : '新增'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default RecordModal
