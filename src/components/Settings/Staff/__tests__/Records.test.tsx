import { describe, it, expect, beforeEach, vi } from 'vitest'
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import dayjs from 'dayjs'

// Mock useLiveQuery from dexie-react-hooks
vi.mock('dexie-react-hooks', () => ({
  useLiveQuery: vi.fn(),
}))
import { useLiveQuery } from 'dexie-react-hooks'

// Mock API module
vi.mock('src/libs/api', () => ({
  attendances: {
    getByMonth: vi.fn(),
    getByDate: vi.fn(),
    add: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  },
  employees: {
    get: vi.fn(),
  },
}))

// Mock child components to isolate container logic
vi.mock('../RecordsTableView', () => ({
  RecordsTableView: (props: any) => (
    <div data-testid="table-view">
      {/* Expose onCellClick for testing with existing attendance */}
      <button
        data-testid="table-cell-click"
        onClick={() =>
          props.onCellClick(
            { id: 1, name: 'Ryan' },
            '2026-03-20',
            {
              id: 100,
              employeeId: 1,
              date: '2026-03-20',
              clockIn: dayjs('2026-03-20 08:30').valueOf(),
              clockOut: dayjs('2026-03-20 18:00').valueOf(),
              type: 'regular',
            },
          )
        }
      >
        click-existing
      </button>
      {/* Expose onCellClick for testing with empty cell (no attendance) */}
      <button
        data-testid="table-empty-cell-click"
        onClick={() =>
          props.onCellClick(
            { id: 2, name: '\u9673\u5c0f\u660e' },
            '2026-03-20',
            undefined,
          )
        }
      >
        click-empty
      </button>
    </div>
  ),
  default: (props: any) => <div data-testid="table-view" />,
}))

vi.mock('../RecordsCalendarView', () => ({
  RecordsCalendarView: (props: any) => <div data-testid="calendar-view" />,
  default: (props: any) => <div data-testid="calendar-view" />,
}))

vi.mock('../EditRecordModal', () => ({
  EditRecordModal: (props: any) => (
    <div data-testid="edit-modal">
      <span>{props.empName}</span>
      <button data-testid="edit-modal-cancel" onClick={props.onCancel}>
        Cancel
      </button>
    </div>
  ),
  default: (props: any) => <div data-testid="edit-modal" />,
}))

vi.mock('../AddRecordModal', () => ({
  AddRecordModal: (props: any) =>
    props.open ? (
      <div data-testid="add-modal">
        <span>{props.defaultDate}</span>
        <button data-testid="add-modal-cancel" onClick={props.onCancel}>
          Cancel
        </button>
      </div>
    ) : null,
  default: (props: any) => null,
}))

// --- Mock data ---

const mockEmployees: RestaDB.Table.Employee[] = [
  { id: 1, name: 'Ryan' },
  { id: 2, name: '\u9673\u5c0f\u660e' },
]

const mockAttendances: RestaDB.Table.Attendance[] = [
  {
    id: 100,
    employeeId: 1,
    date: '2026-03-20',
    clockIn: dayjs('2026-03-20 08:30').valueOf(),
    clockOut: dayjs('2026-03-20 18:00').valueOf(),
    type: 'regular',
  },
]

// --- Helper to configure useLiveQuery mock ---

function setupUseLiveQueryMock(
  attendances: RestaDB.Table.Attendance[] | undefined = mockAttendances,
  employees: RestaDB.Table.Employee[] | undefined = mockEmployees,
) {
  const mockedUseLiveQuery = useLiveQuery as ReturnType<typeof vi.fn>
  mockedUseLiveQuery.mockReset()
  let callIndex = 0
  mockedUseLiveQuery.mockImplementation((_fn: any, deps?: any[]) => {
    callIndex++
    // First call in component: attendances (has deps), second call: employees (no deps)
    if (callIndex % 2 === 1) return attendances
    return employees
  })
}

// --- Import component under test AFTER mocks are set up ---
import { Records } from '../Records'

describe('Records container component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setupUseLiveQueryMock()
  })

  // 1. Renders page title
  it('renders the page title', () => {
    render(<Records />)
    expect(screen.getByText('\u54e1\u5de5\u8003\u52e4\u72c0\u6cc1')).toBeInTheDocument()
  })

  // 2. Renders toggle buttons
  it('renders toggle buttons for table and calendar views', () => {
    render(<Records />)
    expect(screen.getByText('\u8868\u683c')).toBeInTheDocument()
    expect(screen.getByText('\u6708\u66c6')).toBeInTheDocument()
  })

  // 3. Default view is table
  it('defaults to table view', () => {
    render(<Records />)
    expect(screen.getByTestId('table-view')).toBeInTheDocument()
    expect(screen.queryByTestId('calendar-view')).not.toBeInTheDocument()
  })

  // 4. Switch to calendar view
  it('switches to calendar view when calendar toggle is clicked', () => {
    render(<Records />)

    // Click the calendar toggle button
    fireEvent.click(screen.getByText('\u6708\u66c6'))

    expect(screen.getByTestId('calendar-view')).toBeInTheDocument()
    expect(screen.queryByTestId('table-view')).not.toBeInTheDocument()
  })

  // 5. Search input is present
  it('renders the search input with correct placeholder', () => {
    render(<Records />)
    expect(
      screen.getByPlaceholderText('\u641c\u5c0b\u54e1\u5de5\u59d3\u540d'),
    ).toBeInTheDocument()
  })

  // 6. Year and month selects are present
  it('renders year and month select dropdowns', () => {
    render(<Records />)
    // The year select should show the current year
    const currentYear = dayjs().year()
    expect(screen.getByText(`${currentYear} \u5e74`)).toBeInTheDocument()
    // The month select should show the current month
    const currentMonth = dayjs().month() + 1
    expect(screen.getByText(`${currentMonth} \u6708`)).toBeInTheDocument()
  })

  // 7. Click cell with attendance opens EditRecordModal
  it('opens EditRecordModal when clicking a cell with existing attendance', async () => {
    render(<Records />)

    // Click the mock table cell that has attendance data
    fireEvent.click(screen.getByTestId('table-cell-click'))

    await waitFor(() => {
      expect(screen.getByTestId('edit-modal')).toBeInTheDocument()
      expect(screen.getByTestId('edit-modal')).toHaveTextContent('Ryan')
    })
  })

  // 8. Click empty cell opens AddRecordModal
  it('opens AddRecordModal when clicking an empty cell', async () => {
    render(<Records />)

    // Click the mock table cell with no attendance (empty)
    fireEvent.click(screen.getByTestId('table-empty-cell-click'))

    await waitFor(() => {
      expect(screen.getByTestId('add-modal')).toBeInTheDocument()
      expect(screen.getByTestId('add-modal')).toHaveTextContent('2026-03-20')
    })
  })

  // 9. EditRecordModal cancel closes it
  it('closes EditRecordModal when cancel is clicked', async () => {
    render(<Records />)

    // Open edit modal
    fireEvent.click(screen.getByTestId('table-cell-click'))
    await waitFor(() => {
      expect(screen.getByTestId('edit-modal')).toBeInTheDocument()
    })

    // Cancel the modal
    fireEvent.click(screen.getByTestId('edit-modal-cancel'))
    await waitFor(() => {
      expect(screen.queryByTestId('edit-modal')).not.toBeInTheDocument()
    })
  })

  // 10. AddRecordModal cancel closes it
  it('closes AddRecordModal when cancel is clicked', async () => {
    render(<Records />)

    // Open add modal via empty cell click
    fireEvent.click(screen.getByTestId('table-empty-cell-click'))
    await waitFor(() => {
      expect(screen.getByTestId('add-modal')).toBeInTheDocument()
    })

    // Cancel the modal
    fireEvent.click(screen.getByTestId('add-modal-cancel'))
    await waitFor(() => {
      expect(screen.queryByTestId('add-modal')).not.toBeInTheDocument()
    })
  })

  // 11. Bottom hint text displayed
  it('displays the bottom hint text', () => {
    render(<Records />)
    expect(
      screen.getByText('\u9ede\u64ca\u5132\u5b58\u683c\u5373\u53ef\u76f4\u63a5\u7de8\u8f2f\u6253\u5361\u6642\u9593'),
    ).toBeInTheDocument()
  })

  // 12. Loading spinner when data is undefined
  it('shows a loading spinner when data is not yet loaded', () => {
    // Override the mock to always return undefined (loading state)
    const mockedUseLiveQuery = useLiveQuery as ReturnType<typeof vi.fn>
    mockedUseLiveQuery.mockReset()
    mockedUseLiveQuery.mockReturnValue(undefined)

    const { container } = render(<Records />)

    // Should NOT show the toggle buttons (page content is not rendered in loading state)
    expect(screen.queryByText('\u8868\u683c')).not.toBeInTheDocument()
    expect(screen.queryByText('\u6708\u66c6')).not.toBeInTheDocument()
    // Should NOT show the table or calendar view
    expect(screen.queryByTestId('table-view')).not.toBeInTheDocument()
    expect(screen.queryByTestId('calendar-view')).not.toBeInTheDocument()
  })

  // 13. Switch back to table view from calendar
  it('switches back to table view from calendar view', () => {
    render(<Records />)

    // Switch to calendar
    fireEvent.click(screen.getByText('\u6708\u66c6'))
    expect(screen.getByTestId('calendar-view')).toBeInTheDocument()

    // Switch back to table
    fireEvent.click(screen.getByText('\u8868\u683c'))
    expect(screen.getByTestId('table-view')).toBeInTheDocument()
    expect(screen.queryByTestId('calendar-view')).not.toBeInTheDocument()
  })
})
