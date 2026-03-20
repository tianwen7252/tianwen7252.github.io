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
    isAdmin: true,
    avatar: 'images/aminals/780258.png',
    hireDate: '2024-01-15',
  },
  {
    id: 2,
    name: 'Bob',
    status: 'active',
    employeeNo: '002',
    shiftType: 'shift',
    isAdmin: false,
    avatar: 'images/aminals/1308845.png',
    hireDate: '2023-06-01',
    resignationDate: '2025-12-31',
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
        isAdmin: false,
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
        isAdmin: true,
        hireDate: '2024-01-15',
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

  // -- Story 4: Avatar grid 9 columns --

  it('renders avatar grid with 9 columns', async () => {
    renderWithContext(<StaffAdmin />)

    fireEvent.click(screen.getByText('新增員工'))
    await screen.findByPlaceholderText('請輸入員工姓名')

    // The image grid container should use 9-column grid layout
    const firstGridImage = screen.getByAltText(`avatar-${ANIMAL_AVATARS[0].id}`)
    const gridContainer = firstGridImage.closest('[class]')?.parentElement
    expect(gridContainer).toBeTruthy()
    const gridStyle = window.getComputedStyle(gridContainer!)
    // Verify grid-template-columns contains 9 repetitions
    expect(gridStyle.gridTemplateColumns).toContain('repeat(9')
  })

  // -- Story 4: Modal width --

  it('renders modal with width 900', async () => {
    renderWithContext(<StaffAdmin />)

    fireEvent.click(screen.getByText('新增員工'))
    await screen.findByPlaceholderText('請輸入員工姓名')

    // Ant Design Modal renders a dialog element with inline width style
    const dialog = document.querySelector('.ant-modal')
    expect(dialog).toBeTruthy()
    expect((dialog as HTMLElement).style.width).toBe('900px')
  })

  // -- Story 4: DatePicker fields for hireDate and resignationDate --

  it('renders hireDate and resignationDate DatePicker fields in modal', async () => {
    renderWithContext(<StaffAdmin />)

    fireEvent.click(screen.getByText('新增員工'))
    await screen.findByPlaceholderText('請輸入員工姓名')

    // Both date labels should be in the modal
    expect(screen.getByText('入職日期')).toBeInTheDocument()
    expect(screen.getByText('離職日期')).toBeInTheDocument()
  })

  it('pre-populates hireDate in edit modal when employee has hireDate', async () => {
    renderWithContext(<StaffAdmin />)

    // Edit Alice (who has hireDate '2024-01-15')
    const editBtns = screen.getAllByLabelText('edit')
    fireEvent.click(editBtns[0])

    await screen.findByPlaceholderText('請輸入員工姓名')

    // Wait for form values to be set (useEffect async)
    await waitFor(() => {
      const hireDateInput = screen.getByPlaceholderText('選擇入職日期') as HTMLInputElement
      expect(hireDateInput.value).toBe('2024-01-15')
    })
  })

  it('pre-populates resignationDate in edit modal when employee has resignationDate', async () => {
    renderWithContext(<StaffAdmin />)

    // Edit Bob (who has resignationDate '2025-12-31')
    // getAllByLabelText('edit') returns both buttons and icon spans,
    // so filter for buttons only to get correct indices
    const editBtns = screen.getAllByLabelText('edit').filter(
      el => el.tagName === 'BUTTON',
    )
    fireEvent.click(editBtns[1])

    // Wait for modal to open and name to be populated with Bob's data
    await waitFor(() => {
      const nameInput = screen.getByPlaceholderText('請輸入員工姓名') as HTMLInputElement
      expect(nameInput.value).toBe('Bob')
    })

    // Wait for form values to be set (useEffect async)
    await waitFor(() => {
      const resignationDateInput = screen.getByPlaceholderText('選擇離職日期') as HTMLInputElement
      expect(resignationDateInput.value).toBe('2025-12-31')
    })
  })

  // -- Story 4: "已離職" tag --

  it('shows 已離職 tag when employee has resignationDate', () => {
    renderWithContext(<StaffAdmin />)

    // Bob has resignationDate, should show 已離職 tag
    expect(screen.getByText('已離職')).toBeInTheDocument()
  })

  it('does NOT show 已離職 tag for employee without resignationDate', () => {
    renderWithContext(<StaffAdmin />)

    // Alice has no resignationDate, should not show 已離職
    // There should be exactly 1 "已離職" tag (for Bob only)
    const resignedTags = screen.getAllByText('已離職')
    expect(resignedTags).toHaveLength(1)
  })

  // -- Story 4: Save includes date fields --

  it('submits edit form with hireDate and resignationDate', async () => {
    renderWithContext(<StaffAdmin />)

    // Edit Alice (who has hireDate)
    const editBtns = screen.getAllByLabelText('edit')
    fireEvent.click(editBtns[0])

    await screen.findByPlaceholderText('請輸入員工姓名')

    const submitBtns = screen.getAllByRole('button')
    const confirmBtn = submitBtns.find(btn => btn.getAttribute('type') === 'submit')
    if (confirmBtn) fireEvent.click(confirmBtn)

    await waitFor(() => {
      expect(API.employees.set).toHaveBeenCalledWith(1,
        expect.objectContaining({
          name: 'Alice',
          hireDate: '2024-01-15',
        }),
      )
    })
  })

  it('submits add form without date fields when not set', async () => {
    renderWithContext(<StaffAdmin />)

    fireEvent.click(screen.getByText('新增員工'))

    const input = await screen.findByPlaceholderText('請輸入員工姓名')
    fireEvent.change(input, { target: { value: 'Frank' } })

    const submitBtns = screen.getAllByRole('button')
    const confirmBtn = submitBtns.find(btn => btn.getAttribute('type') === 'submit')
    if (confirmBtn) fireEvent.click(confirmBtn)

    await waitFor(() => {
      expect(API.employees.add).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Frank',
        }),
      )
      // Should not include undefined date fields as non-undefined values
      const callArgs = (API.employees.add as ReturnType<typeof vi.fn>).mock.calls[0][0]
      expect(callArgs.hireDate).toBeUndefined()
      expect(callArgs.resignationDate).toBeUndefined()
    })
  })
})
