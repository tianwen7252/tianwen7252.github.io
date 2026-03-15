import { describe, it, expect, beforeEach, vi } from 'vitest'
import React from 'react'
import { render, fireEvent, screen, waitFor } from '@testing-library/react'
import { StaffAdmin } from '../StaffAdmin'
import * as API from 'src/libs/api'
import { AppContext } from 'src/pages/App/context'

// Mock API calls
vi.mock('src/libs/api', () => ({
  employees: {
    get: vi.fn(),
    add: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  },
  attendances: {
    getByDate: vi.fn(),
  },
  commondityTypes: { get: vi.fn() },
}))
vi.mock('src/libs/dataCenter', () => ({
  db: {},
}))

// Mock dexie-react-hooks
vi.mock('dexie-react-hooks', () => ({
  useLiveQuery: (callback: Function) => {
    callback()
    if (callback.toString().includes('employees')) {
      return [
        { id: 1, name: 'Alice', status: 'active' },
        { id: 2, name: 'Bob', status: 'active', avatar: '😊' },
      ]
    }
    if (callback.toString().includes('attendances')) {
      return []
    }
    return []
  },
}))

describe('StaffAdmin Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })
  })

  const renderWithContext = (ui: React.ReactElement) => {
    return render(
      <AppContext.Provider
        value={{
          adminInfo: { sub: 'test-sub', name: 'Admin', email: 'admin@test.com' },
          setAdminInfo: vi.fn(),
          gAPIToken: null,
          setGAPIToken: vi.fn(),
        } as any}
      >
        {ui}
      </AppContext.Provider>,
    )
  }

  it('renders employee table with names', () => {
    renderWithContext(<StaffAdmin />)
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
  })

  it('can open add employee modal and submit', async () => {
    renderWithContext(<StaffAdmin />)

    fireEvent.click(screen.getByText('新增員工'))

    const input = await screen.findByPlaceholderText('請輸入員工姓名')
    expect(input).toBeInTheDocument()

    fireEvent.change(input, { target: { value: 'Charlie' } })

    const submitBtns = screen.getAllByRole('button')
    const confirmBtn = submitBtns.find(btn => btn.getAttribute('type') === 'submit')
    if (confirmBtn) fireEvent.click(confirmBtn)

    await waitFor(() => {
      expect(API.employees.add).toHaveBeenCalledWith({
        name: 'Charlie',
        avatar: '',
        status: 'active',
      })
    })
  })

  it('can open edit modal pre-filled with employee data', async () => {
    renderWithContext(<StaffAdmin />)

    // Click the first Edit button (for Alice)
    const editBtns = screen.getAllByText('編輯')
    fireEvent.click(editBtns[0])

    const input = await screen.findByPlaceholderText('請輸入員工姓名')
    expect((input as HTMLInputElement).value).toBe('Alice')
    expect(screen.getByText('編輯員工')).toBeInTheDocument()
  })

  it('can select emoji avatar in modal', async () => {
    renderWithContext(<StaffAdmin />)

    fireEvent.click(screen.getByText('新增員工'))
    await screen.findByPlaceholderText('請輸入員工姓名')

    // Click the first emoji 😀
    const emojiItems = screen.getAllByText('😀')
    fireEvent.click(emojiItems[0])

    // The emoji should now be "selected" (visual state via CSS class, logic via form value)
    // Submit and verify avatar is passed
    const input = screen.getByPlaceholderText('請輸入員工姓名')
    fireEvent.change(input, { target: { value: 'Dave' } })

    const submitBtns = screen.getAllByRole('button')
    const confirmBtn = submitBtns.find(btn => btn.getAttribute('type') === 'submit')
    if (confirmBtn) fireEvent.click(confirmBtn)

    await waitFor(() => {
      expect(API.employees.add).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Dave', avatar: '😀' }),
      )
    })
  })
})
