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
      {/* Expose onEditRecord for testing with existing attendance */}
      <button
        data-testid="table-edit-click"
        onClick={() =>
          props.onEditRecord(
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
        click-edit
      </button>
      {/* Expose onAddRecord for testing with empty cell */}
      <button
        data-testid="table-add-click"
        onClick={() =>
          props.onAddRecord(
            { id: 2, name: '\u9673\u5c0f\u660e' },
            '2026-03-20',
          )
        }
      >
        click-add
      </button>
      {/* Expose todayDate prop for verification */}
      <span data-testid="today-date-prop">{props.todayDate}</span>
    </div>
  ),
  default: (props: any) => <div data-testid="table-view" />,
}))

vi.mock('../RecordsCalendarView', () => ({
  RecordsCalendarView: (props: any) => <div data-testid="calendar-view" />,
  default: (props: any) => <div data-testid="calendar-view" />,
}))

// Mock RecordModal (replaces old EditRecordModal + AddRecordModal)
vi.mock('../RecordModal', () => ({
  RecordModal: (props: any) =>
    props.open ? (
      <div data-testid="record-modal">
        <span data-testid="modal-mode">{props.mode}</span>
        <span data-testid="modal-employee">{props.employee?.name ?? 'none'}</span>
        <span data-testid="modal-date">{props.date}</span>
        <button data-testid="modal-cancel" onClick={props.onCancel}>
          Cancel
        </button>
        <button data-testid="modal-success" onClick={props.onSuccess}>
          Success
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
    expect(screen.getByText('員工考勤狀況')).toBeInTheDocument()
  })

  // 2. Renders toggle buttons
  it('renders toggle buttons for table and calendar views', () => {
    render(<Records />)
    expect(screen.getByText('表格')).toBeInTheDocument()
    expect(screen.getByText('月曆')).toBeInTheDocument()
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
    fireEvent.click(screen.getByText('月曆'))
    expect(screen.getByTestId('calendar-view')).toBeInTheDocument()
    expect(screen.queryByTestId('table-view')).not.toBeInTheDocument()
  })

  // 5. Search input is present
  it('renders the search input with correct placeholder', () => {
    render(<Records />)
    expect(screen.getByPlaceholderText('搜尋員工姓名')).toBeInTheDocument()
  })

  // 6. Year and month selects are present
  it('renders year and month select dropdowns', () => {
    render(<Records />)
    const currentYear = dayjs().year()
    expect(screen.getByText(`${currentYear} 年`)).toBeInTheDocument()
    const currentMonth = dayjs().month() + 1
    expect(screen.getByText(`${currentMonth} 月`)).toBeInTheDocument()
  })

  // 7. Click cell with attendance opens RecordModal in edit mode
  it('opens RecordModal in edit mode when clicking an existing record card', async () => {
    render(<Records />)
    fireEvent.click(screen.getByTestId('table-edit-click'))

    await waitFor(() => {
      expect(screen.getByTestId('record-modal')).toBeInTheDocument()
      expect(screen.getByTestId('modal-mode')).toHaveTextContent('edit')
      expect(screen.getByTestId('modal-employee')).toHaveTextContent('Ryan')
    })
  })

  // 8. Click empty cell opens RecordModal in add mode
  it('opens RecordModal in add mode when clicking an empty cell', async () => {
    render(<Records />)
    fireEvent.click(screen.getByTestId('table-add-click'))

    await waitFor(() => {
      expect(screen.getByTestId('record-modal')).toBeInTheDocument()
      expect(screen.getByTestId('modal-mode')).toHaveTextContent('add')
      expect(screen.getByTestId('modal-employee')).toHaveTextContent('陳小明')
    })
  })

  // 9. RecordModal cancel closes it
  it('closes RecordModal when cancel is clicked', async () => {
    render(<Records />)
    fireEvent.click(screen.getByTestId('table-edit-click'))
    await waitFor(() => {
      expect(screen.getByTestId('record-modal')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByTestId('modal-cancel'))
    await waitFor(() => {
      expect(screen.queryByTestId('record-modal')).not.toBeInTheDocument()
    })
  })

  // 10. RecordModal success closes it
  it('closes RecordModal when onSuccess is called', async () => {
    render(<Records />)
    fireEvent.click(screen.getByTestId('table-add-click'))
    await waitFor(() => {
      expect(screen.getByTestId('record-modal')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByTestId('modal-success'))
    await waitFor(() => {
      expect(screen.queryByTestId('record-modal')).not.toBeInTheDocument()
    })
  })

  // 11. Hint text is displayed above the view (not at bottom)
  it('displays the hint text', () => {
    render(<Records />)
    expect(
      screen.getByText('點擊儲存格即可直接編輯打卡時間'),
    ).toBeInTheDocument()
  })

  // 12. Loading spinner when data is undefined
  it('shows a loading spinner when data is not yet loaded', () => {
    const mockedUseLiveQuery = useLiveQuery as ReturnType<typeof vi.fn>
    mockedUseLiveQuery.mockReset()
    mockedUseLiveQuery.mockReturnValue(undefined)

    render(<Records />)

    expect(screen.queryByText('表格')).not.toBeInTheDocument()
    expect(screen.queryByText('月曆')).not.toBeInTheDocument()
    expect(screen.queryByTestId('table-view')).not.toBeInTheDocument()
  })

  // 13. Switch back to table view from calendar
  it('switches back to table view from calendar view', () => {
    render(<Records />)
    fireEvent.click(screen.getByText('月曆'))
    expect(screen.getByTestId('calendar-view')).toBeInTheDocument()

    fireEvent.click(screen.getByText('表格'))
    expect(screen.getByTestId('table-view')).toBeInTheDocument()
    expect(screen.queryByTestId('calendar-view')).not.toBeInTheDocument()
  })

  // 14. "今天" button is rendered
  it('renders a "今天" button', () => {
    render(<Records />)
    expect(screen.getByText('今天')).toBeInTheDocument()
  })

  // 15. todayDate prop is passed to RecordsTableView
  it('passes todayDate prop to RecordsTableView', () => {
    render(<Records />)
    const todayStr = dayjs().format('YYYY-MM-DD')
    expect(screen.getByTestId('today-date-prop')).toHaveTextContent(todayStr)
  })
})
