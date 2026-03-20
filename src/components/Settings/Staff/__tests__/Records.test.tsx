import { describe, it, expect, beforeEach, vi } from 'vitest'
import React from 'react'
import { render, screen, waitFor, within, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import dayjs from 'dayjs'
import { Records } from '../Records'
import * as API from 'src/libs/api'

// Use dates in the current month so calendar view renders them
const today = dayjs()
const regularDate = today.date(10).format('YYYY-MM-DD')
const vacationDate = today.date(11).format('YYYY-MM-DD')
const noTypeDate = today.date(12).format('YYYY-MM-DD')
const bobDate = today.date(13).format('YYYY-MM-DD')

// Mock API calls
vi.mock('src/libs/api', () => ({
  employees: {
    get: vi.fn(),
  },
  attendances: {
    getByMonth: vi.fn(),
  },
}))

vi.mock('../EditRecordModal', () => ({
  default: ({ empName }: { empName: string }) => (
    <div data-testid="edit-modal">Edit Modal for {empName}</div>
  ),
}))

vi.mock('../AddRecordModal', () => ({
  AddRecordModal: ({
    open,
    onCancel,
  }: {
    open: boolean
    onCancel: () => void
  }) =>
    open ? (
      <div data-testid="add-record-modal">
        Add Record Modal
        <button onClick={onCancel}>Cancel</button>
      </div>
    ) : null,
}))

// Mock employee list with multiple employees for filter testing
const mockEmployees = [
  { id: 1, name: 'Alice', status: 'active' },
  { id: 2, name: 'Bob', status: 'active' },
]

// Build mock attendance records using current-month dates (multi-employee)
const buildMockAttendances = () => [
  {
    id: 101,
    employeeId: 1,
    date: regularDate,
    clockIn: dayjs(`${regularDate}T09:00:00`).valueOf(),
    clockOut: dayjs(`${regularDate}T18:00:00`).valueOf(),
    type: 'regular' as const,
  },
  {
    id: 102,
    employeeId: 1,
    date: vacationDate,
    clockIn: dayjs(`${vacationDate}T09:00:00`).valueOf(),
    clockOut: undefined,
    type: 'vacation' as const,
  },
  {
    id: 103,
    employeeId: 1,
    date: noTypeDate,
    clockIn: dayjs(`${noTypeDate}T08:00:00`).valueOf(),
    clockOut: dayjs(`${noTypeDate}T17:00:00`).valueOf(),
  },
  {
    id: 104,
    employeeId: 2,
    date: bobDate,
    clockIn: dayjs(`${bobDate}T10:00:00`).valueOf(),
    clockOut: dayjs(`${bobDate}T19:00:00`).valueOf(),
    type: 'regular' as const,
  },
]

// Mock dexie-react-hooks with both record types
vi.mock('dexie-react-hooks', () => ({
  useLiveQuery: (callback: Function, _deps: any[]) => {
    callback()
    if (callback.toString().includes('employees')) {
      return mockEmployees
    }
    if (callback.toString().includes('attendances')) {
      return buildMockAttendances()
    }
    return []
  },
}))

describe('Records Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders table mode correctly and opens edit modal', async () => {
    const user = userEvent.setup()
    render(<Records />)

    // Switch to table mode using userEvent for reliable Ant Design Radio interaction
    await user.click(screen.getByText('表格'))

    // Check if records exist in the table (multiple Alice records now)
    await waitFor(() => {
      expect(screen.getAllByText('Alice').length).toBeGreaterThanOrEqual(1)
      expect(screen.getByText(regularDate)).toBeInTheDocument()
    })

    // Click on the first Edit Action
    await user.click(screen.getAllByText('修改')[0])

    await waitFor(() => {
      expect(screen.getByTestId('edit-modal')).toHaveTextContent(
        'Edit Modal for Alice',
      )
    })
  })

  describe('Table view - Type column', () => {
    it('displays a Type column header', async () => {
      const user = userEvent.setup()
      render(<Records />)

      await user.click(screen.getByText('表格'))

      await waitFor(() => {
        // The table should have a column header for type
        expect(screen.getByText('類型')).toBeInTheDocument()
      })
    })

    it('shows "一般" for regular type records', async () => {
      const user = userEvent.setup()
      render(<Records />)

      await user.click(screen.getByText('表格'))

      await waitFor(() => {
        // Regular records should display as "一般" (at least one)
        const regularLabels = screen.getAllByText('一般')
        expect(regularLabels.length).toBeGreaterThanOrEqual(1)
      })
    })

    it('shows "休假" for vacation type records', async () => {
      const user = userEvent.setup()
      render(<Records />)

      await user.click(screen.getByText('表格'))

      await waitFor(() => {
        // Vacation records should display as "休假"
        expect(screen.getByText('休假')).toBeInTheDocument()
      })
    })

    it('shows "一般" for records without type field (backward compatibility)', async () => {
      const user = userEvent.setup()
      render(<Records />)

      await user.click(screen.getByText('表格'))

      await waitFor(() => {
        // Records without a type should default to "一般"
        // We expect at least 2 "一般" entries (regular + no-type records)
        const regularLabels = screen.getAllByText('一般')
        expect(regularLabels.length).toBeGreaterThanOrEqual(2)
      })
    })

    it('shows dash for clockOut on vacation records in table', async () => {
      const user = userEvent.setup()
      render(<Records />)

      await user.click(screen.getByText('表格'))

      await waitFor(() => {
        // Find the row with the vacation date and check clockOut column
        const rows = screen.getAllByRole('row')
        const vacationRow = rows.find(row =>
          row.textContent?.includes(vacationDate),
        )
        expect(vacationRow).toBeDefined()
        // Vacation clockOut should display as em-dash, not a time
        expect(vacationRow!.textContent).toContain('\u2014')
      })
    })
  })

  describe('Calendar view - Vacation badges', () => {
    it('shows "休假" text for vacation records in calendar cells', async () => {
      render(<Records />)

      // Calendar is the default view; vacation record date is in current month
      await waitFor(() => {
        // Vacation record should show badge text containing "休假"
        expect(screen.getByText(/休假/)).toBeInTheDocument()
      })
    })
  })

  // --- Add Record Button Tests ---

  describe('Add Record button', () => {
    it('renders "新增打卡紀錄" button in the toolbar', () => {
      render(<Records />)

      expect(screen.getByRole('button', { name: /新增打卡紀錄/ })).toBeInTheDocument()
    })

    it('opens AddRecordModal when clicked', async () => {
      const user = userEvent.setup()
      render(<Records />)

      // Modal should not be visible initially
      expect(screen.queryByTestId('add-record-modal')).not.toBeInTheDocument()

      // Click the add record button
      await user.click(screen.getByRole('button', { name: /新增打卡紀錄/ }))

      // Modal should now be visible
      await waitFor(() => {
        expect(screen.getByTestId('add-record-modal')).toBeInTheDocument()
      })
    })

    it('closes AddRecordModal when modal cancel is triggered', async () => {
      const user = userEvent.setup()
      render(<Records />)

      // Open the modal
      await user.click(screen.getByRole('button', { name: /新增打卡紀錄/ }))

      await waitFor(() => {
        expect(screen.getByTestId('add-record-modal')).toBeInTheDocument()
      })

      // Click cancel in the modal
      await user.click(screen.getByText('Cancel'))

      await waitFor(() => {
        expect(screen.queryByTestId('add-record-modal')).not.toBeInTheDocument()
      })
    })
  })

  // --- Employee Filter Tests ---

  describe('Employee filter', () => {
    // Helper to open Ant Design Select dropdown via mouseDown on the selector
    const openFilterDropdown = () => {
      const selector = document.querySelector(
        '.ant-select-selector',
      ) as HTMLElement
      fireEvent.mouseDown(selector)
    }

    // Helper to select an option from the opened Ant Design Select dropdown
    const selectOption = (name: string) => {
      const option = Array.from(
        document.querySelectorAll('.ant-select-item-option'),
      ).find(el => el.textContent?.includes(name)) as HTMLElement
      fireEvent.click(option)
    }

    it('renders an employee filter Select dropdown', () => {
      render(<Records />)

      // The filter select should have a placeholder "所有員工"
      expect(screen.getByText('所有員工')).toBeInTheDocument()
    })

    it('shows all employees as options in the filter dropdown', async () => {
      render(<Records />)

      // Open the employee filter dropdown via mouseDown on the selector
      openFilterDropdown()

      // Both employees should appear as options
      await waitFor(() => {
        const options = document.querySelectorAll('.ant-select-item-option')
        const optionTexts = Array.from(options).map(el => el.textContent)
        expect(optionTexts).toContain('Alice')
        expect(optionTexts).toContain('Bob')
      })
    })

    it('filters table records by selected employee', async () => {
      const user = userEvent.setup()
      render(<Records />)

      // Switch to table view
      await user.click(screen.getByText('表格'))

      // Verify both Alice and Bob records are visible in the table initially
      await waitFor(() => {
        const table = document.querySelector('.ant-table-tbody') as HTMLElement
        expect(within(table).getAllByText('Alice').length).toBeGreaterThanOrEqual(1)
        expect(within(table).getAllByText('Bob').length).toBeGreaterThanOrEqual(1)
      })

      // Open the filter dropdown and select Bob
      openFilterDropdown()

      await waitFor(() => {
        const options = document.querySelectorAll('.ant-select-item-option')
        expect(options.length).toBeGreaterThan(0)
      })

      selectOption('Bob')

      // After filtering, only Bob records should be in the table body
      await waitFor(() => {
        const table = document.querySelector('.ant-table-tbody') as HTMLElement
        expect(within(table).getAllByText('Bob').length).toBeGreaterThanOrEqual(1)
        expect(within(table).queryByText('Alice')).not.toBeInTheDocument()
      })
    })

    it('shows all records when filter is cleared', async () => {
      const user = userEvent.setup()
      render(<Records />)

      // Switch to table view
      await user.click(screen.getByText('表格'))

      // Open the filter and select Bob first
      openFilterDropdown()

      await waitFor(() => {
        const options = document.querySelectorAll('.ant-select-item-option')
        expect(options.length).toBeGreaterThan(0)
      })

      selectOption('Bob')

      // Verify filtered state: only Bob visible in table body
      await waitFor(() => {
        const table = document.querySelector('.ant-table-tbody') as HTMLElement
        expect(within(table).queryByText('Alice')).not.toBeInTheDocument()
      })

      // Clear the filter using the allowClear X button
      const clearBtn = document.querySelector('.ant-select-clear') as HTMLElement
      expect(clearBtn).toBeTruthy()
      fireEvent.mouseDown(clearBtn)
      fireEvent.click(clearBtn)

      // After clearing, all records should reappear in the table
      await waitFor(() => {
        const table = document.querySelector('.ant-table-tbody') as HTMLElement
        expect(within(table).getAllByText('Alice').length).toBeGreaterThanOrEqual(1)
        expect(within(table).getAllByText('Bob').length).toBeGreaterThanOrEqual(1)
      })
    })

    it('filters calendar view records by selected employee', async () => {
      render(<Records />)

      // Calendar is the default view; both employees should have records
      await waitFor(() => {
        // Alice has a vacation record with "休假" badge text
        expect(screen.getByText(/Alice 休假/)).toBeInTheDocument()
      })

      // Open the filter and select Bob
      openFilterDropdown()

      await waitFor(() => {
        const options = document.querySelectorAll('.ant-select-item-option')
        expect(options.length).toBeGreaterThan(0)
      })

      selectOption('Bob')

      // After filtering for Bob, Alice's vacation badge should not appear
      await waitFor(() => {
        expect(screen.queryByText(/Alice 休假/)).not.toBeInTheDocument()
      })
    })
  })
})
