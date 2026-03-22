/**
 * ClockIn — employee card grid for clock-in/out operations.
 * Ported from V1 ClockIn with V2 Tailwind CSS, mock data services, and ClockInModal.
 */

import { useState, useMemo, useCallback, useEffect } from 'react'
import dayjs from 'dayjs'
import { motion } from 'framer-motion'
import { Info } from 'lucide-react'
import { cn } from '@/lib/cn'
import { AvatarImage } from '@/components/avatar-image'
import { calcTotalHours, formatTotalHours } from '@/lib/attendance-utils'
import { WEEKDAY_SHORT } from '@/lib/records-utils'
import { api } from '@/api'
import { ClockInModal } from '@/components/clock-in-modal'
import type { ClockInAction } from '@/components/clock-in-modal'
import type { Employee, Attendance } from '@/lib/schemas'

// ─── Types ──────────────────────────────────────────────────────────────────

interface ModalState {
  readonly visible: boolean
  readonly employee: Employee | null
  readonly action: ClockInAction
  readonly attendance?: Attendance
}

// ─── Constants ──────────────────────────────────────────────────────────────

const BADGE_COLORS = {
  default: '#dbe3d2',
  clockedIn: '#7f956a',
  clockedOut: '#cab3f3',
  vacation: '#f88181',
} as const

// ─── Pure Helper Functions ──────────────────────────────────────────────────

/** Format a timestamp to HH:mm, or return placeholder when absent. */
function formatTime(ts?: number): string {
  return ts ? dayjs(ts).format('HH:mm') : '?? : ??'
}

/** Derive the correct action from an employee's attendance records. */
function deriveCardAction(records: readonly Attendance[]): ClockInAction {
  if (records.length === 0) return 'clockIn'
  const lastRecord = records[records.length - 1]!
  if (lastRecord.type !== 'regular') return 'cancelVacation'
  // Completed shift (both clockIn and clockOut) -> start new shift
  if (lastRecord.clockIn !== undefined && lastRecord.clockOut !== undefined)
    return 'clockIn'
  // Only clockIn exists -> clock out
  return 'clockOut'
}

/** Determine status badge configuration from attendance records. */
function deriveStatus(records: readonly Attendance[]): {
  badgeColor: string
  badgeText: string
} {
  if (records.length === 0) {
    return { badgeColor: BADGE_COLORS.default, badgeText: '未打卡' }
  }
  const lastRecord = records[records.length - 1]!
  if (lastRecord.type !== 'regular') {
    return { badgeColor: BADGE_COLORS.vacation, badgeText: '休假' }
  }
  if (lastRecord.clockOut) {
    return { badgeColor: BADGE_COLORS.clockedOut, badgeText: '已下班' }
  }
  return { badgeColor: BADGE_COLORS.clockedIn, badgeText: '正在上班' }
}

/** Determine avatar border color from attendance state. */
function deriveBorderColor(records: readonly Attendance[]): string {
  if (records.length === 0) return BADGE_COLORS.default
  const lastRecord = records[records.length - 1]!
  if (lastRecord.type !== 'regular') return BADGE_COLORS.vacation
  if (lastRecord.clockOut) return BADGE_COLORS.clockedOut
  return BADGE_COLORS.clockedIn
}

/** Determine card background class from attendance state. */
function deriveCardBgClass(records: readonly Attendance[]): string {
  if (records.length === 0) return ''
  const lastRecord = records[records.length - 1]!
  const isVacation = lastRecord.type !== 'regular'
  if (isVacation) return 'bg-[#fef2f2]'
  const action = deriveCardAction(records)
  if (action === 'clockOut') return 'bg-[#f0f5eb]'
  // Clocked out (completed shift, action === 'clockIn')
  return 'bg-[#f5f0fa]'
}

// ─── Card Sub-component ─────────────────────────────────────────────────────

interface EmployeeCardProps {
  readonly employee: Employee
  readonly records: readonly Attendance[]
  readonly onCardClick: (
    employee: Employee,
    records: readonly Attendance[],
  ) => void
  readonly onButtonAction: (
    e: React.MouseEvent,
    employee: Employee,
    action: ClockInAction,
    record?: Attendance,
  ) => void
}

function EmployeeCard({
  employee,
  records,
  onCardClick,
  onButtonAction,
}: EmployeeCardProps) {
  const { badgeColor, badgeText } = deriveStatus(records)
  const borderColor = deriveBorderColor(records)
  const cardBgClass = deriveCardBgClass(records)
  const lastRecord =
    records.length > 0 ? records[records.length - 1] : undefined
  const isVacation = lastRecord !== undefined && lastRecord.type !== 'regular'
  const totalHours = calcTotalHours(records)
  const action = deriveCardAction(records)
  const isClockedIn = records.length > 0 && !isVacation && action === 'clockOut'
  const isClockedOut = records.length > 0 && !isVacation && action === 'clockIn'

  return (
    <motion.div
      className={cn(
        'cursor-pointer rounded-xl border border-border bg-card px-2.5 py-5 text-center flex flex-col shadow-[0_1px_3px_rgba(0,0,0,0.08)] transition-shadow hover:shadow-md',
        cardBgClass,
      )}
      data-testid="employee-card"
      role="button"
      tabIndex={0}
      aria-label={`${employee.name} 打卡 — ${badgeText}`}
      onClick={() => onCardClick(employee, records)}
      onKeyDown={e => e.key === 'Enter' && onCardClick(employee, records)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      style={{ willChange: 'transform' }}
    >
      {/* Avatar with colored border */}
      <div className="mx-auto mb-3">
        <div
          className="inline-block rounded-full p-0.5"
          style={{ border: `3px solid ${borderColor}` }}
        >
          <AvatarImage avatar={employee.avatar} size={80} />
        </div>
      </div>

      {/* Name */}
      <div className="text-[16px] font-semibold" style={{ color: '#1a202c' }}>
        {employee.name}
      </div>

      {/* Admin label — always rendered for consistent card height */}
      <div
        className="h-5 text-sm text-muted-foreground"
        style={{ color: '#7f956a' }}
      >
        {employee.isAdmin ? '管理員' : ''}
      </div>

      {/* Status badge */}
      <div className="my-2 flex items-center justify-center gap-1.5">
        <span
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: badgeColor }}
        />
        <span className="text-sm text-muted-foreground">{badgeText}</span>
      </div>

      {/* Clock times */}
      {isVacation ? (
        <div className="space-y-1 text-sm" style={{ color: '#718096' }}>
          <div>休假：{formatTime(lastRecord?.clockIn)}</div>
        </div>
      ) : (
        <div className="space-y-1 text-sm" style={{ color: '#718096' }}>
          {records.map((shift, index) => (
            <div key={shift.id ?? index}>
              上班：{formatTime(shift.clockIn)} 下班：
              {formatTime(shift.clockOut)}
            </div>
          ))}
          {records.length === 0 && (
            <>
              <div>上班：{formatTime(undefined)}</div>
              <div>下班：{formatTime(undefined)}</div>
            </>
          )}
        </div>
      )}

      {/* Total hours */}
      {totalHours > 0 && (
        <div
          className="mt-2 text-sm font-semibold"
          style={{ color: '#7f956a' }}
        >
          總工時: {formatTotalHours(totalHours)}
        </div>
      )}

      {/* Action buttons */}
      <div className="mt-auto pt-3 flex justify-center gap-2">
        {records.length === 0 && (
          <>
            <button
              type="button"
              className="rounded-lg bg-[#7f956a] px-3 py-1.5 text-sm font-semibold text-white hover:bg-[#6b8058]"
              onClick={e => onButtonAction(e, employee, 'clockIn', undefined)}
            >
              打卡上班
            </button>
            <button
              type="button"
              className="rounded-lg bg-[#f88181] px-3 py-1.5 text-sm font-semibold text-white hover:bg-[#e06868]"
              onClick={e => onButtonAction(e, employee, 'vacation', undefined)}
            >
              申請休假
            </button>
          </>
        )}
        {isClockedIn && (
          <button
            type="button"
            className="rounded-lg bg-[#7f956a] px-3 py-1.5 text-sm font-semibold text-white hover:bg-[#6b8058]"
            onClick={e => onButtonAction(e, employee, 'clockOut', lastRecord)}
          >
            打卡下班
          </button>
        )}
        {isClockedOut && (
          <button
            type="button"
            className="rounded-lg bg-[#7f956a] px-3 py-1.5 text-sm font-semibold text-white hover:bg-[#6b8058]"
            onClick={e => onButtonAction(e, employee, 'clockIn', undefined)}
          >
            打卡上班
          </button>
        )}
        {isVacation && (
          <button
            type="button"
            className="rounded-lg bg-gray-400 px-3 py-1.5 text-sm font-semibold text-white hover:bg-gray-500"
            onClick={e =>
              onButtonAction(e, employee, 'cancelVacation', lastRecord)
            }
          >
            取消休假
          </button>
        )}
      </div>
    </motion.div>
  )
}

// ─── Main Component ─────────────────────────────────────────────────────────

export function ClockIn() {
  // Auto-update date at midnight
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

  // Data sources — refreshKey forces re-fetch after mutations
  const [refreshKey, setRefreshKey] = useState(0)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const allEmployees = useMemo(() => api.employees.getAll(), [refreshKey])
  const employees = useMemo(
    () => allEmployees.filter(e => !e.resignationDate),
    [allEmployees],
  )

  const todayAttendances = useMemo(
    () => api.attendances.getByDate(today),
    [today, refreshKey],
  )

  // Build O(1) lookup from employeeId -> attendance records
  const attendanceMap = useMemo(
    () =>
      todayAttendances.reduce<Record<string, readonly Attendance[]>>(
        (map, r) => ({
          ...map,
          [r.employeeId]: [...(map[r.employeeId] ?? []), r],
        }),
        {},
      ),
    [todayAttendances],
  )

  // Modal state
  const [modalState, setModalState] = useState<ModalState>({
    visible: false,
    employee: null,
    action: 'clockIn',
  })
  const [loading, setLoading] = useState(false)

  // Header title
  const todayDayjs = dayjs(today)
  const headerTitle = `今天: ${todayDayjs.format('YYYY/M/D')} (${WEEKDAY_SHORT[todayDayjs.day()]})`

  // Handlers
  const handleCardClick = useCallback(
    (employee: Employee, records: readonly Attendance[]) => {
      const action = deriveCardAction(records)
      const lastRecord =
        records.length > 0 ? records[records.length - 1] : undefined
      setModalState({
        visible: true,
        employee,
        action,
        attendance:
          action === 'clockOut' || action === 'cancelVacation'
            ? lastRecord
            : undefined,
      })
    },
    [],
  )

  const handleButtonAction = useCallback(
    (
      e: React.MouseEvent,
      employee: Employee,
      action: ClockInAction,
      record?: Attendance,
    ) => {
      e.stopPropagation()
      setModalState({
        visible: true,
        employee,
        action,
        attendance: record,
      })
    },
    [],
  )

  const handleModalClose = useCallback(() => {
    setModalState({
      visible: false,
      employee: null,
      action: 'clockIn',
    })
  }, [])

  const handleConfirm = useCallback(async () => {
    const { employee: emp, action, attendance: record } = modalState
    if (!emp?.id) return

    setLoading(true)
    try {
      const now = dayjs()
      const currentDate = now.format('YYYY-MM-DD')

      switch (action) {
        case 'clockIn':
          api.attendances.add({
            employeeId: emp.id,
            date: currentDate,
            clockIn: now.valueOf(),
            type: 'regular',
          })
          break

        case 'clockOut':
          if (record?.id != null) {
            api.attendances.update(record.id, {
              clockOut: now.valueOf(),
            })
          }
          break

        case 'vacation':
          api.attendances.add({
            employeeId: emp.id,
            date: currentDate,
            clockIn: now.valueOf(),
            type: 'paid_leave',
          })
          break

        case 'cancelVacation':
          if (record?.id != null) {
            api.attendances.remove(record.id)
          }
          break
      }
      setRefreshKey(k => k + 1)
      handleModalClose()
    } finally {
      setLoading(false)
    }
  }, [modalState, handleModalClose])

  return (
    <div className="p-4">
      {/* Section header */}
      <div className="mb-4 flex items-center justify-between">
        <span className="text-xl font-medium">{headerTitle}</span>
        <span className="flex items-center gap-1 text-sm text-muted-foreground">
          <Info size={14} /> 點選員工即可打卡
        </span>
      </div>

      {/* Card grid */}
      <div
        className="grid gap-4"
        style={{
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        }}
      >
        {employees.map(employee => {
          const records = attendanceMap[employee.id] ?? []
          return (
            <EmployeeCard
              key={employee.id}
              employee={employee}
              records={records}
              onCardClick={handleCardClick}
              onButtonAction={handleButtonAction}
            />
          )
        })}

        {employees.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground">
            目前無員工資料，請前往「員工管理」頁面新增員工
          </div>
        )}
      </div>

      {/* Confirmation modal */}
      <ClockInModal
        open={modalState.visible}
        employee={modalState.employee}
        action={modalState.action}
        attendance={modalState.attendance}
        loading={loading}
        onConfirm={handleConfirm}
        onCancel={handleModalClose}
      />
    </div>
  )
}
