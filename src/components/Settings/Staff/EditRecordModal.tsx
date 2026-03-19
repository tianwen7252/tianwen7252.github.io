import React, { useEffect } from 'react'
import { Modal, Form, TimePicker, message } from 'antd'
import dayjs from 'dayjs'
import { ATTENDANCE_TYPES } from 'src/constants/defaults/attendanceTypes'
import * as API from 'src/libs/api'

interface Props {
  record: RestaDB.Table.Attendance
  empName: string
  onCancel: () => void
  onSuccess: () => void
}

export const EditRecordModal: React.FC<Props> = ({ record, empName, onCancel, onSuccess }) => {
  const [form] = Form.useForm()
  const vacation = record.type === ATTENDANCE_TYPES.VACATION

  // Build modal title with optional type suffix
  const typeSuffix = vacation ? ' (休假)' : ''
  const modalTitle = `修改打卡紀錄: ${empName} (${record.date})${typeSuffix}`

  useEffect(() => {
    form.setFieldsValue({
      clockIn: record.clockIn ? dayjs(record.clockIn) : null,
      // Clear clockOut value for vacation records since it is not applicable
      clockOut: vacation ? null : record.clockOut ? dayjs(record.clockOut) : null,
    })
  }, [record, form, vacation])

  const handleSave = async (values: any) => {
    try {
      // Ensure we are patching the correct date
      const dateStr = record.date
      const newClockIn = values.clockIn
        ? dayjs(dateStr)
            .hour(values.clockIn.hour())
            .minute(values.clockIn.minute())
            .second(values.clockIn.second())
            .valueOf()
        : undefined
      // Skip clockOut for vacation records
      const newClockOut =
        vacation || !values.clockOut
          ? undefined
          : dayjs(dateStr)
              .hour(values.clockOut.hour())
              .minute(values.clockOut.minute())
              .second(values.clockOut.second())
              .valueOf()

      await API.attendances.set(record.id!, {
        clockIn: newClockIn,
        clockOut: newClockOut,
      })

      message.success('更新打卡時間成功')
      onSuccess()
    } catch (err) {
      console.error(err)
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
        <Form.Item name="clockIn" label="上班時間">
          <TimePicker style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="clockOut" label="下班時間">
          <TimePicker style={{ width: '100%' }} disabled={vacation} />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default EditRecordModal
