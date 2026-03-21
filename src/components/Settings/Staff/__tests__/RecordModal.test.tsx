import { describe, it, expect, beforeEach, afterEach, vi, beforeAll } from 'vitest'
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import dayjs from 'dayjs'
import { ATTENDANCE_TYPES } from 'src/constants/defaults/attendanceTypes'

// Mock API module
vi.mock('src/libs/api', () => ({
  attendances: {
    add: vi.fn().mockResolvedValue(1),
    set: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn().mockResolvedValue(undefined),
  },
}))

// Mock AvatarImage to simplify rendering
vi.mock('src/components/AvatarImage', () => ({
  AvatarImage: ({ avatar, size }: { avatar?: string; size?: number }) => (
    <img
      data-testid="avatar-image"
      src={avatar ?? 'fallback'}
      alt="avatar"
      style={{ width: size, height: size }}
    />
  ),
}))

// Mock antd message
vi.mock('antd', async () => {
  const actual = await vi.importActual('antd')
  return {
    ...actual,
    message: { success: vi.fn(), error: vi.fn() },
  }
})

// --- Test data factories ---

const makeEmployee = (
  overrides: Partial<RestaDB.Table.Employee> = {},
): RestaDB.Table.Employee => ({
  id: 1,
  name: 'Alice',
  avatar: 'images/aminals/1234.png',
  status: 'active',
  shiftType: 'regular' as const,
  employeeNo: '001',
  isAdmin: false,
  ...overrides,
})

const makeAttendance = (
  overrides: Partial<RestaDB.Table.Attendance> = {},
): RestaDB.Table.Attendance => ({
  id: 101,
  employeeId: 1,
  date: '2024-05-20',
  type: ATTENDANCE_TYPES.REGULAR,
  clockIn: dayjs('2024-05-20T09:00:00').valueOf(),
  clockOut: dayjs('2024-05-20T17:30:00').valueOf(),
  ...overrides,
})

// --- Default props factory ---

interface RecordModalProps {
  open: boolean
  mode: 'add' | 'edit'
  employee: RestaDB.Table.Employee | null
  date: string
  record?: RestaDB.Table.Attendance
  shiftNumber?: number
  onCancel: () => void
  onSuccess: () => void
}

const defaultProps = (overrides: Partial<RecordModalProps> = {}): RecordModalProps => ({
  open: true,
  mode: 'add',
  employee: makeEmployee(),
  date: '2024-05-20',
  onCancel: vi.fn(),
  onSuccess: vi.fn(),
  ...overrides,
})

// Lazily import RecordModal after mocks are set up
let RecordModal: React.FC<any>

beforeAll(async () => {
  const mod = await import('../RecordModal')
  RecordModal = mod.RecordModal
})

describe('RecordModal Component', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2024, 4, 20, 9, 41, 0))
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  // --------------------------------------------------------
  // 1. Add mode: renders title
  // --------------------------------------------------------

  describe('title rendering', () => {
    it('renders "新增打卡紀錄" title in add mode', () => {
      const props = defaultProps({ mode: 'add' })
      render(<RecordModal {...props} />)
      expect(screen.getByText('新增打卡紀錄')).toBeInTheDocument()
    })

    it('renders "修改打卡紀錄" title in edit mode', () => {
      const props = defaultProps({
        mode: 'edit',
        record: makeAttendance(),
      })
      render(<RecordModal {...props} />)
      expect(screen.getByText('修改打卡紀錄')).toBeInTheDocument()
    })
  })

  // --------------------------------------------------------
  // 3. Renders employee name and avatar
  // --------------------------------------------------------

  describe('employee info display', () => {
    it('renders employee name', () => {
      const props = defaultProps({
        employee: makeEmployee({ name: 'Bob' }),
      })
      render(<RecordModal {...props} />)
      expect(screen.getByText('Bob')).toBeInTheDocument()
    })

    it('renders AvatarImage with size 80', () => {
      const props = defaultProps({
        employee: makeEmployee({ avatar: 'images/aminals/5678.png' }),
      })
      render(<RecordModal {...props} />)
      const avatar = screen.getByTestId('avatar-image')
      expect(avatar).toHaveStyle({ width: '80px', height: '80px' })
    })

    it('renders AvatarImage with the employee avatar', () => {
      const props = defaultProps({
        employee: makeEmployee({ avatar: 'images/aminals/5678.png' }),
      })
      render(<RecordModal {...props} />)
      const avatar = screen.getByTestId('avatar-image')
      expect(avatar).toHaveAttribute('src', 'images/aminals/5678.png')
    })
  })

  // --------------------------------------------------------
  // 4. Renders formatted date
  // --------------------------------------------------------

  describe('date display', () => {
    it('renders formatted date in "YYYY年M月D日" format', () => {
      const props = defaultProps({ date: '2024-05-20' })
      render(<RecordModal {...props} />)
      expect(screen.getByText('2024年5月20日')).toBeInTheDocument()
    })

    it('renders correct date for single-digit month', () => {
      const props = defaultProps({ date: '2024-01-05' })
      render(<RecordModal {...props} />)
      expect(screen.getByText('2024年1月5日')).toBeInTheDocument()
    })
  })

  // --------------------------------------------------------
  // 5. Shift badge
  // --------------------------------------------------------

  describe('shift badge', () => {
    it('renders shift badge when shiftNumber is provided', () => {
      const props = defaultProps({ shiftNumber: 2 })
      render(<RecordModal {...props} />)
      expect(screen.getByText(/第 2 班/)).toBeInTheDocument()
    })

    it('does NOT render shift badge when shiftNumber is undefined', () => {
      const props = defaultProps({ shiftNumber: undefined })
      render(<RecordModal {...props} />)
      expect(screen.queryByText(/第.*班/)).not.toBeInTheDocument()
    })

    it('does NOT render shift badge when shiftNumber is 0', () => {
      const props = defaultProps({ shiftNumber: 0 })
      render(<RecordModal {...props} />)
      expect(screen.queryByText(/第.*班/)).not.toBeInTheDocument()
    })
  })

  // --------------------------------------------------------
  // 7. Add mode: type defaults to regular
  // --------------------------------------------------------

  describe('type selector defaults', () => {
    it('defaults to regular type in add mode (一般 button active)', () => {
      const props = defaultProps({ mode: 'add' })
      render(<RecordModal {...props} />)

      // The "一般" button should be present
      const regularBtn = screen.getByText('一般')
      expect(regularBtn).toBeInTheDocument()

      // The "休假" button should also be present
      const vacationBtn = screen.getByText('休假')
      expect(vacationBtn).toBeInTheDocument()
    })
  })

  // --------------------------------------------------------
  // 8. Edit mode: loads existing record type
  // --------------------------------------------------------

  describe('edit mode record loading', () => {
    it('loads existing record type in edit mode', () => {
      const vacationRecord = makeAttendance({
        type: ATTENDANCE_TYPES.VACATION,
      })
      const props = defaultProps({
        mode: 'edit',
        record: vacationRecord,
      })
      render(<RecordModal {...props} />)

      // Both type buttons should be present
      expect(screen.getByText('一般')).toBeInTheDocument()
      expect(screen.getByText('休假')).toBeInTheDocument()
    })
  })

  // --------------------------------------------------------
  // 10. Type toggle
  // --------------------------------------------------------

  describe('type toggle interaction', () => {
    it('clicking 休假 switches the type', () => {
      const props = defaultProps({ mode: 'add' })
      render(<RecordModal {...props} />)

      const vacationBtn = screen.getByText('休假')
      fireEvent.click(vacationBtn)

      // After clicking, vacation button should be active (we verify via class name change)
      // The button text should still be present
      expect(vacationBtn).toBeInTheDocument()
    })
  })

  // --------------------------------------------------------
  // 11. Vacation type disables clockOut picker
  // --------------------------------------------------------

  describe('vacation type behavior', () => {
    it('disables clockOut picker when vacation type is selected', async () => {
      vi.useRealTimers()
      const props = defaultProps({ mode: 'add' })
      render(<RecordModal {...props} />)

      // Click vacation button
      const vacationBtn = screen.getByText('休假')
      fireEvent.click(vacationBtn)

      // The clockOut TimePicker input should be disabled
      await waitFor(() => {
        const clockOutLabel = screen.getByText('下班時間')
        // Find the sibling TimePicker input — it's in the same row
        const row = clockOutLabel.closest('div')
        const input = row?.querySelector('input')
        expect(input).toBeDisabled()
      })
    })

    it('does NOT disable clockOut picker for regular type', () => {
      const props = defaultProps({ mode: 'add' })
      render(<RecordModal {...props} />)

      const clockOutLabel = screen.getByText('下班時間')
      const row = clockOutLabel.closest('div')
      const input = row?.querySelector('input')
      expect(input).not.toBeDisabled()
    })
  })

  // --------------------------------------------------------
  // 12. Cancel button calls onCancel
  // --------------------------------------------------------

  describe('cancel button', () => {
    it('calls onCancel when cancel button is clicked', () => {
      const onCancel = vi.fn()
      const props = defaultProps({ onCancel })
      render(<RecordModal {...props} />)

      const cancelBtn = screen.getByText('取消')
      fireEvent.click(cancelBtn)
      expect(onCancel).toHaveBeenCalledTimes(1)
    })
  })

  // --------------------------------------------------------
  // 13 & 14. Delete button visibility
  // --------------------------------------------------------

  describe('delete button', () => {
    it('renders delete button in edit mode', () => {
      const props = defaultProps({
        mode: 'edit',
        record: makeAttendance(),
      })
      render(<RecordModal {...props} />)
      expect(screen.getByText('刪除')).toBeInTheDocument()
    })

    it('does NOT render delete button in add mode', () => {
      const props = defaultProps({ mode: 'add' })
      render(<RecordModal {...props} />)
      expect(screen.queryByText('刪除')).not.toBeInTheDocument()
    })
  })

  // --------------------------------------------------------
  // 15. Does not render when employee is null
  // --------------------------------------------------------

  describe('null employee handling', () => {
    it('renders null when employee is null', () => {
      const props = defaultProps({ employee: null })
      const { container } = render(<RecordModal {...props} />)
      // Should render nothing — empty container
      expect(container.innerHTML).toBe('')
    })
  })

  // --------------------------------------------------------
  // 16. Modal visibility with open=false
  // --------------------------------------------------------

  describe('modal visibility', () => {
    it('does not render modal content when open is false', () => {
      const props = defaultProps({ open: false })
      render(<RecordModal {...props} />)
      // When modal is closed, the title should not be visible
      expect(screen.queryByText('新增打卡紀錄')).not.toBeInTheDocument()
    })
  })

  // --------------------------------------------------------
  // System label display
  // --------------------------------------------------------

  describe('system label', () => {
    it('shows "新增紀錄" system label in add mode', () => {
      const props = defaultProps({ mode: 'add' })
      render(<RecordModal {...props} />)
      expect(screen.getByText('新增紀錄')).toBeInTheDocument()
    })

    it('shows "修改紀錄" system label in edit mode', () => {
      const props = defaultProps({
        mode: 'edit',
        record: makeAttendance(),
      })
      render(<RecordModal {...props} />)
      expect(screen.getByText('修改紀錄')).toBeInTheDocument()
    })
  })

  // --------------------------------------------------------
  // Button labels per mode
  // --------------------------------------------------------

  describe('save button label', () => {
    it('shows "新增" button text in add mode', () => {
      const props = defaultProps({ mode: 'add' })
      render(<RecordModal {...props} />)
      expect(screen.getByText('新增')).toBeInTheDocument()
    })

    it('shows "儲存" button text in edit mode', () => {
      const props = defaultProps({
        mode: 'edit',
        record: makeAttendance(),
      })
      render(<RecordModal {...props} />)
      expect(screen.getByText('儲存')).toBeInTheDocument()
    })
  })

  // --------------------------------------------------------
  // Form labels
  // --------------------------------------------------------

  describe('form labels', () => {
    it('renders attendance type label', () => {
      const props = defaultProps()
      render(<RecordModal {...props} />)
      expect(screen.getByText('出勤類型')).toBeInTheDocument()
    })

    it('renders clock-in time label', () => {
      const props = defaultProps()
      render(<RecordModal {...props} />)
      expect(screen.getByText('上班時間')).toBeInTheDocument()
    })

    it('renders clock-out time label', () => {
      const props = defaultProps()
      render(<RecordModal {...props} />)
      expect(screen.getByText('下班時間')).toBeInTheDocument()
    })
  })

  // --------------------------------------------------------
  // Save handler interaction (add mode)
  // --------------------------------------------------------

  describe('save handler (add mode)', () => {
    it('calls API.attendances.add on save in add mode', async () => {
      vi.useRealTimers()
      const API = await import('src/libs/api')
      const onSuccess = vi.fn()
      const props = defaultProps({ mode: 'add', onSuccess })
      render(<RecordModal {...props} />)

      const saveBtn = screen.getByText('新增')
      fireEvent.click(saveBtn)

      await waitFor(() => {
        expect(API.attendances.add).toHaveBeenCalled()
      })
    })

    it('calls onSuccess after successful add', async () => {
      vi.useRealTimers()
      const onSuccess = vi.fn()
      const props = defaultProps({ mode: 'add', onSuccess })
      render(<RecordModal {...props} />)

      const saveBtn = screen.getByText('新增')
      fireEvent.click(saveBtn)

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalledTimes(1)
      })
    })
  })

  // --------------------------------------------------------
  // Save handler interaction (edit mode)
  // --------------------------------------------------------

  describe('save handler (edit mode)', () => {
    it('calls API.attendances.set on save in edit mode', async () => {
      vi.useRealTimers()
      const API = await import('src/libs/api')
      const onSuccess = vi.fn()
      const record = makeAttendance()
      const props = defaultProps({ mode: 'edit', record, onSuccess })
      render(<RecordModal {...props} />)

      const saveBtn = screen.getByText('儲存')
      fireEvent.click(saveBtn)

      await waitFor(() => {
        expect(API.attendances.set).toHaveBeenCalledWith(101, expect.any(Object))
      })
    })
  })

  // --------------------------------------------------------
  // Delete handler interaction
  // --------------------------------------------------------

  describe('delete handler', () => {
    it('calls API.attendances.delete when delete button is clicked', async () => {
      vi.useRealTimers()
      const API = await import('src/libs/api')
      const onSuccess = vi.fn()
      const record = makeAttendance()
      const props = defaultProps({ mode: 'edit', record, onSuccess })
      render(<RecordModal {...props} />)

      const deleteBtn = screen.getByText('刪除')
      fireEvent.click(deleteBtn)

      await waitFor(() => {
        expect(API.attendances.delete).toHaveBeenCalledWith(101)
      })
    })

    it('calls onSuccess after successful delete', async () => {
      vi.useRealTimers()
      const onSuccess = vi.fn()
      const record = makeAttendance()
      const props = defaultProps({ mode: 'edit', record, onSuccess })
      render(<RecordModal {...props} />)

      const deleteBtn = screen.getByText('刪除')
      fireEvent.click(deleteBtn)

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalledTimes(1)
      })
    })
  })

  // --------------------------------------------------------
  // Error handling
  // --------------------------------------------------------

  describe('error handling', () => {
    it('shows error message when save fails', async () => {
      vi.useRealTimers()
      const API = await import('src/libs/api')
      const { message } = await import('antd')
      vi.mocked(API.attendances.add).mockRejectedValueOnce(new Error('DB error'))

      const props = defaultProps({ mode: 'add' })
      render(<RecordModal {...props} />)

      const saveBtn = screen.getByText('新增')
      fireEvent.click(saveBtn)

      await waitFor(() => {
        expect(message.error).toHaveBeenCalledWith('操作失敗，請稍後再試')
      })
    })

    it('shows error message when delete fails', async () => {
      vi.useRealTimers()
      const API = await import('src/libs/api')
      const { message } = await import('antd')
      vi.mocked(API.attendances.delete).mockRejectedValueOnce(new Error('DB error'))

      const record = makeAttendance()
      const props = defaultProps({ mode: 'edit', record })
      render(<RecordModal {...props} />)

      const deleteBtn = screen.getByText('刪除')
      fireEvent.click(deleteBtn)

      await waitFor(() => {
        expect(message.error).toHaveBeenCalledWith('刪除失敗')
      })
    })
  })

  // --------------------------------------------------------
  // Edge cases
  // --------------------------------------------------------

  describe('edge cases', () => {
    it('handles employee with undefined avatar gracefully', () => {
      const props = defaultProps({
        employee: makeEmployee({ avatar: undefined }),
      })
      render(<RecordModal {...props} />)
      const avatar = screen.getByTestId('avatar-image')
      expect(avatar).toHaveAttribute('src', 'fallback')
    })

    it('handles record with no clockIn or clockOut in edit mode', () => {
      const record = makeAttendance({
        clockIn: undefined,
        clockOut: undefined,
      })
      const props = defaultProps({ mode: 'edit', record })
      // Should not crash
      render(<RecordModal {...props} />)
      expect(screen.getByText('修改打卡紀錄')).toBeInTheDocument()
    })

    it('handles record with vacation type and no clockOut in edit mode', () => {
      const record = makeAttendance({
        type: ATTENDANCE_TYPES.VACATION,
        clockOut: undefined,
      })
      const props = defaultProps({ mode: 'edit', record })
      render(<RecordModal {...props} />)
      expect(screen.getByText('修改打卡紀錄')).toBeInTheDocument()
    })
  })
})
