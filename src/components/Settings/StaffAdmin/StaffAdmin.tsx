import React, { useEffect, useMemo, useState } from 'react'
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
import { ATTENDANCE_TYPES } from 'src/constants/defaults/attendanceTypes'
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

// Derive today status tag configuration from attendance record
export function deriveStatusTag(
  record: RestaDB.Table.Attendance | undefined,
): { text: string; color: string } {
  if (!record) {
    return { text: '未打卡', color: 'default' }
  }
  if (record.type === 'vacation') {
    return { text: '休假', color: 'red' }
  }
  if (record.clockIn && record.clockOut) {
    const inTime = dayjs(record.clockIn).format('HH:mm')
    const outTime = dayjs(record.clockOut).format('HH:mm')
    return { text: `已下班 ${inTime}\u2013${outTime}`, color: 'purple' }
  }
  if (record.clockIn) {
    const inTime = dayjs(record.clockIn).format('HH:mm')
    return { text: `已上班 ${inTime}`, color: 'green' }
  }
  return { text: '未打卡', color: 'default' }
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

  // Reactive attendance query for today's date (auto-refreshes at midnight)
  const [today, setToday] = useState(() => dayjs().format('YYYY-MM-DD'))
  useEffect(() => {
    const msUntilMidnight =
      dayjs().endOf('day').valueOf() - dayjs().valueOf() + 1000
    const timer = setTimeout(
      () => setToday(dayjs().format('YYYY-MM-DD')),
      msUntilMidnight,
    )
    return () => clearTimeout(timer)
  }, [today])
  const todayAttendances = useLiveQuery(
    () => API.attendances.getByDate(today),
    [today],
  )

  // Build O(1) lookup map from employeeId to attendance record (immutable reduce)
  const attendanceMap = useMemo(
    () =>
      (todayAttendances ?? []).reduce(
        (map, r) => ({ ...map, [r.employeeId as number]: r }),
        {} as Record<number, RestaDB.Table.Attendance>,
      ),
    [todayAttendances],
  )

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

  // Set vacation for an employee with no attendance record today
  const handleSetVacation = async (employeeId: number) => {
    try {
      await API.attendances.add({
        employeeId,
        date: today,
        type: ATTENDANCE_TYPES.VACATION,
      })
      message.success('已設定休假')
    } catch (err) {
      message.error('設定休假失敗，請再試一次')
      console.error('[StaffAdmin] set vacation failed', err)
    }
  }

  // Cancel vacation by deleting the attendance record
  const handleCancelVacation = async (recordId: number) => {
    try {
      await API.attendances.delete(recordId)
      message.success('已取消休假')
    } catch (err) {
      message.error('取消休假失敗，請再試一次')
      console.error('[StaffAdmin] cancel vacation failed', err)
    }
  }

  // Render vacation quick-action button based on attendance state
  const renderVacationAction = (employee: RestaDB.Table.Employee) => {
    const record = attendanceMap[employee.id!]

    // No attendance record: show "設定休假"
    if (!record) {
      return (
        <Popconfirm
          title={`確定要將「${employee.name}」設定為休假嗎？`}
          onConfirm={() => handleSetVacation(employee.id!)}
          okText="確定"
          cancelText="取消"
        >
          <Button size="small" danger>
            設定休假
          </Button>
        </Popconfirm>
      )
    }

    // On vacation: show "取消休假"
    if (record.type === ATTENDANCE_TYPES.VACATION) {
      return (
        <Popconfirm
          title={`確定要取消「${employee.name}」的休假嗎？`}
          onConfirm={() => handleCancelVacation(record.id!)}
          okText="確定"
          cancelText="取消"
        >
          <Button size="small">取消休假</Button>
        </Popconfirm>
      )
    }

    // Already clocked in (regular attendance): no vacation action
    return null
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
      title: '今日狀態',
      key: 'todayStatus',
      width: 180,
      render: (_: any, employee: RestaDB.Table.Employee) => {
        const record = attendanceMap[employee.id!]
        const { text, color } = deriveStatusTag(record)
        return <Tag color={color}>{text}</Tag>
      },
    },
    {
      title: '操作',
      key: 'actions',
      width: 220,
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
          {renderVacationAction(employee)}
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
