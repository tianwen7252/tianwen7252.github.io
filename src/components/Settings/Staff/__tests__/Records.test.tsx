import { describe, it, expect, beforeEach, vi } from 'vitest'
import React from 'react'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import dayjs from 'dayjs'
import { Records } from '../Records'
import * as API from 'src/libs/api'

// Use dates in the current month so calendar view renders them
const today = dayjs()
const regularDate = today.date(10).format('YYYY-MM-DD')
const vacationDate = today.date(11).format('YYYY-MM-DD')
const noTypeDate = today.date(12).format('YYYY-MM-DD')

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

// Build mock attendance records using current-month dates
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
]

// Mock dexie-react-hooks with both record types
vi.mock('dexie-react-hooks', () => ({
  useLiveQuery: (callback: Function, _deps: any[]) => {
    callback()
    if (callback.toString().includes('employees')) {
      return [{ id: 1, name: 'Alice', status: 'active' }]
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
})
