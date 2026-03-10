import React, { useState } from 'react'
import { Card, Space, Button, Modal, Form, Input, message } from 'antd'
import { useLiveQuery } from 'dexie-react-hooks'
import { UserOutlined, PlusOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import * as API from 'src/libs/api'

export const ClockIn: React.FC = () => {
  const employees = useLiveQuery(() => API.employees.get()) || []
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form] = Form.useForm()

  const handleClockInOrOut = async (employee: RestaDB.Table.Employee) => {
    const today = dayjs().format('YYYY-MM-DD')
    const attendancesToday = await API.attendances.getByDate(today)
    
    // Check if the employee already clocked in today
    let record = attendancesToday.find(r => r.employeeId === employee.id)

    if (!record) {
      // Clock in
      await API.attendances.add({
        employeeId: employee.id!,
        date: today,
        clockIn: dayjs().valueOf(),
      })
      message.success(`${employee.name} 上班打卡成功: ${dayjs().format('HH:mm:ss')}`)
    } else if (!record.clockOut) {
      // Clock out
      await API.attendances.set(record.id!, {
        clockOut: dayjs().valueOf(),
      })
      message.success(`${employee.name} 下班打卡成功: ${dayjs().format('HH:mm:ss')}`)
    } else {
      message.warning(`${employee.name} 今日已完成上下班打卡`)
    }
  }

  const handleAddEmployee = async (values: any) => {
    await API.employees.add({
      name: values.name,
      status: 'active'
    })
    setIsModalOpen(false)
    form.resetFields()
    message.success('新增員工成功')
  }

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => setIsModalOpen(true)}
        >
          新增員工 (測試用)
        </Button>
      </div>
      
      <Space wrap size={[16, 16]}>
        {employees.map(employee => (
          <Card 
            key={employee.id} 
            hoverable 
            style={{ width: 120, textAlign: 'center' }}
            onClick={() => handleClockInOrOut(employee)}
          >
            <div style={{ fontSize: 32, marginBottom: 8 }}>
              {employee.avatar ? <img src={employee.avatar} alt="avatar" style={{width: '100%'}}/> : <UserOutlined />}
            </div>
            <div>{employee.name}</div>
          </Card>
        ))}
        {employees.length === 0 && <span style={{color: '#999'}}>目前無員工資料，請先新增測試員工</span>}
      </Space>

      <Modal
        title="新增員工"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleAddEmployee} layout="vertical">
          <Form.Item name="name" label="姓名" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
              確認
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default ClockIn
