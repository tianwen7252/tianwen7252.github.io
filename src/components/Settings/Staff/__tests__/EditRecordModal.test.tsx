import { describe, it, expect, beforeEach, vi } from 'vitest'
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import dayjs from 'dayjs'
import { EditRecordModal } from '../EditRecordModal'
import * as API from 'src/libs/api'

vi.mock('src/libs/api', () => ({
  attendances: {
    set: vi.fn(),
  },
}))

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
      // Find the form item for clockOut (下班時間) and verify its input is disabled
      const clockOutLabel = screen.getByText('下班時間')
      const formItem = clockOutLabel.closest('.ant-form-item')
      expect(formItem).toBeDefined()
      const input = formItem!.querySelector('input')
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
      const clockOutLabel = screen.getByText('下班時間')
      const formItem = clockOutLabel.closest('.ant-form-item')
      expect(formItem).toBeDefined()
      const input = formItem!.querySelector('input')
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
      const clockOutLabel = screen.getByText('下班時間')
      const formItem = clockOutLabel.closest('.ant-form-item')
      expect(formItem).toBeDefined()
      const input = formItem!.querySelector('input')
      expect(input).not.toHaveAttribute('disabled')
    })
  })
})
