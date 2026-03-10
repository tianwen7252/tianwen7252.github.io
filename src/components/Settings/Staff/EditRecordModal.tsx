import React, { useEffect } from 'react'
import { Modal, Form, TimePicker, message } from 'antd'
import dayjs from 'dayjs'
import * as API from 'src/libs/api'

interface Props {
  record: RestaDB.Table.Attendance
  empName: string
  onCancel: () => void
  onSuccess: () => void
}

export const EditRecordModal: React.FC<Props> = ({ record, empName, onCancel, onSuccess }) => {
  const [form] = Form.useForm()

  useEffect(() => {
    form.setFieldsValue({
      clockIn: record.clockIn ? dayjs(record.clockIn) : null,
      clockOut: record.clockOut ? dayjs(record.clockOut) : null,
    })
  }, [record, form])

  const handleSave = async (values: any) => {
    try {
      // ensure we are patching the correct date
      const dateStr = record.date
      const newClockIn = values.clockIn ? dayjs(dateStr).hour(values.clockIn.hour()).minute(values.clockIn.minute()).second(values.clockIn.second()).valueOf() : undefined
      const newClockOut = values.clockOut ? dayjs(dateStr).hour(values.clockOut.hour()).minute(values.clockOut.minute()).second(values.clockOut.second()).valueOf() : undefined
      
      await API.attendances.set(record.id!, {
        clockIn: newClockIn,
        clockOut: newClockOut
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
      title={`修改打卡紀錄: ${empName} (${record.date})`}
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
          <TimePicker style={{ width: '100%' }} />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default EditRecordModal
