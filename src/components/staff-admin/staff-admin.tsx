import { useState, useCallback } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { Modal, ConfirmModal } from '@/components/modal'
import { AvatarImage } from '@/components/avatar-image'
import { ANIMAL_AVATARS } from '@/constants/animal-avatars'
import { SHIFT_TYPES } from '@/constants/shift-types'
import { api } from '@/api'
import type { Employee, CreateEmployee } from '@/lib/schemas'
import type { ShiftType } from '@/constants/shift-types'

// Initial form state for the add/edit modal
const INITIAL_FORM: FormState = {
  name: '',
  avatar: '',
  shiftType: 'regular',
  isAdmin: false,
  hireDate: '',
  resignationDate: '',
}

interface FormState {
  readonly name: string
  readonly avatar: string
  readonly shiftType: ShiftType
  readonly isAdmin: boolean
  readonly hireDate: string
  readonly resignationDate: string
}

/**
 * Builds the shift type label lookup map from SHIFT_TYPES constants.
 */
function buildShiftLabelMap(): ReadonlyMap<string, string> {
  return new Map(SHIFT_TYPES.map(s => [s.key, s.label]))
}

const SHIFT_LABEL_MAP = buildShiftLabelMap()

/**
 * StaffAdmin component - Employee management CRUD interface.
 * Renders a table of employees with add/edit/delete capabilities.
 */
export function StaffAdmin() {
  const [employees, setEmployees] = useState<readonly Employee[]>(() =>
    api.employees.getAll(),
  )
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null)
  const [form, setForm] = useState<FormState>(INITIAL_FORM)
  const [nameError, setNameError] = useState('')

  // Refresh employee list from mock service
  const refreshEmployees = useCallback(() => {
    setEmployees(api.employees.getAll())
  }, [])

  // Update a single form field (immutable)
  const updateField = useCallback(
    <K extends keyof FormState>(field: K, value: FormState[K]) => {
      setForm(prev => ({ ...prev, [field]: value }))
      if (field === 'name') {
        setNameError('')
      }
    },
    [],
  )

  // Open add modal
  const handleAdd = useCallback(() => {
    setEditingEmployee(null)
    setForm(INITIAL_FORM)
    setNameError('')
    setIsModalOpen(true)
  }, [])

  // Open edit modal with pre-filled data
  const handleEdit = useCallback((employee: Employee) => {
    setEditingEmployee(employee)
    setForm({
      name: employee.name,
      avatar: employee.avatar ?? '',
      shiftType: employee.shiftType as ShiftType,
      isAdmin: employee.isAdmin,
      hireDate: employee.hireDate ?? '',
      resignationDate: employee.resignationDate ?? '',
    })
    setNameError('')
    setIsModalOpen(true)
  }, [])

  // Close the add/edit modal
  const handleClose = useCallback(() => {
    setIsModalOpen(false)
    setEditingEmployee(null)
    setForm(INITIAL_FORM)
    setNameError('')
  }, [])

  // Submit form (add or update)
  const handleSubmit = useCallback(() => {
    const trimmedName = form.name.trim()
    if (!trimmedName) {
      setNameError('請輸入員工姓名')
      return
    }

    if (editingEmployee) {
      // Update existing employee
      api.employees.update(editingEmployee.id, {
        name: trimmedName,
        avatar: form.avatar || undefined,
        shiftType: form.shiftType,
        isAdmin: form.isAdmin,
        hireDate: form.hireDate || undefined,
        resignationDate: form.resignationDate || undefined,
        status: form.resignationDate ? 'inactive' : 'active',
      })
    } else {
      // Generate next employee number
      const allEmployees = api.employees.getAll()
      const maxNo = allEmployees.reduce((max, e) => {
        const num = parseInt(e.employeeNo?.replace('E', '') ?? '0', 10)
        return num > max ? num : max
      }, 0)
      const employeeNo = `E${String(maxNo + 1).padStart(3, '0')}`

      const newEmployee: CreateEmployee = {
        name: trimmedName,
        avatar: form.avatar || undefined,
        shiftType: form.shiftType,
        isAdmin: form.isAdmin,
        hireDate: form.hireDate || undefined,
        employeeNo,
        status: 'active',
      }
      api.employees.add(newEmployee)
    }

    refreshEmployees()
    handleClose()
  }, [form, editingEmployee, refreshEmployees, handleClose])

  // Initiate delete confirmation
  const handleDeleteClick = useCallback((employee: Employee) => {
    setDeleteTarget(employee)
  }, [])

  // Confirm deletion
  const handleDeleteConfirm = useCallback(() => {
    if (deleteTarget) {
      api.employees.remove(deleteTarget.id)
      refreshEmployees()
    }
    setDeleteTarget(null)
  }, [deleteTarget, refreshEmployees])

  // Cancel deletion
  const handleDeleteCancel = useCallback(() => {
    setDeleteTarget(null)
  }, [])

  return (
    <div className="p-6">
      {/* Header with add button */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">員工管理</h2>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          onClick={handleAdd}
        >
          <Plus size={16} />
          新增員工
        </button>
      </div>

      {/* Employee table */}
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left text-sm font-bold text-[#475569]">
                員工編號
              </th>
              <th className="px-4 py-3 text-left text-sm font-bold text-[#475569]">
                員工
              </th>
              <th className="px-4 py-3 text-left text-sm font-bold text-[#475569]">
                入職日期
              </th>
              <th className="px-4 py-3 text-left text-sm font-bold text-[#475569]">
                離職日期
              </th>
              <th className="px-4 py-3 text-left text-sm font-bold text-[#475569]">
                班別
              </th>
              <th className="px-4 py-3 text-left text-sm font-bold text-[#475569]">
                操作
              </th>
            </tr>
          </thead>
          <tbody>
            {employees.map(employee => (
              <EmployeeRow
                key={employee.id}
                employee={employee}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        open={isModalOpen}
        title={editingEmployee ? '編輯員工' : '新增員工'}
        variant={editingEmployee ? 'warm' : 'green'}
        shineColor={editingEmployee ? 'purple' : 'green'}
        onClose={handleClose}
        footer={
          <div className="flex justify-center gap-3">
            <button
              type="button"
              className="rounded-lg border border-border px-6 py-2 text-sm font-semibold text-muted-foreground hover:bg-accent"
              onClick={handleClose}
            >
              取消
            </button>
            <button
              type="button"
              className="rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              onClick={handleSubmit}
            >
              確認
            </button>
          </div>
        }
      >
        <EmployeeForm
          form={form}
          nameError={nameError}
          isEditing={!!editingEmployee}
          onFieldChange={updateField}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={!!deleteTarget}
        title="確認刪除員工"
        variant="red"
        shineColor="red"
        confirmText="確認刪除"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      >
        {deleteTarget && (
          <div className="flex flex-col items-center gap-2">
            <AvatarImage avatar={deleteTarget.avatar} size={48} />
            <p className="text-sm text-foreground">
              確定要刪除員工「{deleteTarget.name}」嗎？
            </p>
          </div>
        )}
      </ConfirmModal>
    </div>
  )
}

// ─── EmployeeRow ──────────────────────────────────────────────────────────────

interface EmployeeRowProps {
  readonly employee: Employee
  readonly onEdit: (employee: Employee) => void
  readonly onDelete: (employee: Employee) => void
}

/**
 * Single row in the employee table.
 * Shows employee number with status tags, avatar+name, dates, shift, and actions.
 */
function EmployeeRow({ employee, onEdit, onDelete }: EmployeeRowProps) {
  const shiftLabel =
    SHIFT_LABEL_MAP.get(employee.shiftType) ?? employee.shiftType

  return (
    <tr className="border-b border-border last:border-b-0 hover:bg-muted/30">
      {/* Employee number with tags */}
      <td className="px-4 py-3">
        <div className="flex flex-col gap-1">
          <span className="font-mono text-sm">{employee.employeeNo}</span>
          <div className="flex gap-1">
            {employee.isAdmin && (
              <span className="rounded-md bg-amber-100 px-1.5 py-0.5 text-sm font-medium text-amber-800">
                管理員
              </span>
            )}
            {employee.status === 'inactive' && (
              <span className="rounded-md bg-red-100 px-1.5 py-0.5 text-sm font-medium text-red-800">
                已離職
              </span>
            )}
          </div>
        </div>
      </td>

      {/* Avatar + name */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <AvatarImage avatar={employee.avatar} size={32} />
          <span className="text-sm font-medium text-foreground">
            {employee.name}
          </span>
        </div>
      </td>

      {/* Hire date */}
      <td className="px-4 py-3 text-muted-foreground">
        {employee.hireDate ?? '-'}
      </td>

      {/* Resignation date */}
      <td className="px-4 py-3 text-muted-foreground">
        {employee.resignationDate ?? '-'}
      </td>

      {/* Shift type */}
      <td className="px-4 py-3">
        <span className="rounded-full bg-muted px-2.5 py-0.5 text-sm font-medium text-muted-foreground">
          {shiftLabel}
        </span>
      </td>

      {/* Actions */}
      <td className="px-4 py-3">
        <div className="flex gap-2">
          <button
            type="button"
            aria-label="編輯"
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
            onClick={() => onEdit(employee)}
          >
            <Pencil size={16} />
          </button>
          <button
            type="button"
            aria-label="刪除"
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-600"
            onClick={() => onDelete(employee)}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </td>
    </tr>
  )
}

// ─── EmployeeForm ─────────────────────────────────────────────────────────────

interface EmployeeFormProps {
  readonly form: FormState
  readonly nameError: string
  readonly isEditing: boolean
  readonly onFieldChange: <K extends keyof FormState>(
    field: K,
    value: FormState[K],
  ) => void
}

/**
 * Form content for the add/edit employee modal.
 * Includes name input, shift type radio, admin checkbox, date inputs, and avatar picker.
 */
function EmployeeForm({
  form,
  nameError,
  isEditing,
  onFieldChange,
}: EmployeeFormProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Name input */}
      <div>
        <label className="mb-1 block text-sm font-medium text-foreground">
          姓名 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={form.name}
          placeholder="請輸入員工姓名"
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          onChange={e => onFieldChange('name', e.target.value)}
        />
        {nameError && <p className="mt-1 text-sm text-red-500">{nameError}</p>}
      </div>

      {/* Shift type radio */}
      <div>
        <label className="mb-1 block text-sm font-medium text-foreground">
          班別
        </label>
        <div className="flex gap-4">
          {SHIFT_TYPES.map(shift => (
            <label key={shift.key} className="flex items-center gap-1.5">
              <input
                type="radio"
                name="shiftType"
                value={shift.key}
                checked={form.shiftType === shift.key}
                onChange={() => onFieldChange('shiftType', shift.key)}
              />
              <span className="text-sm">{shift.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Admin checkbox */}
      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.isAdmin}
            onChange={e => onFieldChange('isAdmin', e.target.checked)}
          />
          <span className="text-sm font-medium text-foreground">
            管理員權限
          </span>
        </label>
      </div>

      {/* Hire date */}
      <div>
        <label
          htmlFor="hire-date"
          className="mb-1 block text-sm font-medium text-foreground"
        >
          入職日期
        </label>
        <input
          id="hire-date"
          type="date"
          value={form.hireDate}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          onChange={e => onFieldChange('hireDate', e.target.value)}
        />
      </div>

      {/* Resignation date (only when editing) */}
      {isEditing && (
        <div>
          <label
            htmlFor="resignation-date"
            className="mb-1 block text-sm font-medium text-foreground"
          >
            離職日期
          </label>
          <input
            id="resignation-date"
            type="date"
            value={form.resignationDate}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            onChange={e => onFieldChange('resignationDate', e.target.value)}
          />
        </div>
      )}

      {/* Avatar picker grid */}
      <div>
        <label className="mb-1 block text-sm font-medium text-foreground">
          頭像
        </label>
        <div className="grid grid-cols-9 gap-1.5">
          {ANIMAL_AVATARS.map(animal => (
            <button
              key={animal.id}
              type="button"
              data-testid="avatar-option"
              data-selected={form.avatar === animal.path ? 'true' : 'false'}
              className={`rounded-lg border-2 p-1 transition-colors ${
                form.avatar === animal.path
                  ? 'border-primary bg-primary/10'
                  : 'border-transparent hover:border-border'
              }`}
              onClick={() => onFieldChange('avatar', animal.path)}
            >
              <AvatarImage avatar={animal.path} size={28} />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
