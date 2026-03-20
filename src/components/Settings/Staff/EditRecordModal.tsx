import React, { useEffect } from 'react'
import { Modal, Form, TimePicker, Radio, message } from 'antd'
import type { RadioChangeEvent } from 'antd'
import dayjs from 'dayjs'
import {
  ATTENDANCE_TYPES,
  type AttendanceType,
} from 'src/constants/defaults/attendanceTypes'
import * as API from 'src/libs/api'
import { buildTimestamp } from './attendanceUtils'

interface AttendanceFormValues {
  type: AttendanceType
  clockIn: dayjs.Dayjs | null
  clockOut: dayjs.Dayjs | null
}

interface Props {
  record: RestaDB.Table.Attendance
  empName: string
  onCancel: () => void
  onSuccess: () => void
}

export const EditRecordModal: React.FC<Props> = ({ record, empName, onCancel, onSuccess }) => {
  const [form] = Form.useForm<AttendanceFormValues>()

  // Derive vacation status from form watch instead of separate state
  const watchedType = Form.useWatch('type', form)
  const isVacation = watchedType === ATTENDANCE_TYPES.VACATION

  // Build modal title with optional type suffix
  const typeSuffix = isVacation ? ' (休假)' : ''
  const modalTitle = `修改打卡紀錄: ${empName} (${record.date})${typeSuffix}`

  useEffect(() => {
    const initialType = record.type ?? ATTENDANCE_TYPES.REGULAR
    const vacation = initialType === ATTENDANCE_TYPES.VACATION
    form.setFieldsValue({
      type: initialType,
      clockIn: record.clockIn ? dayjs(record.clockIn) : null,
      // Clear clockOut value for vacation records since it is not applicable
      clockOut: vacation ? null : record.clockOut ? dayjs(record.clockOut) : null,
    })
  }, [record, form])

  // Handle attendance type change via Radio.Group
  const handleTypeChange = (e: RadioChangeEvent) => {
    const newType = e.target.value as AttendanceType
    if (newType === ATTENDANCE_TYPES.VACATION) {
      // Auto-clear clockOut when switching to vacation
      form.setFieldsValue({ clockOut: null })
    }
  }

  const handleSave = async (values: AttendanceFormValues) => {
    try {
      const dateStr = record.date
      const newClockIn = buildTimestamp(dateStr, values.clockIn)
      // Skip clockOut for vacation records
      const vacation = values.type === ATTENDANCE_TYPES.VACATION
      const newClockOut = vacation
        ? undefined
        : buildTimestamp(dateStr, values.clockOut)

      await API.attendances.set(record.id!, {
        type: values.type,
        clockIn: newClockIn,
        clockOut: newClockOut,
      })

      message.success('更新打卡時間成功')
      onSuccess()
    } catch (err) {
      console.error('[EditRecordModal] Failed to update attendance record:', err)
      message.error('更新失敗')
    }
  }

  return (
    <Modal
      title={modalTitle}
      open={true}
      onCancel={onCancel}
      onOk={() => form.submit()}
      destroyOnClose
    >
      <Form form={form} onFinish={handleSave} layout="vertical">
        <Form.Item name="type" label="出勤類型" rules={[{ required: true }]}>
          <Radio.Group onChange={handleTypeChange}>
            <Radio value={ATTENDANCE_TYPES.REGULAR}>一般</Radio>
            <Radio value={ATTENDANCE_TYPES.VACATION}>休假</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item name="clockIn" label="上班時間">
          <TimePicker style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="clockOut" label="下班時間">
          <TimePicker style={{ width: '100%' }} disabled={isVacation} />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default EditRecordModal
