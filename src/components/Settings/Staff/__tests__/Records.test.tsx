import { describe, it, expect, beforeEach, vi } from 'vitest'
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import dayjs from 'dayjs'
import { Records } from '../Records'
import * as API from 'src/libs/api'

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

// Mock dexie-react-hooks
vi.mock('dexie-react-hooks', () => ({
  useLiveQuery: (callback: Function, _deps: any[]) => {
    callback()
    if (callback.toString().includes('employees')) {
      return [{ id: 1, name: 'Alice', status: 'active' }]
    }
    if (callback.toString().includes('attendances')) {
      return [
        {
          id: 101,
          employeeId: 1,
          date: '2023-10-10',
          clockIn: dayjs('2023-10-10T09:00:00Z').valueOf(),
          clockOut: dayjs('2023-10-10T18:00:00Z').valueOf(),
        },
      ]
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

    // Check if the record exists in the table
    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument()
      expect(screen.getByText('2023-10-10')).toBeInTheDocument()
    })

    // Click on Edit Action
    await user.click(screen.getByText('修改'))

    await waitFor(() => {
      expect(screen.getByTestId('edit-modal')).toHaveTextContent(
        'Edit Modal for Alice',
      )
    })
  })
})
