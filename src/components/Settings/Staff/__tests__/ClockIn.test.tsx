import { describe, it, expect, beforeEach, vi } from 'vitest'
import React from 'react'
import { render, fireEvent, screen, waitFor } from '@testing-library/react'
import dayjs from 'dayjs'
import { ClockIn } from '../ClockIn'
import * as API from 'src/libs/api'

// Mock API calls
vi.mock('src/libs/api', () => ({
  employees: {
    get: vi.fn(),
    add: vi.fn(),
  },
  attendances: {
    getByDate: vi.fn(),
    add: vi.fn(),
    set: vi.fn(),
  },
}))

// Mock dexie-react-hooks
vi.mock('dexie-react-hooks', () => ({
  useLiveQuery: (callback: Function) => {
    // We execute the callback to simulate reading, but we will mock the return values based on API mocks
    callback()
    if (callback.toString().includes('employees')) {
      return [
        { id: 1, name: 'Alice', status: 'active' },
        { id: 2, name: 'Bob', status: 'active', avatar: 'https://avatar.com/bob.png' },
      ]
    }
    return []
  },
}))

describe('ClockIn Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2023-10-10T09:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders employee cards properly', async () => {
    render(<ClockIn />)
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
  })

  it('handles clock in successfully', async () => {
    // Mock that Alice has no attendance today
    vi.mocked(API.attendances.getByDate).mockResolvedValue([])

    render(<ClockIn />)
    const aliceCard = screen.getByText('Alice')
    
    await fireEvent.click(aliceCard)

    await waitFor(() => {
      expect(API.attendances.getByDate).toHaveBeenCalledWith('2023-10-10')
      expect(API.attendances.add).toHaveBeenCalledWith({
        employeeId: 1,
        date: '2023-10-10',
        clockIn: dayjs('2023-10-10T09:00:00Z').valueOf(),
      })
    })
  })

  it('handles clock out successfully', async () => {
    // Mock that Alice has already clocked in but not out
    vi.mocked(API.attendances.getByDate).mockResolvedValue([
      { id: 101, employeeId: 1, date: '2023-10-10', clockIn: dayjs('2023-10-10T08:00:00Z').valueOf() }
    ])

    render(<ClockIn />)
    const aliceCard = screen.getByText('Alice')
    
    await fireEvent.click(aliceCard)

    await waitFor(() => {
      expect(API.attendances.set).toHaveBeenCalledWith(101, {
        clockOut: dayjs('2023-10-10T09:00:00Z').valueOf(),
      })
    })
  })

  it('handles already clocked out case (double click)', async () => {
    // Mock that Alice has already clocked in and out
    vi.mocked(API.attendances.getByDate).mockResolvedValue([
      { 
        id: 101, 
        employeeId: 1, 
        date: '2023-10-10', 
        clockIn: dayjs('2023-10-10T08:00:00Z').valueOf(),
        clockOut: dayjs('2023-10-10T08:30:00Z').valueOf(),
      }
    ])

    render(<ClockIn />)
    const aliceCard = screen.getByText('Alice')
    
    await fireEvent.click(aliceCard)

    await waitFor(() => {
      expect(API.attendances.add).not.toHaveBeenCalled()
      expect(API.attendances.set).not.toHaveBeenCalled()
    })
  })
})
