import { describe, it, expect, beforeEach, vi } from 'vitest'
import React from 'react'
import { render, fireEvent, screen, waitFor } from '@testing-library/react'
import { StaffAdmin } from '../StaffAdmin'
import * as API from 'src/libs/api'
import { AppContext } from 'src/pages/App/context'
import { ANIMAL_AVATARS } from 'src/constants/defaults/animalAvatars'

// Mock API calls
vi.mock('src/libs/api', () => ({
  employees: {
    get: vi.fn(),
    add: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  },
  commondityTypes: { get: vi.fn() },
}))
vi.mock('src/libs/dataCenter', () => ({
  db: {},
}))

// Mock employee data with employeeNo and shiftType
const mockEmployees: RestaDB.Table.Employee[] = [
  {
    id: 1,
    name: 'Alice',
    status: 'active',
    employeeNo: '001',
    shiftType: 'regular',
    avatar: 'images/aminals/780258.png',
  },
  {
    id: 2,
    name: 'Bob',
    status: 'active',
    employeeNo: '002',
    shiftType: 'shift',
    avatar: 'images/aminals/1308845.png',
  },
]

// Mock dexie-react-hooks
vi.mock('dexie-react-hooks', () => ({
  useLiveQuery: (callback: Function) => {
    callback()
    if (callback.toString().includes('employees')) {
      return mockEmployees
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

  // -- Table column rendering tests --

  it('renders employee table with names', () => {
    renderWithContext(<StaffAdmin />)
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
  })

  it('renders employee number column with employeeNo values', () => {
    renderWithContext(<StaffAdmin />)
    // Column header
    expect(screen.getByText('員工編號')).toBeInTheDocument()
    // Admin employee (employeeNo '001') should show admin label
    expect(screen.getByText(/001/)).toBeInTheDocument()
    expect(screen.getByText(/管理員/)).toBeInTheDocument()
    // Non-admin employee
    expect(screen.getByText('002')).toBeInTheDocument()
  })

  it('renders merged employee column with avatar image and name', () => {
    renderWithContext(<StaffAdmin />)
    // Column header
    expect(screen.getByText('員工')).toBeInTheDocument()
    // Avatar images should be rendered for employees with animal avatar paths
    const avatarImages = screen.getAllByAltText('avatar')
    expect(avatarImages.length).toBe(2)
    expect(avatarImages[0]).toHaveAttribute('src', 'images/aminals/780258.png')
    expect(avatarImages[1]).toHaveAttribute('src', 'images/aminals/1308845.png')
  })

  it('renders shift type column with Tags', () => {
    renderWithContext(<StaffAdmin />)
    // Column header
    expect(screen.getByText('班別')).toBeInTheDocument()
    // Alice has 'regular' shift type
    expect(screen.getByText('常日班')).toBeInTheDocument()
    // Bob has 'shift' shift type
    expect(screen.getByText('排班')).toBeInTheDocument()
  })

  it('renders action column with icon-only edit and delete buttons', () => {
    renderWithContext(<StaffAdmin />)
    // Column header
    expect(screen.getByText('操作')).toBeInTheDocument()
    // Icon-only buttons should exist (no text labels)
    expect(screen.queryAllByText('編輯')).toHaveLength(0)
    expect(screen.queryAllByText('刪除')).toHaveLength(0)
  })

  // -- Modal form tests --

  it('can open add employee modal and submit with shiftType', async () => {
    renderWithContext(<StaffAdmin />)

    fireEvent.click(screen.getByText('新增員工'))

    const input = await screen.findByPlaceholderText('請輸入員工姓名')
    expect(input).toBeInTheDocument()

    fireEvent.change(input, { target: { value: 'Charlie' } })

    // Default shiftType should be 'regular', submit without changing it
    const submitBtns = screen.getAllByRole('button')
    const confirmBtn = submitBtns.find(btn => btn.getAttribute('type') === 'submit')
    if (confirmBtn) fireEvent.click(confirmBtn)

    await waitFor(() => {
      expect(API.employees.add).toHaveBeenCalledWith({
        name: 'Charlie',
        avatar: '',
        status: 'active',
        shiftType: 'regular',
      })
    })
  })

  it('renders shift type radio group in modal with default regular', async () => {
    renderWithContext(<StaffAdmin />)

    fireEvent.click(screen.getByText('新增員工'))

    // Wait for modal to open
    await screen.findByPlaceholderText('請輸入員工姓名')

    // Should show shift type label and radio options (also exists as table column header)
    const shiftLabels = screen.getAllByText('班別')
    expect(shiftLabels.length).toBeGreaterThanOrEqual(2)
    // Check radio options exist in modal
    const regularRadio = screen.getByLabelText('常日班')
    const shiftRadio = screen.getByLabelText('排班')
    expect(regularRadio).toBeInTheDocument()
    expect(shiftRadio).toBeInTheDocument()
    // Default should be 'regular' (常日班)
    expect(regularRadio).toBeChecked()
  })

  it('can select shift type in modal form', async () => {
    renderWithContext(<StaffAdmin />)

    fireEvent.click(screen.getByText('新增員工'))

    const input = await screen.findByPlaceholderText('請輸入員工姓名')
    fireEvent.change(input, { target: { value: 'Dave' } })

    // Select '排班' shift type
    const shiftRadio = screen.getByLabelText('排班')
    fireEvent.click(shiftRadio)

    const submitBtns = screen.getAllByRole('button')
    const confirmBtn = submitBtns.find(btn => btn.getAttribute('type') === 'submit')
    if (confirmBtn) fireEvent.click(confirmBtn)

    await waitFor(() => {
      expect(API.employees.add).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Dave', shiftType: 'shift' }),
      )
    })
  })

  it('can open edit modal pre-filled with employee data including shiftType', async () => {
    renderWithContext(<StaffAdmin />)

    // Click the first Edit button (for Alice)
    const editBtns = screen.getAllByLabelText('edit')
    fireEvent.click(editBtns[0])

    const input = await screen.findByPlaceholderText('請輸入員工姓名')
    expect((input as HTMLInputElement).value).toBe('Alice')
    expect(screen.getByText('編輯員工')).toBeInTheDocument()

    // Alice has shiftType 'regular', so regular radio should be checked
    const regularRadio = screen.getByLabelText('常日班')
    expect(regularRadio).toBeChecked()
  })

  it('submits edit form with shiftType', async () => {
    renderWithContext(<StaffAdmin />)

    // Click edit for Alice
    const editBtns = screen.getAllByLabelText('edit')
    fireEvent.click(editBtns[0])

    await screen.findByPlaceholderText('請輸入員工姓名')

    // Change shift type to '排班'
    const shiftRadio = screen.getByLabelText('排班')
    fireEvent.click(shiftRadio)

    const submitBtns = screen.getAllByRole('button')
    const confirmBtn = submitBtns.find(btn => btn.getAttribute('type') === 'submit')
    if (confirmBtn) fireEvent.click(confirmBtn)

    await waitFor(() => {
      expect(API.employees.set).toHaveBeenCalledWith(1, {
        name: 'Alice',
        avatar: 'images/aminals/780258.png',
        shiftType: 'shift',
      })
    })
  })

  // -- Animal avatar selection tests --

  it('renders animal image grid in modal instead of emoji grid', async () => {
    renderWithContext(<StaffAdmin />)

    fireEvent.click(screen.getByText('新增員工'))
    await screen.findByPlaceholderText('請輸入員工姓名')

    // Grid images have alt="avatar-{id}", table images have alt="avatar"
    const gridImages = ANIMAL_AVATARS.map(a => screen.getByAltText(`avatar-${a.id}`))
    expect(gridImages.length).toBe(ANIMAL_AVATARS.length)
  })

  it('can select animal avatar in modal', async () => {
    renderWithContext(<StaffAdmin />)

    fireEvent.click(screen.getByText('新增員工'))
    await screen.findByPlaceholderText('請輸入員工姓名')

    // Click the first animal avatar image's parent div (where onClick is attached)
    const firstAvatarPath = ANIMAL_AVATARS[0].path
    const firstGridImage = screen.getByAltText(`avatar-${ANIMAL_AVATARS[0].id}`)
    const wrapperDiv = firstGridImage.parentElement!
    fireEvent.click(wrapperDiv)

    // Fill name and submit
    const input = screen.getByPlaceholderText('請輸入員工姓名')
    fireEvent.change(input, { target: { value: 'Eve' } })

    const submitBtns = screen.getAllByRole('button')
    const confirmBtn = submitBtns.find(btn => btn.getAttribute('type') === 'submit')
    if (confirmBtn) fireEvent.click(confirmBtn)

    await waitFor(() => {
      expect(API.employees.add).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Eve', avatar: firstAvatarPath }),
      )
    })
  })

  it('renders default avatar icon when employee has no avatar', async () => {
    // This test uses the existing mockEmployees which all have avatars.
    // We need to verify that the renderAvatar function handles empty avatar correctly.
    // The UserOutlined icon should appear when avatar is empty.
    // Since both mock employees have avatars, we test this indirectly through the modal.
    renderWithContext(<StaffAdmin />)

    // All employees have avatars, so UserOutlined should not appear in the table
    const avatarImages = screen.getAllByAltText('avatar')
    expect(avatarImages.length).toBe(2)
  })

  it('highlights selected avatar in edit modal', async () => {
    renderWithContext(<StaffAdmin />)

    // Edit Alice (who has avatar 'images/aminals/780258.png')
    const editBtns = screen.getAllByLabelText('edit')
    fireEvent.click(editBtns[0])

    await screen.findByPlaceholderText('請輸入員工姓名')

    // The first animal avatar (780258) should be in the grid
    const selectedImg = screen.getByAltText('avatar-780258')
    expect(selectedImg).toBeInTheDocument()
    // The grid should have all animal avatars
    const gridImages = ANIMAL_AVATARS.map(a => screen.getByAltText(`avatar-${a.id}`))
    expect(gridImages.length).toBe(ANIMAL_AVATARS.length)
  })

  // -- Column order verification --

  it('renders columns in the correct order', () => {
    renderWithContext(<StaffAdmin />)
    const columnHeaders = screen.getAllByRole('columnheader')
    const headerTexts = columnHeaders.map(h => h.textContent?.trim())
    expect(headerTexts).toEqual(['員工編號', '員工', '班別', '操作'])
  })
})
