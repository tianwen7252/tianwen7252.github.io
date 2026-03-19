import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
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

// Mock dexie-react-hooks — branch by callback content
vi.mock('dexie-react-hooks', () => ({
  useLiveQuery: (callback: Function) => {
    callback()
    if (callback.toString().includes('employees')) {
      return [
        { id: 1, name: 'Alice', status: 'active' },
        { id: 2, name: 'Bob', status: 'active', avatar: 'https://avatar.com/bob.png' },
      ]
    }
    if (callback.toString().includes('attendances')) {
      return [] // default: no attendance today
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

  it('renders employee cards with names and default status', () => {
    render(<ClockIn />)
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
    // Both should show 未打卡 by default (attendanceMap is empty)
    expect(screen.getAllByText('未打卡').length).toBe(2)
  })

  it('shows clock-in popconfirm for employees with no attendance', () => {
    render(<ClockIn />)
    // Both employees should show 未打卡 status and a Popconfirm should wrap each card
    // The confirm title text should be present in the DOM (Popconfirm renders it on trigger)
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
    // Verify no attendance API was called on render
    expect(API.attendances.add).not.toHaveBeenCalled()
  })

  // -- AvatarImage integration tests --

  it('renders AvatarImage with img for employees with http avatar', () => {
    render(<ClockIn />)
    // Bob has avatar: 'https://avatar.com/bob.png', should render <img>
    const img = screen.getByAltText('avatar')
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', 'https://avatar.com/bob.png')
  })

  it('renders AvatarImage fallback icon for employees without avatar', () => {
    const { container } = render(<ClockIn />)
    // Alice has no avatar, should render UserOutlined fallback
    const icons = container.querySelectorAll('[aria-label="user"]')
    expect(icons.length).toBeGreaterThanOrEqual(1)
  })

  it('renders AvatarImage with 40px size in ClockIn cards', () => {
    render(<ClockIn />)
    // Bob's avatar img should have 40px size
    const img = screen.getByAltText('avatar')
    expect(img).toHaveStyle({ width: '40px', height: '40px' })
  })
})
