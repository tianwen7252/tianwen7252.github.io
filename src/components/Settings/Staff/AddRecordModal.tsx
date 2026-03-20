import React, { useEffect } from 'react'
import { Modal, Form, TimePicker, Radio, Select, DatePicker, message } from 'antd'
import type { RadioChangeEvent } from 'antd'
import dayjs from 'dayjs'
import {
  ATTENDANCE_TYPES,
  type AttendanceType,
} from 'src/constants/defaults/attendanceTypes'
import * as API from 'src/libs/api'
import { buildTimestamp } from './attendanceUtils'

interface AddRecordFormValues {
  employeeId: number
  date: dayjs.Dayjs
  type: AttendanceType
  clockIn: dayjs.Dayjs | null
  clockOut: dayjs.Dayjs | null
}

interface AddRecordModalProps {
  open: boolean
  onCancel: () => void
  onSuccess: () => void
  employees: RestaDB.Table.Employee[]
  defaultDate?: string
  defaultEmployeeId?: number
}

export const AddRecordModal: React.FC<AddRecordModalProps> = ({
  open,
  onCancel,
  onSuccess,
  employees,
  defaultDate,
  defaultEmployeeId,
}) => {
  const [form] = Form.useForm<AddRecordFormValues>()

  // Derive vacation status from form watch instead of separate state
  const watchedType = Form.useWatch('type', form)
  const isVacation = watchedType === ATTENDANCE_TYPES.VACATION

  // Set initial form values when modal opens or defaults change
  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        employeeId: defaultEmployeeId,
        date: defaultDate ? dayjs(defaultDate) : dayjs(),
        type: ATTENDANCE_TYPES.REGULAR,
        clockIn: null,
        clockOut: null,
      })
    }
  }, [open, defaultDate, defaultEmployeeId, form])

  // Handle attendance type change via Radio.Group
  const handleTypeChange = (e: RadioChangeEvent) => {
    const newType = e.target.value as AttendanceType
    if (newType === ATTENDANCE_TYPES.VACATION) {
      // Auto-clear clockOut when switching to vacation
      form.setFieldsValue({ clockOut: null })
    }
  }

  const handleSave = async (values: AddRecordFormValues) => {
    try {
      const dateStr = values.date.format('YYYY-MM-DD')
      const isVacationType = values.type === ATTENDANCE_TYPES.VACATION

      const newClockIn = buildTimestamp(dateStr, values.clockIn)
      // Skip clockOut for vacation records
      const newClockOut = isVacationType
        ? undefined
        : buildTimestamp(dateStr, values.clockOut)

      // Validate clockIn is required for regular records
      if (!isVacationType && newClockIn === undefined) {
        message.error('一般出勤必須填寫上班時間')
        return
      }

      // Validate clockOut is after clockIn for regular records
      if (
        !isVacationType &&
        newClockIn !== undefined &&
        newClockOut !== undefined &&
        newClockOut <= newClockIn
      ) {
        message.error('下班時間必須晚於上班時間')
        return
      }

      await API.attendances.add({
        employeeId: values.employeeId,
        date: dateStr,
        type: values.type,
        clockIn: newClockIn,
        clockOut: newClockOut,
      })

      message.success('新增打卡紀錄成功')
      onSuccess()
    } catch (err) {
      console.error('[AddRecordModal] Failed to add attendance record:', err)
      message.error('新增失敗，請再試一次')
    }
  }

  // Build employee options for the Select dropdown (filter out records without id)
  const employeeOptions = employees
    .filter(emp => emp.id !== undefined)
    .map(emp => ({
      value: emp.id as number,
      label: emp.name,
    }))

  return (
    <Modal
      title="新增打卡紀錄"
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      destroyOnHidden
    >
      <Form form={form} onFinish={handleSave} layout="vertical">
        <Form.Item
          name="employeeId"
          label="員工"
          rules={[{ required: true, message: '請選擇員工' }]}
        >
          <Select
            placeholder="請選擇員工"
            options={employeeOptions}
          />
        </Form.Item>
        <Form.Item
          name="date"
          label="日期"
          rules={[{ required: true, message: '請選擇日期' }]}
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item
          name="type"
          label="出勤類型"
          rules={[{ required: true }]}
        >
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

export default AddRecordModal
