import { describe, it, expect, beforeEach, vi } from 'vitest'
import React from 'react'
import { render, fireEvent, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Keyboard, getChange } from '../Keyboard'
import { AppContext } from 'src/pages/App/context'
import { CONFIG } from 'src/constants/defaults/config'

// Mock the hooks
vi.mock('dexie-react-hooks', () => ({
  useLiveQuery: (callback: Function) => {
    // Mock different responses based on the callback
    if (callback.toString().includes('commondityTypes')) {
      return [
        { id: '1', type: 'food', label: 'Food', color: 'blue', typeID: '1' },
      ]
    }
    if (callback.toString().includes('commondity')) {
      return { '1': [{ name: 'Item 1', price: 100, visible: true }] }
    }
    if (callback.toString().includes('orderTypes')) {
      return [
        { name: '內用', color: 'blue', type: 'meal' },
        { name: '外帶', color: 'green', type: 'meal' },
        { name: '優惠價', color: 'red', type: 'order' },
      ]
    }
    return []
  },
}))

const mockAppContext = {
  API: {
    commondityTypes: { get: vi.fn() },
    commondity: { getMapData: vi.fn() },
    orderTypes: { get: vi.fn() },
  },
  appEvent: {
    fire: vi.fn(),
    on: vi.fn(() => () => {}),
    ORDER_AFTER_ACTION: 'ORDER_AFTER_ACTION',
    KEYBOARD_ON_ACTION: 'KEYBOARD_ON_ACTION',
    KEYBOARD_ON_CANCEL_EDIT: 'KEYBOARD_ON_CANCEL_EDIT',
  },
  isTablet: false,
}

describe('Keyboard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders correctly with default props', () => {
    render(
      <AppContext.Provider value={mockAppContext}>
        <Keyboard callOrderAPI={vi.fn()} />
      </AppContext.Provider>,
    )

    expect(screen.getByText('清除')).toBeInTheDocument()
    expect(
      screen.getByText(CONFIG.KEYBOARD_SUBMIT_BTN_TEXT),
    ).toBeInTheDocument()
  })

  it('handles number input correctly', async () => {
    render(
      <AppContext.Provider value={mockAppContext}>
        <Keyboard callOrderAPI={vi.fn()} />
      </AppContext.Provider>,
    )

    const numberButton = screen.getByText('1')
    await fireEvent.click(numberButton)

    await waitFor(() => {
      expect(screen.getByText('= $1')).toBeInTheDocument()
    })
  })

  it('handles edit mode correctly', async () => {
    const mockCallOrderAPI = vi.fn()
    render(
      <AppContext.Provider value={mockAppContext}>
        <Keyboard
          editMode={true}
          record={{
            data: [],
            total: 100,
            number: 1,
            memo: ['內用'],
          }}
          callOrderAPI={mockCallOrderAPI}
        />
      </AppContext.Provider>,
    )

    expect(screen.getByText(/編輯訂單/)).toBeInTheDocument()
  })

  it('handles total editing correctly', async () => {
    const user = userEvent.setup()

    render(
      <AppContext.Provider value={mockAppContext}>
        <Keyboard callOrderAPI={vi.fn()} />
      </AppContext.Provider>,
    )

    // Add some value first
    const numberButton = screen.getByText('1')
    await user.click(numberButton)

    // Click edit button
    const editButton = screen.getByRole('button', { name: /edit/i })
    await user.click(editButton)

    // Check if modal appears
    expect(screen.getByText('設定訂單總金額')).toBeInTheDocument()

    // Edit the total
    const input = screen.getByRole('spinbutton')
    await user.clear(input)
    await user.type(input, '50')

    // Confirm changes
    const confirmButton = screen.getByText('確定修改')
    await user.click(confirmButton)

    // Check if the new total is displayed
    expect(screen.getByText('= $50')).toBeInTheDocument()
    // Check if 優惠價 tag is added
    expect(screen.getByText('優惠價')).toBeInTheDocument()
  })
})

describe('getChange Function', () => {
  it('calculates change correctly', () => {
    expect(getChange(900)).toEqual([[1000, 1000, 100]])

    expect(getChange(400)).toEqual([[500, 500, 100]])

    expect(getChange(5000)).toBeNull() // Too large amount
  })
})
