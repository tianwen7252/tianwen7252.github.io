import { describe, it, expect, beforeEach, vi } from 'vitest'
import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import dayjs from 'dayjs'
import { EditRecordModal } from '../EditRecordModal'
import * as API from 'src/libs/api'

vi.mock('src/libs/api', () => ({
  attendances: {
    set: vi.fn().mockResolvedValue(undefined),
  },
}))

// Helper to find the clockOut form item input
const getClockOutInput = () => {
  const clockOutLabel = screen.getByText('下班時間')
  const formItem = clockOutLabel.closest('.ant-form-item')
  return formItem!.querySelector('input')
}

describe('EditRecordModal Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders correctly with given record', async () => {
    const mockRecord: RestaDB.Table.Attendance = {
      id: 101,
      employeeId: 1,
      date: '2023-10-10',
      clockIn: dayjs('2023-10-10T09:00:00Z').valueOf(),
      clockOut: dayjs('2023-10-10T18:00:00Z').valueOf(),
    }

    render(
      <EditRecordModal
        record={mockRecord}
        empName="Alice"
        onCancel={vi.fn()}
        onSuccess={vi.fn()}
      />,
    )

    expect(
      screen.getByText('修改打卡紀錄: Alice (2023-10-10)'),
    ).toBeInTheDocument()
  })

  it('shows vacation type label in modal title for vacation records', async () => {
    const mockRecord: RestaDB.Table.Attendance = {
      id: 102,
      employeeId: 1,
      date: '2023-10-11',
      clockIn: dayjs('2023-10-11T09:00:00Z').valueOf(),
      type: 'vacation',
    }

    render(
      <EditRecordModal
        record={mockRecord}
        empName="Alice"
        onCancel={vi.fn()}
        onSuccess={vi.fn()}
      />,
    )

    // Title should include the vacation label
    await waitFor(() => {
      expect(
        screen.getByText(/修改打卡紀錄: Alice \(2023-10-11\).*休假/),
      ).toBeInTheDocument()
    })
  })

  it('disables clockOut TimePicker for vacation records', async () => {
    const mockRecord: RestaDB.Table.Attendance = {
      id: 102,
      employeeId: 1,
      date: '2023-10-11',
      clockIn: dayjs('2023-10-11T09:00:00Z').valueOf(),
      type: 'vacation',
    }

    render(
      <EditRecordModal
        record={mockRecord}
        empName="Alice"
        onCancel={vi.fn()}
        onSuccess={vi.fn()}
      />,
    )

    // The clockOut time picker input should be disabled for vacation records
    await waitFor(() => {
      const input = getClockOutInput()
      expect(input).toHaveAttribute('disabled')
    })
  })

  it('does NOT disable clockOut TimePicker for regular records', async () => {
    const mockRecord: RestaDB.Table.Attendance = {
      id: 101,
      employeeId: 1,
      date: '2023-10-10',
      clockIn: dayjs('2023-10-10T09:00:00Z').valueOf(),
      clockOut: dayjs('2023-10-10T18:00:00Z').valueOf(),
      type: 'regular',
    }

    render(
      <EditRecordModal
        record={mockRecord}
        empName="Alice"
        onCancel={vi.fn()}
        onSuccess={vi.fn()}
      />,
    )

    await waitFor(() => {
      const input = getClockOutInput()
      expect(input).not.toHaveAttribute('disabled')
    })
  })

  it('does NOT disable clockOut TimePicker for records without type', async () => {
    const mockRecord: RestaDB.Table.Attendance = {
      id: 103,
      employeeId: 1,
      date: '2023-10-12',
      clockIn: dayjs('2023-10-12T08:00:00Z').valueOf(),
      clockOut: dayjs('2023-10-12T17:00:00Z').valueOf(),
    }

    render(
      <EditRecordModal
        record={mockRecord}
        empName="Bob"
        onCancel={vi.fn()}
        onSuccess={vi.fn()}
      />,
    )

    await waitFor(() => {
      const input = getClockOutInput()
      expect(input).not.toHaveAttribute('disabled')
    })
  })

  // --- New tests for attendance type Radio.Group ---

  describe('Attendance Type Radio.Group', () => {
    it('renders type radio group with "regular" selected by default when record has no type', async () => {
      const mockRecord: RestaDB.Table.Attendance = {
        id: 101,
        employeeId: 1,
        date: '2023-10-10',
        clockIn: dayjs('2023-10-10T09:00:00Z').valueOf(),
        clockOut: dayjs('2023-10-10T18:00:00Z').valueOf(),
      }

      render(
        <EditRecordModal
          record={mockRecord}
          empName="Alice"
          onCancel={vi.fn()}
          onSuccess={vi.fn()}
        />,
      )

      // Verify the radio group renders with both options
      await waitFor(() => {
        expect(screen.getByText('一般')).toBeInTheDocument()
        expect(screen.getByText('休假')).toBeInTheDocument()
      })

      // Verify "regular" radio is checked by default
      await waitFor(() => {
        const regularRadio = screen.getByLabelText('一般') as HTMLInputElement
        expect(regularRadio).toBeChecked()
      })
    })

    it('renders type radio group with "vacation" selected when record type is vacation', async () => {
      const mockRecord: RestaDB.Table.Attendance = {
        id: 102,
        employeeId: 1,
        date: '2023-10-11',
        clockIn: dayjs('2023-10-11T09:00:00Z').valueOf(),
        type: 'vacation',
      }

      render(
        <EditRecordModal
          record={mockRecord}
          empName="Alice"
          onCancel={vi.fn()}
          onSuccess={vi.fn()}
        />,
      )

      await waitFor(() => {
        const vacationRadio = screen.getByLabelText('休假') as HTMLInputElement
        expect(vacationRadio).toBeChecked()
      })
    })

    it('disables clockOut TimePicker when user selects vacation type', async () => {
      const mockRecord: RestaDB.Table.Attendance = {
        id: 101,
        employeeId: 1,
        date: '2023-10-10',
        clockIn: dayjs('2023-10-10T09:00:00Z').valueOf(),
        clockOut: dayjs('2023-10-10T18:00:00Z').valueOf(),
        type: 'regular',
      }

      render(
        <EditRecordModal
          record={mockRecord}
          empName="Alice"
          onCancel={vi.fn()}
          onSuccess={vi.fn()}
        />,
      )

      // Initially clockOut should be enabled
      await waitFor(() => {
        const input = getClockOutInput()
        expect(input).not.toHaveAttribute('disabled')
      })

      // Click the vacation radio button
      const vacationRadio = screen.getByLabelText('休假')
      fireEvent.click(vacationRadio)

      // ClockOut should now be disabled
      await waitFor(() => {
        const input = getClockOutInput()
        expect(input).toHaveAttribute('disabled')
      })
    })

    it('re-enables clockOut TimePicker when user selects regular type', async () => {
      const mockRecord: RestaDB.Table.Attendance = {
        id: 102,
        employeeId: 1,
        date: '2023-10-11',
        clockIn: dayjs('2023-10-11T09:00:00Z').valueOf(),
        type: 'vacation',
      }

      render(
        <EditRecordModal
          record={mockRecord}
          empName="Alice"
          onCancel={vi.fn()}
          onSuccess={vi.fn()}
        />,
      )

      // Initially clockOut should be disabled (vacation record)
      await waitFor(() => {
        const input = getClockOutInput()
        expect(input).toHaveAttribute('disabled')
      })

      // Click the regular radio button
      const regularRadio = screen.getByLabelText('一般')
      fireEvent.click(regularRadio)

      // ClockOut should now be enabled
      await waitFor(() => {
        const input = getClockOutInput()
        expect(input).not.toHaveAttribute('disabled')
      })
    })

    it('auto-clears clockOut value when user selects vacation type', async () => {
      const mockRecord: RestaDB.Table.Attendance = {
        id: 101,
        employeeId: 1,
        date: '2023-10-10',
        clockIn: dayjs('2023-10-10T09:00:00Z').valueOf(),
        clockOut: dayjs('2023-10-10T18:00:00Z').valueOf(),
        type: 'regular',
      }

      render(
        <EditRecordModal
          record={mockRecord}
          empName="Alice"
          onCancel={vi.fn()}
          onSuccess={vi.fn()}
        />,
      )

      // Wait for form to populate with clockOut value
      await waitFor(() => {
        const input = getClockOutInput()
        expect(input).not.toHaveAttribute('disabled')
        expect(input?.value).toBeTruthy()
      })

      // Switch to vacation type
      const vacationRadio = screen.getByLabelText('休假')
      fireEvent.click(vacationRadio)

      // ClockOut value should be cleared
      await waitFor(() => {
        const input = getClockOutInput()
        expect(input?.value).toBe('')
      })
    })

    it('includes type field in API.attendances.set call on save', async () => {
      const user = userEvent.setup()
      const mockOnSuccess = vi.fn()
      const mockRecord: RestaDB.Table.Attendance = {
        id: 101,
        employeeId: 1,
        date: '2023-10-10',
        clockIn: dayjs('2023-10-10T09:00:00Z').valueOf(),
        clockOut: dayjs('2023-10-10T18:00:00Z').valueOf(),
        type: 'regular',
      }

      render(
        <EditRecordModal
          record={mockRecord}
          empName="Alice"
          onCancel={vi.fn()}
          onSuccess={mockOnSuccess}
        />,
      )

      // Wait for form to be ready
      await waitFor(() => {
        expect(screen.getByText('一般')).toBeInTheDocument()
      })

      // Click the OK button to save
      const okButton = screen.getByRole('button', { name: /ok/i })
      await user.click(okButton)

      // Verify API was called with the type field
      await waitFor(() => {
        expect(API.attendances.set).toHaveBeenCalledWith(
          101,
          expect.objectContaining({ type: 'regular' }),
        )
      })
    })

    it('saves with vacation type when user switches to vacation', async () => {
      const user = userEvent.setup()
      const mockOnSuccess = vi.fn()
      const mockRecord: RestaDB.Table.Attendance = {
        id: 101,
        employeeId: 1,
        date: '2023-10-10',
        clockIn: dayjs('2023-10-10T09:00:00Z').valueOf(),
        clockOut: dayjs('2023-10-10T18:00:00Z').valueOf(),
        type: 'regular',
      }

      render(
        <EditRecordModal
          record={mockRecord}
          empName="Alice"
          onCancel={vi.fn()}
          onSuccess={mockOnSuccess}
        />,
      )

      // Wait for form to be ready
      await waitFor(() => {
        expect(screen.getByText('休假')).toBeInTheDocument()
      })

      // Switch to vacation type
      const vacationRadio = screen.getByLabelText('休假')
      fireEvent.click(vacationRadio)

      // Click the OK button to save
      const okButton = screen.getByRole('button', { name: /ok/i })
      await user.click(okButton)

      // Verify API was called with vacation type and no clockOut
      await waitFor(() => {
        expect(API.attendances.set).toHaveBeenCalledWith(
          101,
          expect.objectContaining({ type: 'vacation' }),
        )
      })
    })

    it('useEffect populates type field in form when record changes', async () => {
      const mockRecord: RestaDB.Table.Attendance = {
        id: 102,
        employeeId: 1,
        date: '2023-10-11',
        clockIn: dayjs('2023-10-11T09:00:00Z').valueOf(),
        type: 'vacation',
      }

      render(
        <EditRecordModal
          record={mockRecord}
          empName="Alice"
          onCancel={vi.fn()}
          onSuccess={vi.fn()}
        />,
      )

      // Verify the vacation radio is checked (meaning useEffect populated form with type)
      await waitFor(() => {
        const vacationRadio = screen.getByLabelText('休假') as HTMLInputElement
        expect(vacationRadio).toBeChecked()
      })
    })
  })
})
