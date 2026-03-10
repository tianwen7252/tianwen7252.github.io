import { describe, it, expect, beforeEach, vi } from 'vitest'
import React from 'react'
import { render, fireEvent, screen, waitFor } from '@testing-library/react'
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
  default: ({ empName }: { empName: string }) => <div data-testid="edit-modal">Edit Modal for {empName}</div>
}))

// Mock dexie-react-hooks
vi.mock('dexie-react-hooks', () => ({
  useLiveQuery: (callback: Function, deps: any[]) => {
    callback()
    // Depending on what it is querying
    if (callback.toString().includes('employees')) {
      return [
        { id: 1, name: 'Alice', status: 'active' },
      ]
    }
    if (callback.toString().includes('attendances')) {
      return [
        { 
          id: 101, 
          employeeId: 1, 
          date: '2023-10-10', 
          clockIn: dayjs('2023-10-10T09:00:00Z').valueOf(),
          clockOut: dayjs('2023-10-10T18:00:00Z').valueOf(),
        }
      ]
    }
    return []
  },
}))

describe('Records Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2023-10-10T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders table mode correctly and opens edit modal', async () => {
    render(<Records />)
    
    // Switch to table mode
    const tableRadio = screen.getByText('表格')
    fireEvent.click(tableRadio)
    
    // Check if the record exists
    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument()
      expect(screen.getByText('2023-10-10')).toBeInTheDocument()
      expect(screen.getByText('17:00:00')).toBeInTheDocument() // 09:00 UTC is 17:00 in +08:00, or whatever the local time is, but we'll focus on the interaction
    })

    // Click on Edit Action
    const editButton = screen.getByText('修改')
    fireEvent.click(editButton)

    await waitFor(() => {
      expect(screen.getByTestId('edit-modal')).toHaveTextContent('Edit Modal for Alice')
    })
  })
})
