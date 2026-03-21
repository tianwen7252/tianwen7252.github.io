import React, { useEffect, useState } from 'react'
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Tag,
  Popconfirm,
  Radio,
  Switch,
  DatePicker,
  message,
} from 'antd'
import dayjs from 'dayjs'
import type { Dayjs } from 'dayjs'
import { useLiveQuery } from 'dexie-react-hooks'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { AuthGuard } from 'src/components/AuthGuard'
import { AvatarImage } from 'src/components/AvatarImage'
import * as API from 'src/libs/api'
import { ANIMAL_AVATARS } from 'src/constants/defaults/animalAvatars'
import { SHIFT_TYPES } from 'src/constants/defaults/shiftTypes'
import type { ShiftType } from 'src/constants/defaults/shiftTypes'
import { styles } from './styles'

// Format employee number with labels stacked below the number
function formatEmployeeNo(employee: RestaDB.Table.Employee): React.ReactNode {
  const { employeeNo, isAdmin, resignationDate } = employee
  if (!employeeNo) return '—'

  const tags = [
    isAdmin ? (
      <Tag key="admin" color="gold">
        管理員
      </Tag>
    ) : null,
    resignationDate ? (
      <Tag key="resigned" color="red" style={{ marginTop: 8 }}>
        已離職
      </Tag>
    ) : null,
  ].filter(Boolean)

  return (
    <div>
      <div>{employeeNo}</div>
      {tags.length > 0 && <div style={{ marginTop: 4 }}>{tags}</div>}
    </div>
  )
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
  isAdmin?: boolean
  hireDate?: Dayjs
  resignationDate?: Dayjs
}

export const StaffAdmin: React.FC = () => {
  const employees = useLiveQuery(() => API.employees.get()) || []

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] =
    useState<RestaDB.Table.Employee | null>(null)
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
              isAdmin: editingEmployee.isAdmin ?? false,
              hireDate: editingEmployee.hireDate
                ? dayjs(editingEmployee.hireDate)
                : undefined,
              resignationDate: editingEmployee.resignationDate
                ? dayjs(editingEmployee.resignationDate)
                : undefined,
            }
          : {
              name: '',
              avatar: '',
              shiftType: 'regular',
              isAdmin: false,
              hireDate: dayjs(),
              resignationDate: undefined,
            },
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
      // Convert Dayjs to ISO date string, omit if not set
      const hireDate = values.hireDate?.format('YYYY-MM-DD')
      const resignationDate = values.resignationDate?.format('YYYY-MM-DD')

      if (editingEmployee) {
        // Always include date fields so clearing a DatePicker removes the value
        await API.employees.set(editingEmployee.id!, {
          name: values.name,
          avatar: values.avatar,
          shiftType: values.shiftType,
          isAdmin: values.isAdmin ?? false,
          hireDate,
          resignationDate,
        })
        message.success('已更新員工資料')
      } else {
        await API.employees.add({
          name: values.name,
          avatar: values.avatar,
          status: 'active',
          shiftType: values.shiftType,
          isAdmin: values.isAdmin ?? false,
          ...(hireDate !== undefined && { hireDate }),
          ...(resignationDate !== undefined && { resignationDate }),
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
        formatEmployeeNo(employee),
    },
    {
      title: '員工',
      key: 'employee',
      render: (_: any, employee: RestaDB.Table.Employee) => (
        <div className={styles.employeeInfoCss}>
          <AvatarImage avatar={employee.avatar} size={54} />
          <span>{employee.name}</span>
        </div>
      ),
    },
    {
      title: '入職日期',
      key: 'hireDate',
      width: 150,
      render: (_: any, employee: RestaDB.Table.Employee) =>
        employee.hireDate ?? '—',
    },
    {
      title: '離職日期',
      key: 'resignationDate',
      width: 150,
      render: (_: any, employee: RestaDB.Table.Employee) =>
        employee.resignationDate ?? '—',
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
      title: '操作',
      key: 'actions',
      width: 100,
      render: (_: any, employee: RestaDB.Table.Employee) => (
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Button
            type="text"
            aria-label="edit"
            icon={<EditOutlined style={{ fontSize: 20 }} />}
            onClick={() => openEdit(employee)}
          />
          <Popconfirm
            title={`確定要刪除「${employee.name}」嗎？`}
            description="此操作將無法復原"
            onConfirm={() => handleDeleteEmployee(employee.id!, employee.name)}
            okText="確定"
            cancelText="取消"
          >
            <Button
              type="text"
              danger
              aria-label="delete"
              icon={<DeleteOutlined style={{ fontSize: 20 }} />}
            />
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
          key={editingEmployee?.id ?? 'new'}
          title={editingEmployee ? '編輯員工' : '新增員工'}
          open={isModalOpen}
          onCancel={handleClose}
          footer={null}
          width={900}
          centered
          destroyOnHidden
        >
          <Form form={form} onFinish={handleSaveEmployee} layout="vertical">
            <Form.Item
              name="name"
              label="員工姓名"
              rules={[{ required: true, message: '請輸入員工姓名' }]}
            >
              <Input placeholder="請輸入員工姓名" style={{ fontSize: 18 }} />
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

            <Form.Item
              name="isAdmin"
              label="管理員權限"
              valuePropName="checked"
              initialValue={false}
            >
              <Switch />
            </Form.Item>

            <div style={{ display: 'flex', gap: 16 }}>
              <Form.Item name="hireDate" label="入職日期" style={{ flex: 1 }}>
                <DatePicker
                  format="YYYY-MM-DD"
                  placeholder="選擇入職日期"
                  style={{ width: '100%' }}
                />
              </Form.Item>
              {/* Only show resignation date when editing an existing employee */}
              {editingEmployee && (
                <Form.Item
                  name="resignationDate"
                  label="離職日期"
                  style={{ flex: 1 }}
                >
                  <DatePicker
                    format="YYYY-MM-DD"
                    placeholder="選擇離職日期"
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              )}
            </div>

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
              <Button
                type="primary"
                htmlType="submit"
                style={{ width: '100%' }}
              >
                確認
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </AuthGuard>
  )
}
