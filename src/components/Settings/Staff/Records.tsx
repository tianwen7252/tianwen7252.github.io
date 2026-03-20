import React, { useState, useMemo } from 'react'
import {
  DatePicker,
  Radio,
  Button,
  Space,
  Calendar,
  Table,
  Badge,
  Spin,
  Select,
} from 'antd'
import { LeftOutlined, RightOutlined, PlusOutlined } from '@ant-design/icons'
import dayjs, { Dayjs } from 'dayjs'
import { useLiveQuery } from 'dexie-react-hooks'
import { ATTENDANCE_TYPES } from 'src/constants/defaults/attendanceTypes'
import * as API from 'src/libs/api'
import EditRecordModal from './EditRecordModal'
import { AddRecordModal } from './AddRecordModal'

/** Check whether an attendance record is a vacation type */
const isVacation = (record: RestaDB.Table.Attendance): boolean =>
  record.type === ATTENDANCE_TYPES.VACATION

/** Display label for the attendance type column */
const getTypeLabel = (record: RestaDB.Table.Attendance): string =>
  isVacation(record) ? '休假' : '一般'

export const Records: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState<Dayjs>(dayjs())
  const [viewMode, setViewMode] = useState<'calendar' | 'table'>('calendar')
  const [selectedRecord, setSelectedRecord] =
    useState<RestaDB.Table.Attendance | null>(null)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [filterEmployeeId, setFilterEmployeeId] = useState<
    number | undefined
  >()

  const yearMonthStr = currentMonth.format('YYYY-MM')
  const attendances =
    useLiveQuery(
      () => API.attendances.getByMonth(yearMonthStr),
      [yearMonthStr],
    ) || []
  const employeesList = useLiveQuery(() => API.employees.get()) || []
  const employeesMap = useMemo(() => {
    return employeesList.reduce(
      (acc, emp) => {
        acc[emp.id!] = emp.name
        return acc
      },
      {} as Record<number | string, string>,
    )
  }, [employeesList])

  // Filter attendances by selected employee (undefined = show all)
  const filteredAttendances = useMemo(() => {
    if (filterEmployeeId === undefined) return attendances
    return attendances.filter(
      record => record.employeeId === filterEmployeeId,
    )
  }, [attendances, filterEmployeeId])

  // Build employee options for the filter dropdown
  const employeeFilterOptions = useMemo(
    () =>
      employeesList
        .filter(emp => emp.id !== undefined)
        .map(emp => ({ value: emp.id as number, label: emp.name })),
    [employeesList],
  )

  const handleMonthChange = (date: Dayjs | null) => {
    if (date) setCurrentMonth(date)
  }

  const handlePrevMonth = () =>
    setCurrentMonth(prev => prev.subtract(1, 'month'))
  const handleNextMonth = () => setCurrentMonth(prev => prev.add(1, 'month'))

  const dateCellRender = (value: Dayjs) => {
    const dateStr = value.format('YYYY-MM-DD')
    const dayRecords = filteredAttendances.filter(
      record => record.date === dateStr,
    )

    return (
      <ul
        style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '12px' }}
      >
        {dayRecords.map(item => {
          const empName = employeesMap[item.employeeId] || 'Unknown'
          const vacation = isVacation(item)
          const inTime = item.clockIn
            ? dayjs(item.clockIn).format('HH:mm')
            : '??'
          const outTime = vacation
            ? '\u2014'
            : item.clockOut
              ? dayjs(item.clockOut).format('HH:mm')
              : '??'
          // Vacation records use 'error' (red) badge; regular use success/processing
          const badgeStatus = vacation
            ? 'error'
            : item.clockOut
              ? 'success'
              : 'processing'
          const badgeText = vacation
            ? `${empName} 休假`
            : `${empName} ${inTime} - ${outTime}`
          return (
            <li
              key={item.id}
              style={{
                cursor: 'pointer',
                marginBottom: 2,
                padding: 2,
                background: '#f0f0f0',
                borderRadius: 4,
              }}
              onClick={() => setSelectedRecord(item)}
            >
              <Badge status={badgeStatus} text={badgeText} />
            </li>
          )
        })}
      </ul>
    )
  }

  const tableColumns = [
    { title: '日期', dataIndex: 'date', key: 'date' },
    {
      title: '員工姓名',
      key: 'employeeName',
      render: (_: any, record: RestaDB.Table.Attendance) =>
        employeesMap[record.employeeId] || 'Unknown',
    },
    {
      title: '類型',
      key: 'type',
      render: (_: any, record: RestaDB.Table.Attendance) => getTypeLabel(record),
    },
    {
      title: '上班時間',
      key: 'clockIn',
      render: (_: any, record: RestaDB.Table.Attendance) =>
        record.clockIn ? dayjs(record.clockIn).format('HH:mm:ss') : '--',
    },
    {
      title: '下班時間',
      key: 'clockOut',
      render: (_: any, record: RestaDB.Table.Attendance) =>
        isVacation(record)
          ? '\u2014'
          : record.clockOut
            ? dayjs(record.clockOut).format('HH:mm:ss')
            : '--',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: RestaDB.Table.Attendance) => (
        <Button
          type="link"
          size="small"
          onClick={() => setSelectedRecord(record)}
        >
          修改
        </Button>
      ),
    },
  ]

  return (
    <div>
      <div
        style={{
          marginBottom: 16,
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <Space>
          <Button icon={<LeftOutlined />} onClick={handlePrevMonth} />
          <DatePicker
            picker="month"
            value={currentMonth}
            onChange={handleMonthChange}
            allowClear={false}
          />
          <Button icon={<RightOutlined />} onClick={handleNextMonth} />
          <Button
            icon={<PlusOutlined />}
            onClick={() => setAddModalOpen(true)}
          >
            新增打卡紀錄
          </Button>
        </Space>
        <Space>
          <Select
            placeholder="所有員工"
            allowClear
            value={filterEmployeeId}
            onChange={value => setFilterEmployeeId(value)}
            options={employeeFilterOptions}
            style={{ minWidth: 120 }}
          />
          <Radio.Group
            value={viewMode}
            onChange={e => setViewMode(e.target.value)}
          >
            <Radio.Button value="calendar">日曆</Radio.Button>
            <Radio.Button value="table">表格</Radio.Button>
          </Radio.Group>
        </Space>
      </div>

      {!attendances && <Spin />}

      {viewMode === 'calendar' ? (
        <Calendar
          value={currentMonth}
          onChange={date => setCurrentMonth(date)}
          cellRender={(current, info) => {
            if (info.type === 'date') return dateCellRender(current)
            return info.originNode
          }}
          headerRender={() => null}
        />
      ) : (
        <Table
          dataSource={filteredAttendances}
          columns={tableColumns}
          rowKey="id"
          pagination={{ pageSize: 20 }}
        />
      )}

      {selectedRecord && (
        <EditRecordModal
          record={selectedRecord}
          empName={employeesMap[selectedRecord.employeeId] || 'Unknown'}
          onCancel={() => setSelectedRecord(null)}
          onSuccess={() => setSelectedRecord(null)}
        />
      )}

      <AddRecordModal
        open={addModalOpen}
        onCancel={() => setAddModalOpen(false)}
        onSuccess={() => setAddModalOpen(false)}
        employees={employeesList}
        defaultDate={dayjs().format('YYYY-MM-DD')}
      />
    </div>
  )
}

export default Records
