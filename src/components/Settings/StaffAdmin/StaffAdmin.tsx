import React, { useEffect, useMemo, useState } from 'react'
import { Table, Button, Modal, Form, Input, Tag, Popconfirm, message } from 'antd'
import { useLiveQuery } from 'dexie-react-hooks'
import { UserOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { AuthGuard } from 'src/components/AuthGuard'
import * as API from 'src/libs/api'
import { styles } from './styles'

const AVATAR_EMOJIS = [
  '😀', '😊', '🙂', '😎', '🤩',
  '👩', '👨', '👧', '👦', '🧑',
  '👩‍🍳', '👨‍🍳', '🧑‍💼', '👩‍💼', '👨‍💼',
  '🐱', '🐶', '🦊', '🐼', '🐨',
]

function renderAvatar(avatar?: string) {
  if (!avatar) return <UserOutlined style={{ fontSize: 28 }} />
  if (avatar.startsWith('http')) return <img src={avatar} alt="avatar" style={{ width: 32, height: 32, borderRadius: '50%' }} />
  return <span className={styles.avatarCss}>{avatar}</span>
}

export const StaffAdmin: React.FC = () => {
  const employees = useLiveQuery(() => API.employees.get()) || []

  const today = useMemo(() => dayjs().format('YYYY-MM-DD'), [])
  const todayAttendances = useLiveQuery(() => API.attendances.getByDate(today), [today])
  const attendanceMap = useMemo(
    () =>
      (todayAttendances ?? []).reduce(
        (map, r) => ({ ...map, [r.employeeId as number]: r }),
        {} as Record<number, RestaDB.Table.Attendance>,
      ),
    [todayAttendances],
  )

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<RestaDB.Table.Employee | null>(null)
  const [form] = Form.useForm()
  const avatarValue = Form.useWatch('avatar', form)

  useEffect(() => {
    if (isModalOpen) {
      form.setFieldsValue(editingEmployee ?? { name: '', avatar: '' })
    }
  }, [isModalOpen, editingEmployee, form])

  const openAdd = () => {
    setEditingEmployee(null)
    setIsModalOpen(true)
  }

  const openEdit = (employee: RestaDB.Table.Employee) => {
    setEditingEmployee(employee)
    setIsModalOpen(true)
  }

  const handleClose = () => {
    setIsModalOpen(false)
    form.resetFields()
  }

  const handleSaveEmployee = async (values: { name: string; avatar?: string }) => {
    if (editingEmployee) {
      await API.employees.set(editingEmployee.id!, { name: values.name, avatar: values.avatar })
      message.success('已更新員工資料')
    } else {
      await API.employees.add({ name: values.name, avatar: values.avatar, status: 'active' })
      message.success('新增員工成功')
    }
    handleClose()
  }

  const handleDeleteEmployee = async (id: number, name: string) => {
    await API.employees.delete(id)
    message.success(`已刪除員工：${name}`)
  }

  const columns = [
    {
      title: '頭像',
      key: 'avatar',
      width: 60,
      render: (_: any, employee: RestaDB.Table.Employee) => renderAvatar(employee.avatar),
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '今日狀態',
      key: 'status',
      render: (_: any, employee: RestaDB.Table.Employee) => {
        const record = attendanceMap[employee.id!]
        if (!record) return <Tag>未打卡</Tag>
        if (record.clockIn && record.clockOut) {
          return (
            <Tag color="success">
              已下班 {dayjs(record.clockIn).format('HH:mm')}–{dayjs(record.clockOut).format('HH:mm')}
            </Tag>
          )
        }
        return <Tag color="processing">已上班 {dayjs(record.clockIn).format('HH:mm')}</Tag>
      },
    },
    {
      title: '操作',
      key: 'actions',
      render: (_: any, employee: RestaDB.Table.Employee) => (
        <div style={{ display: 'flex', gap: 8 }}>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => openEdit(employee)}
          >
            編輯
          </Button>
          <Popconfirm
            title={`確定要刪除「${employee.name}」嗎？`}
            description="此操作將無法復原"
            onConfirm={() => handleDeleteEmployee(employee.id!, employee.name)}
            okText="確定"
            cancelText="取消"
          >
            <Button size="small" danger icon={<DeleteOutlined />}>
              刪除
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ]

  return (
    <AuthGuard variant="staffAdmin">
      <div className={styles.wrapCss}>
        <div style={{ marginBottom: 16 }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={openAdd}>
            新增員工
          </Button>
        </div>

        <Table
          dataSource={employees}
          columns={columns}
          rowKey="id"
          pagination={false}
          locale={{ emptyText: '目前無員工資料，請先新增員工' }}
        />

        <Modal
          title={editingEmployee ? '編輯員工' : '新增員工'}
          open={isModalOpen}
          onCancel={handleClose}
          footer={null}
          destroyOnHidden
        >
          <Form form={form} onFinish={handleSaveEmployee} layout="vertical">
            <Form.Item name="name" label="姓名" rules={[{ required: true, message: '請輸入員工姓名' }]}>
              <Input placeholder="請輸入員工姓名" />
            </Form.Item>

            <Form.Item name="avatar" label="頭像">
              <div className={styles.emojiGridCss}>
                {AVATAR_EMOJIS.map(emoji => (
                  <div
                    key={emoji}
                    className={`${styles.emojiItemCss} ${avatarValue === emoji ? styles.emojiItemSelectedCss : ''}`}
                    onClick={() => form.setFieldValue('avatar', emoji)}
                  >
                    {emoji}
                  </div>
                ))}
              </div>
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
                確認
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </AuthGuard>
  )
}
