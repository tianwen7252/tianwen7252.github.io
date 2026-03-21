import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StaffAdmin } from './staff-admin'
import { mockEmployeeService } from '@/services/mock-data'

// Mock the modal component to avoid Radix Portal issues in tests
vi.mock('@/components/modal', () => ({
  Modal: ({
    open,
    title,
    children,
    footer,
    onClose,
  }: {
    open: boolean
    title: string
    children: React.ReactNode
    footer?: React.ReactNode
    onClose: () => void
  }) =>
    open ? (
      <div data-testid="modal" role="dialog" aria-label={title}>
        <h2>{title}</h2>
        {children}
        {footer}
        <button onClick={onClose}>close-modal</button>
      </div>
    ) : null,
  ConfirmModal: ({
    open,
    title,
    children,
    onConfirm,
    onCancel,
  }: {
    open: boolean
    title: string
    children?: React.ReactNode
    onConfirm: () => void
    onCancel: () => void
  }) =>
    open ? (
      <div data-testid="confirm-modal" role="dialog" aria-label={title}>
        <h2>{title}</h2>
        {children}
        <button onClick={onConfirm}>確認</button>
        <button onClick={onCancel}>取消</button>
      </div>
    ) : null,
}))

// Mock AvatarImage to simplify testing
vi.mock('@/components/avatar-image', () => ({
  AvatarImage: ({ avatar, size }: { avatar?: string; size?: number }) => (
    <img
      data-testid="avatar-image"
      src={avatar ?? ''}
      style={{ width: size, height: size }}
      alt="avatar"
    />
  ),
}))

describe('StaffAdmin', () => {
  beforeEach(() => {
    mockEmployeeService.reset()
  })

  describe('employee table rendering', () => {
    it('should render the employee table with column headers', () => {
      render(<StaffAdmin />)
      expect(screen.getByText('員工編號')).toBeTruthy()
      expect(screen.getByText('員工')).toBeTruthy()
      expect(screen.getByText('入職日期')).toBeTruthy()
      expect(screen.getByText('離職日期')).toBeTruthy()
      expect(screen.getByText('班別')).toBeTruthy()
      expect(screen.getByText('操作')).toBeTruthy()
    })

    it('should render employees from mock data', () => {
      render(<StaffAdmin />)
      expect(screen.getByText('王小明')).toBeTruthy()
      expect(screen.getByText('李美玲')).toBeTruthy()
      expect(screen.getByText('張大偉')).toBeTruthy()
    })

    it('should show admin tag for admin employees', () => {
      render(<StaffAdmin />)
      // Wang Xiao Ming is admin
      expect(screen.getByText('管理員')).toBeTruthy()
    })

    it('should show resigned tag for inactive employees', () => {
      render(<StaffAdmin />)
      // Lin Zhi Ming is inactive (resigned)
      expect(screen.getByText('已離職')).toBeTruthy()
    })

    it('should show shift type labels', () => {
      render(<StaffAdmin />)
      // Multiple employees have regular shift type
      expect(screen.getAllByText('常日班').length).toBeGreaterThan(0)
      expect(screen.getAllByText('排班').length).toBeGreaterThan(0)
    })

    it('should render add employee button', () => {
      render(<StaffAdmin />)
      expect(screen.getByRole('button', { name: /新增員工/ })).toBeTruthy()
    })
  })

  describe('add employee modal', () => {
    it('should open add modal when add button is clicked', async () => {
      const user = userEvent.setup()
      render(<StaffAdmin />)
      await user.click(screen.getByRole('button', { name: /新增員工/ }))
      expect(screen.getByRole('dialog', { name: '新增員工' })).toBeTruthy()
    })

    it('should close add modal on close', async () => {
      const user = userEvent.setup()
      render(<StaffAdmin />)
      await user.click(screen.getByRole('button', { name: /新增員工/ }))
      expect(screen.getByRole('dialog')).toBeTruthy()

      await user.click(screen.getByText('close-modal'))
      expect(screen.queryByRole('dialog')).toBeNull()
    })

    it('should validate that name is required on submit', async () => {
      const user = userEvent.setup()
      render(<StaffAdmin />)
      await user.click(screen.getByRole('button', { name: /新增員工/ }))

      // Try to submit with empty name
      const submitButton = screen.getByRole('button', { name: '確認' })
      await user.click(submitButton)

      // Should show validation error
      expect(screen.getByText('請輸入員工姓名')).toBeTruthy()
    })

    it('should add employee and close modal on valid submit', async () => {
      const user = userEvent.setup()
      render(<StaffAdmin />)
      const initialCount = mockEmployeeService.getAll().length

      await user.click(screen.getByRole('button', { name: /新增員工/ }))

      // Fill in name
      const nameInput = screen.getByPlaceholderText('請輸入員工姓名')
      await user.type(nameInput, '新員工')

      // Submit
      await user.click(screen.getByRole('button', { name: '確認' }))

      // Modal should close
      expect(screen.queryByRole('dialog')).toBeNull()

      // New employee should appear in the table
      expect(screen.getByText('新員工')).toBeTruthy()
      expect(mockEmployeeService.getAll().length).toBe(initialCount + 1)
    })
  })

  describe('edit employee modal', () => {
    it('should open edit modal with pre-filled data when edit button is clicked', async () => {
      const user = userEvent.setup()
      render(<StaffAdmin />)

      // Click first edit button (for Wang Xiao Ming)
      const editButtons = screen.getAllByLabelText('編輯')
      await user.click(editButtons[0]!)

      const dialog = screen.getByRole('dialog', { name: '編輯員工' })
      expect(dialog).toBeTruthy()

      // Name should be pre-filled
      const nameInput = within(dialog).getByDisplayValue('王小明')
      expect(nameInput).toBeTruthy()
    })

    it('should show resignation date field only in edit mode', async () => {
      const user = userEvent.setup()
      render(<StaffAdmin />)

      // Open add modal — resignation date input should NOT exist
      await user.click(screen.getByRole('button', { name: /新增員工/ }))
      expect(screen.queryByLabelText('離職日期')).toBeNull()
      await user.click(screen.getByText('close-modal'))

      // Open edit modal — resignation date input SHOULD exist
      const editButtons = screen.getAllByLabelText('編輯')
      await user.click(editButtons[0]!)
      expect(screen.getByLabelText('離職日期')).toBeTruthy()
    })

    it('should update employee name and close modal on edit submit', async () => {
      const user = userEvent.setup()
      render(<StaffAdmin />)

      // Open edit modal for first employee (Wang Xiao Ming)
      const editButtons = screen.getAllByLabelText('編輯')
      await user.click(editButtons[0]!)

      const dialog = screen.getByRole('dialog', { name: '編輯員工' })
      const nameInput = within(dialog).getByDisplayValue('王小明')

      // Clear and type new name
      await user.clear(nameInput)
      await user.type(nameInput, '王大明')

      // Submit
      await user.click(screen.getByRole('button', { name: '確認' }))

      // Modal should close
      expect(screen.queryByRole('dialog')).toBeNull()

      // Updated name should appear
      expect(screen.getByText('王大明')).toBeTruthy()
      expect(screen.queryByText('王小明')).toBeNull()
    })

    it('should validate name is required on edit submit', async () => {
      const user = userEvent.setup()
      render(<StaffAdmin />)

      const editButtons = screen.getAllByLabelText('編輯')
      await user.click(editButtons[0]!)

      const dialog = screen.getByRole('dialog', { name: '編輯員工' })
      const nameInput = within(dialog).getByDisplayValue('王小明')
      await user.clear(nameInput)

      await user.click(screen.getByRole('button', { name: '確認' }))

      // Should show validation error
      expect(screen.getByText('請輸入員工姓名')).toBeTruthy()
    })

    it('should clear name error when user starts typing', async () => {
      const user = userEvent.setup()
      render(<StaffAdmin />)

      // Open add modal and trigger validation error
      await user.click(screen.getByRole('button', { name: /新增員工/ }))
      await user.click(screen.getByRole('button', { name: '確認' }))
      expect(screen.getByText('請輸入員工姓名')).toBeTruthy()

      // Start typing — error should clear
      const nameInput = screen.getByPlaceholderText('請輸入員工姓名')
      await user.type(nameInput, 'A')
      expect(screen.queryByText('請輸入員工姓名')).toBeNull()
    })

    it('should update employee with resignation date to set status inactive', async () => {
      const user = userEvent.setup()
      render(<StaffAdmin />)

      // Edit second employee (active, no resignation date)
      const editButtons = screen.getAllByLabelText('編輯')
      await user.click(editButtons[1]!)

      // Set a resignation date using the labeled input
      const resignInput = screen.getByLabelText('離職日期')
      await user.type(resignInput, '2026-12-31')

      await user.click(screen.getByRole('button', { name: '確認' }))

      // Employee should be updated in mock service
      const updated = mockEmployeeService.getById('emp-002')
      expect(updated?.resignationDate).toBe('2026-12-31')
      expect(updated?.status).toBe('inactive')
    })
  })

  describe('delete employee', () => {
    it('should show confirm modal when delete button is clicked', async () => {
      const user = userEvent.setup()
      render(<StaffAdmin />)

      const deleteButtons = screen.getAllByLabelText('刪除')
      await user.click(deleteButtons[0]!)

      expect(screen.getByTestId('confirm-modal')).toBeTruthy()
    })

    it('should remove employee after confirming delete', async () => {
      const user = userEvent.setup()
      render(<StaffAdmin />)

      const initialCount = mockEmployeeService.getAll().length
      const deleteButtons = screen.getAllByLabelText('刪除')
      await user.click(deleteButtons[0]!)

      // Confirm deletion
      const confirmModal = screen.getByTestId('confirm-modal')
      await user.click(within(confirmModal).getByText('確認'))

      expect(mockEmployeeService.getAll().length).toBe(initialCount - 1)
    })

    it('should cancel delete and keep employee', async () => {
      const user = userEvent.setup()
      render(<StaffAdmin />)

      const initialCount = mockEmployeeService.getAll().length
      const deleteButtons = screen.getAllByLabelText('刪除')
      await user.click(deleteButtons[0]!)

      // Cancel deletion
      const confirmModal = screen.getByTestId('confirm-modal')
      await user.click(within(confirmModal).getByText('取消'))

      expect(mockEmployeeService.getAll().length).toBe(initialCount)
      expect(screen.queryByTestId('confirm-modal')).toBeNull()
    })
  })

  describe('form fields', () => {
    it('should change shift type via radio buttons', async () => {
      const user = userEvent.setup()
      render(<StaffAdmin />)
      await user.click(screen.getByRole('button', { name: /新增員工/ }))

      // Default should be regular
      const regularRadio = screen.getByLabelText('常日班')
      const shiftRadio = screen.getByLabelText('排班')
      expect((regularRadio as HTMLInputElement).checked).toBe(true)
      expect((shiftRadio as HTMLInputElement).checked).toBe(false)

      // Switch to shift type
      await user.click(shiftRadio)
      expect((shiftRadio as HTMLInputElement).checked).toBe(true)
      expect((regularRadio as HTMLInputElement).checked).toBe(false)
    })

    it('should toggle admin checkbox', async () => {
      const user = userEvent.setup()
      render(<StaffAdmin />)
      await user.click(screen.getByRole('button', { name: /新增員工/ }))

      const adminCheckbox = screen.getByLabelText('管理員權限')
      expect((adminCheckbox as HTMLInputElement).checked).toBe(false)

      await user.click(adminCheckbox)
      expect((adminCheckbox as HTMLInputElement).checked).toBe(true)
    })

    it('should set hire date', async () => {
      const user = userEvent.setup()
      render(<StaffAdmin />)
      await user.click(screen.getByRole('button', { name: /新增員工/ }))

      const hireDateInput = screen.getByLabelText('入職日期')
      await user.type(hireDateInput, '2026-01-15')
      expect((hireDateInput as HTMLInputElement).value).toBe('2026-01-15')
    })

    it('should display dash for missing dates', () => {
      render(<StaffAdmin />)
      // Most employees without resignation date should show "-"
      const dashes = screen.getAllByText('-')
      expect(dashes.length).toBeGreaterThan(0)
    })
  })

  describe('avatar picker', () => {
    it('should render avatar grid in the add modal', async () => {
      const user = userEvent.setup()
      render(<StaffAdmin />)
      await user.click(screen.getByRole('button', { name: /新增員工/ }))

      // Avatar grid should contain animal avatar buttons
      const avatarButtons = screen.getAllByTestId('avatar-option')
      expect(avatarButtons.length).toBe(27) // All ANIMAL_AVATARS
    })

    it('should select avatar when clicked', async () => {
      const user = userEvent.setup()
      render(<StaffAdmin />)
      await user.click(screen.getByRole('button', { name: /新增員工/ }))

      const avatarButtons = screen.getAllByTestId('avatar-option')
      await user.click(avatarButtons[0]!)

      // Selected avatar should have visual indicator
      expect(avatarButtons[0]!.getAttribute('data-selected')).toBe('true')
    })
  })
})
