import React, { useEffect, useMemo, useState } from 'react'
import { Table, Button, Modal, Form, Input, Tag, Popconfirm, Radio, message } from 'antd'
import { useLiveQuery } from 'dexie-react-hooks'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { AuthGuard } from 'src/components/AuthGuard'
import { AvatarImage } from 'src/components/AvatarImage'
import * as API from 'src/libs/api'
import { ANIMAL_AVATARS } from 'src/constants/defaults/animalAvatars'
import { SHIFT_TYPES } from 'src/constants/defaults/shiftTypes'
import type { ShiftType } from 'src/constants/defaults/shiftTypes'
import { styles } from './styles'

// Format employee number with admin label for the first employee
function formatEmployeeNo(employeeNo?: string): React.ReactNode {
  if (!employeeNo) return '—'
  if (employeeNo === '001') {
    return (
      <span>
        {employeeNo} <Tag color="gold">管理員</Tag>
      </span>
    )
  }
  return employeeNo
}

// Get shift type label from key
function getShiftLabel(shiftType?: string): string {
  const found = SHIFT_TYPES.find(s => s.key === shiftType)
  return found?.label ?? '常日班'
}

interface EmployeeFormValues {
  name: string
  avatar?: string
  shiftType: ShiftType
}

export const StaffAdmin: React.FC = () => {
  const employees = useLiveQuery(() => API.employees.get()) || []

  // Compute on every render — cheap and avoids stale date after midnight on POS iPad
  const today = dayjs().format('YYYY-MM-DD')
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
  const [form] = Form.useForm<EmployeeFormValues>()
  const avatarValue = Form.useWatch('avatar', form)

  useEffect(() => {
    if (isModalOpen) {
      form.setFieldsValue(
        editingEmployee
          ? {
              name: editingEmployee.name,
              avatar: editingEmployee.avatar ?? '',
              shiftType: editingEmployee.shiftType ?? 'regular',
            }
          : { name: '', avatar: '', shiftType: 'regular' },
      )
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

  const handleSaveEmployee = async (values: EmployeeFormValues) => {
    try {
      if (editingEmployee) {
        await API.employees.set(editingEmployee.id!, {
          name: values.name,
          avatar: values.avatar,
          shiftType: values.shiftType,
        })
        message.success('已更新員工資料')
      } else {
        await API.employees.add({
          name: values.name,
          avatar: values.avatar,
          status: 'active',
          shiftType: values.shiftType,
        })
        message.success('新增員工成功')
      }
      handleClose()
    } catch (err) {
      message.error('儲存員工資料失敗，請再試一次')
      console.error('[StaffAdmin] save employee failed', err)
    }
  }

  const handleDeleteEmployee = async (id: number, name: string) => {
    try {
      await API.employees.delete(id)
      message.success(`已刪除員工：${name}`)
    } catch (err) {
      message.error('刪除員工失敗，請再試一次')
      console.error('[StaffAdmin] delete employee failed', err)
    }
  }

  const columns = [
    {
      title: '員工編號',
      key: 'employeeNo',
      width: 120,
      render: (_: any, employee: RestaDB.Table.Employee) =>
        formatEmployeeNo(employee.employeeNo),
    },
    {
      title: '員工',
      key: 'employee',
      render: (_: any, employee: RestaDB.Table.Employee) => (
        <div className={styles.employeeInfoCss}>
          <AvatarImage avatar={employee.avatar} size={36} />
          <span>{employee.name}</span>
        </div>
      ),
    },
    {
      title: '班別',
      key: 'shiftType',
      width: 100,
      render: (_: any, employee: RestaDB.Table.Employee) => {
        const label = getShiftLabel(employee.shiftType)
        const color = employee.shiftType === 'shift' ? 'blue' : 'default'
        return <Tag color={color}>{label}</Tag>
      },
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
            <Form.Item
              name="name"
              label="員工姓名"
              rules={[{ required: true, message: '請輸入員工姓名' }]}
            >
              <Input placeholder="請輸入員工姓名" />
            </Form.Item>

            <Form.Item name="shiftType" label="班別" initialValue="regular">
              <Radio.Group>
                {SHIFT_TYPES.map(st => (
                  <Radio key={st.key} value={st.key}>
                    {st.label}
                  </Radio>
                ))}
              </Radio.Group>
            </Form.Item>

            <Form.Item name="avatar" label="頭像">
              <div className={styles.imageGridCss}>
                {ANIMAL_AVATARS.map(animal => (
                  <div
                    key={animal.id}
                    className={`${styles.imageItemCss} ${avatarValue === animal.path ? styles.imageItemSelectedCss : ''}`}
                    onClick={() => form.setFieldValue('avatar', animal.path)}
                  >
                    <img src={animal.path} alt={`avatar-${animal.id}`} />
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
