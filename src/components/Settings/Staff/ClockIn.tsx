import React, { useMemo } from 'react'
import { Card, Space, Badge, Popconfirm, message } from 'antd'
import { useLiveQuery } from 'dexie-react-hooks'
import dayjs from 'dayjs'
import * as API from 'src/libs/api'
import { AvatarImage } from 'src/components/AvatarImage'
import { styles } from './styles'

function formatTime(ts?: number) {
  return ts ? dayjs(ts).format('HH:mm') : '--:--'
}

export const ClockIn: React.FC = () => {
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

  const handleClockInOrOut = async (employee: RestaDB.Table.Employee) => {
    const record = attendanceMap[employee.id!]

    if (!record) {
      await API.attendances.add({
        employeeId: employee.id!,
        date: today,
        clockIn: dayjs().valueOf(),
      })
      message.success(`${employee.name} 上班打卡成功: ${dayjs().format('HH:mm:ss')}`)
    } else if (!record.clockOut) {
      await API.attendances.set(record.id!, {
        clockOut: dayjs().valueOf(),
      })
      message.success(`${employee.name} 下班打卡成功: ${dayjs().format('HH:mm:ss')}`)
    }
  }

  return (
    <div className={styles.wrapCss}>
      <Space wrap size={[16, 16]}>
        {employees.map(employee => {
          const record = attendanceMap[employee.id!]
          const fullyDone = !!(record?.clockIn && record?.clockOut)

          const badgeStatus = !record ? 'default' : record.clockOut ? 'success' : 'processing'
          const badgeText = !record ? '未打卡' : record.clockOut ? '已下班' : '已上班'

          const popTitle = !record
            ? `確定 ${employee.name} 上班打卡？`
            : `確定 ${employee.name} 下班打卡？`

          const cardContent = (
            <Card hoverable className={styles.cardCss}>
              <div className={styles.avatarCss}>
                <AvatarImage avatar={employee.avatar} size={40} />
              </div>
              <div className={styles.nameCss}>{employee.name}</div>
              <Badge status={badgeStatus} text={badgeText} />
              <div className={styles.timesCss}>
                <div>上班：{formatTime(record?.clockIn)}</div>
                <div>下班：{formatTime(record?.clockOut)}</div>
              </div>
            </Card>
          )

          if (fullyDone) {
            return (
              <div
                key={employee.id}
                onClick={() => message.warning(`${employee.name} 今日已完成上下班打卡`)}
              >
                {cardContent}
              </div>
            )
          }

          return (
            <Popconfirm
              key={employee.id}
              title={popTitle}
              onConfirm={() => handleClockInOrOut(employee)}
              okText="確定"
              cancelText="取消"
            >
              {cardContent}
            </Popconfirm>
          )
        })}
        {employees.length === 0 && (
          <span style={{ color: '#999' }}>目前無員工資料，請前往「員工管理」頁面新增員工</span>
        )}
      </Space>
    </div>
  )
}

export default ClockIn
