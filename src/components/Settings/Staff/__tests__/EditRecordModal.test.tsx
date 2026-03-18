import { describe, it, expect, beforeEach, vi } from 'vitest'
import React from 'react'
import { render, fireEvent, screen, waitFor } from '@testing-library/react'
import dayjs from 'dayjs'
import { EditRecordModal } from '../EditRecordModal'
import * as API from 'src/libs/api'

vi.mock('src/libs/api', () => ({
  attendances: {
    set: vi.fn(),
  },
}))

// Mock matchMedia for antd
window.matchMedia = window.matchMedia || function() {
    return {
        matches: false,
        addListener: function() {},
        removeListener: function() {}
    };
};

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
      clockOut: dayjs('2023-10-10T18:00:00Z').valueOf()
    }

    render(
      <EditRecordModal 
        record={mockRecord} 
        empName="Alice" 
        onCancel={vi.fn()} 
        onSuccess={vi.fn()} 
      />
    )

    expect(screen.getByText('修改打卡紀錄: Alice (2023-10-10)')).toBeInTheDocument()
    // Finding default value is more complex with antd DatePicker, but it mounts successfully
  })
})
