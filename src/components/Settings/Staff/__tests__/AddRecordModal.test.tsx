import { describe, it, expect, beforeEach, vi } from 'vitest'
import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import dayjs from 'dayjs'
import { AddRecordModal } from '../AddRecordModal'
import * as API from 'src/libs/api'

vi.mock('src/libs/api', () => ({
  attendances: {
    add: vi.fn().mockResolvedValue(1),
  },
}))

// Helper to find a form item input by its label text
const getFormItemInput = (labelText: string) => {
  const label = screen.getByText(labelText)
  const formItem = label.closest('.ant-form-item')
  return formItem!.querySelector('input')
}

const mockEmployees: RestaDB.Table.Employee[] = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
  { id: 3, name: 'Charlie' },
]

const defaultProps = {
  open: true,
  onCancel: vi.fn(),
  onSuccess: vi.fn(),
  employees: mockEmployees,
}

describe('AddRecordModal Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // --- Rendering Tests ---

  it('renders nothing when open is false', () => {
    render(<AddRecordModal {...defaultProps} open={false} />)

    expect(screen.queryByText('新增打卡紀錄')).not.toBeInTheDocument()
  })

  it('renders modal with title when open is true', () => {
    render(<AddRecordModal {...defaultProps} />)

    expect(screen.getByText('新增打卡紀錄')).toBeInTheDocument()
  })

  it('renders all form fields: employee select, date picker, type radio, time pickers', async () => {
    render(<AddRecordModal {...defaultProps} />)

    // Employee selector label
    expect(screen.getByText('員工')).toBeInTheDocument()
    // Date picker label
    expect(screen.getByText('日期')).toBeInTheDocument()
    // Type radio label
    expect(screen.getByText('出勤類型')).toBeInTheDocument()
    // Radio options
    expect(screen.getByText('一般')).toBeInTheDocument()
    expect(screen.getByText('休假')).toBeInTheDocument()
    // Time picker labels
    expect(screen.getByText('上班時間')).toBeInTheDocument()
    expect(screen.getByText('下班時間')).toBeInTheDocument()
  })

  // --- Default Values Tests ---

  it('defaults type radio to "regular"', async () => {
    render(<AddRecordModal {...defaultProps} />)

    await waitFor(() => {
      const regularRadio = screen.getByLabelText('一般') as HTMLInputElement
      expect(regularRadio).toBeChecked()
    })
  })

  it('pre-fills employee from defaultEmployeeId', async () => {
    render(
      <AddRecordModal
        {...defaultProps}
        defaultEmployeeId={2}
      />,
    )

    // The Select component should display "Bob" (employee with id 2)
    await waitFor(() => {
      expect(screen.getByTitle('Bob')).toBeInTheDocument()
    })
  })

  it('pre-fills date from defaultDate prop', async () => {
    render(
      <AddRecordModal
        {...defaultProps}
        defaultDate="2025-12-25"
      />,
    )

    // The DatePicker should display the formatted date
    await waitFor(() => {
      const dateInput = getFormItemInput('日期')
      expect(dateInput?.value).toBe('2025-12-25')
    })
  })

  // --- Vacation Mode Tests ---

  it('disables clockOut TimePicker when vacation type is selected', async () => {
    render(<AddRecordModal {...defaultProps} />)

    // Initially clockOut should be enabled
    await waitFor(() => {
      const clockOutInput = getFormItemInput('下班時間')
      expect(clockOutInput).not.toHaveAttribute('disabled')
    })

    // Click the vacation radio button
    const vacationRadio = screen.getByLabelText('休假')
    fireEvent.click(vacationRadio)

    // ClockOut should now be disabled
    await waitFor(() => {
      const clockOutInput = getFormItemInput('下班時間')
      expect(clockOutInput).toHaveAttribute('disabled')
    })
  })

  it('re-enables clockOut TimePicker when switching back to regular type', async () => {
    render(<AddRecordModal {...defaultProps} />)

    // Switch to vacation
    const vacationRadio = screen.getByLabelText('休假')
    fireEvent.click(vacationRadio)

    await waitFor(() => {
      const clockOutInput = getFormItemInput('下班時間')
      expect(clockOutInput).toHaveAttribute('disabled')
    })

    // Switch back to regular
    const regularRadio = screen.getByLabelText('一般')
    fireEvent.click(regularRadio)

    await waitFor(() => {
      const clockOutInput = getFormItemInput('下班時間')
      expect(clockOutInput).not.toHaveAttribute('disabled')
    })
  })

  it('clears clockOut value when switching to vacation type', async () => {
    render(<AddRecordModal {...defaultProps} />)

    // Switch to vacation
    const vacationRadio = screen.getByLabelText('休假')
    fireEvent.click(vacationRadio)

    // ClockOut value should be cleared
    await waitFor(() => {
      const clockOutInput = getFormItemInput('下班時間')
      expect(clockOutInput?.value).toBe('')
    })
  })

  // --- Form Submission Tests ---

  it('calls API.attendances.add on submit with correct data (vacation type)', async () => {
    const user = userEvent.setup()
    const mockOnSuccess = vi.fn()

    render(
      <AddRecordModal
        {...defaultProps}
        onSuccess={mockOnSuccess}
        defaultEmployeeId={1}
        defaultDate="2025-10-10"
      />,
    )

    // Wait for form to be ready and switch to vacation (no clockIn required)
    await waitFor(() => {
      expect(screen.getByText('一般')).toBeInTheDocument()
    })
    const vacationRadio = screen.getByLabelText('休假')
    fireEvent.click(vacationRadio)

    // Click the OK button to save
    const okButton = screen.getByRole('button', { name: /ok/i })
    await user.click(okButton)

    // Verify API was called with the correct record structure
    await waitFor(() => {
      expect(API.attendances.add).toHaveBeenCalledWith(
        expect.objectContaining({
          employeeId: 1,
          date: '2025-10-10',
          type: 'vacation',
        }),
      )
    })
  })

  it('calls onSuccess callback after successful add', async () => {
    const user = userEvent.setup()
    const mockOnSuccess = vi.fn()

    render(
      <AddRecordModal
        {...defaultProps}
        onSuccess={mockOnSuccess}
        defaultEmployeeId={1}
        defaultDate="2025-10-10"
      />,
    )

    // Wait for form to be ready and switch to vacation for easy submission
    await waitFor(() => {
      expect(screen.getByText('一般')).toBeInTheDocument()
    })
    const vacationRadio = screen.getByLabelText('休假')
    fireEvent.click(vacationRadio)

    // Click the OK button to save
    const okButton = screen.getByRole('button', { name: /ok/i })
    await user.click(okButton)

    // Verify onSuccess was called
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled()
    })
  })

  it('shows error message on API failure', async () => {
    const user = userEvent.setup()
    ;(API.attendances.add as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error('DB error'),
    )

    render(
      <AddRecordModal
        {...defaultProps}
        defaultEmployeeId={1}
        defaultDate="2025-10-10"
      />,
    )

    // Wait for form to be ready and switch to vacation for easy submission
    await waitFor(() => {
      expect(screen.getByText('一般')).toBeInTheDocument()
    })
    const vacationRadio = screen.getByLabelText('休假')
    fireEvent.click(vacationRadio)

    // Click the OK button to save
    const okButton = screen.getByRole('button', { name: /ok/i })
    await user.click(okButton)

    // Verify error message is shown
    await waitFor(() => {
      expect(screen.getByText('新增失敗，請再試一次')).toBeInTheDocument()
    })
  })

  it('does not call onSuccess when API fails', async () => {
    const user = userEvent.setup()
    const mockOnSuccess = vi.fn()
    ;(API.attendances.add as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error('DB error'),
    )

    render(
      <AddRecordModal
        {...defaultProps}
        onSuccess={mockOnSuccess}
        defaultEmployeeId={1}
        defaultDate="2025-10-10"
      />,
    )

    await waitFor(() => {
      expect(screen.getByText('一般')).toBeInTheDocument()
    })
    const vacationRadio = screen.getByLabelText('休假')
    fireEvent.click(vacationRadio)

    const okButton = screen.getByRole('button', { name: /ok/i })
    await user.click(okButton)

    // Wait for the error message to appear (use getAllByText since antd messages
    // may accumulate across tests in the same DOM container)
    await waitFor(() => {
      const errorMessages = screen.getAllByText('新增失敗，請再試一次')
      expect(errorMessages.length).toBeGreaterThanOrEqual(1)
    })
    expect(mockOnSuccess).not.toHaveBeenCalled()
  })

  it('blocks submission when regular type has no clockIn', async () => {
    const user = userEvent.setup()

    render(
      <AddRecordModal
        {...defaultProps}
        defaultEmployeeId={1}
        defaultDate="2025-10-10"
      />,
    )

    await waitFor(() => {
      expect(screen.getByText('一般')).toBeInTheDocument()
    })

    // Submit with regular type but no clockIn
    const okButton = screen.getByRole('button', { name: /ok/i })
    await user.click(okButton)

    // API should NOT be called since clockIn is required for regular type
    await waitFor(() => {
      expect(screen.getByText('一般出勤必須填寫上班時間')).toBeInTheDocument()
    })
    expect(API.attendances.add).not.toHaveBeenCalled()
  })

  // --- Cancel Tests ---

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup()
    const mockOnCancel = vi.fn()

    render(<AddRecordModal {...defaultProps} onCancel={mockOnCancel} />)

    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    await user.click(cancelButton)

    expect(mockOnCancel).toHaveBeenCalled()
  })

  // --- Vacation Save Tests ---

  it('omits clockOut from API call when type is vacation', async () => {
    const user = userEvent.setup()
    const mockOnSuccess = vi.fn()

    render(
      <AddRecordModal
        {...defaultProps}
        onSuccess={mockOnSuccess}
        defaultEmployeeId={1}
        defaultDate="2025-10-10"
      />,
    )

    // Switch to vacation
    const vacationRadio = screen.getByLabelText('休假')
    fireEvent.click(vacationRadio)

    await waitFor(() => {
      expect(vacationRadio).toBeChecked()
    })

    // Click the OK button to save
    const okButton = screen.getByRole('button', { name: /ok/i })
    await user.click(okButton)

    // Verify API was called with vacation type and no clockOut
    await waitFor(() => {
      expect(API.attendances.add).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'vacation',
        }),
      )
      // Verify clockOut is undefined
      const calledWith = (API.attendances.add as ReturnType<typeof vi.fn>).mock
        .calls[0][0]
      expect(calledWith.clockOut).toBeUndefined()
    })
  })
})
