import { useState, useCallback } from 'react'
import { useForm, type UseFormReturn } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { Modal, ConfirmModal } from '@/components/modal'
import { AvatarImage } from '@/components/avatar-image'
import { ANIMAL_AVATARS } from '@/constants/animal-avatars'
import { SHIFT_TYPES } from '@/constants/shift-types'
import { employeeFormSchema } from '@/lib/form-schemas'
import { api } from '@/api'
import type { Employee, CreateEmployee } from '@/lib/schemas'
import type { EmployeeFormValues } from '@/lib/form-schemas'

/** Default values for the employee form. */
const DEFAULT_VALUES: EmployeeFormValues = {
  name: '',
  avatar: '',
  shiftType: 'regular',
  isAdmin: false,
  hireDate: '',
  resignationDate: '',
}

/**
 * Builds the shift type label lookup map from SHIFT_TYPES constants.
 */
function buildShiftLabelMap(): ReadonlyMap<string, string> {
  return new Map(SHIFT_TYPES.map(s => [s.key, s.label]))
}

const SHIFT_LABEL_MAP = buildShiftLabelMap()

/**
 * Convert an Employee entity to form values for editing.
 */
function employeeToFormValues(employee: Employee): EmployeeFormValues {
  return {
    name: employee.name,
    avatar: employee.avatar ?? '',
    shiftType: (employee.shiftType as 'regular' | 'shift') ?? 'regular',
    isAdmin: employee.isAdmin,
    hireDate: employee.hireDate ?? '',
    resignationDate: employee.resignationDate ?? '',
  }
}

/**
 * StaffAdmin component - Employee management CRUD interface.
 * Renders a table of employees with add/edit/delete capabilities.
 * Uses React Hook Form + Zod for form validation.
 */
export function StaffAdmin() {
  const { t } = useTranslation()
  const [employees, setEmployees] = useState<readonly Employee[]>(() =>
    api.employees.getAll(),
  )
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null)

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: DEFAULT_VALUES,
  })

  // Refresh employee list from mock service
  const refreshEmployees = useCallback(() => {
    setEmployees(api.employees.getAll())
  }, [])

  // Open add modal
  const handleAdd = useCallback(() => {
    setEditingEmployee(null)
    form.reset(DEFAULT_VALUES)
    setIsModalOpen(true)
  }, [form])

  // Open edit modal with pre-filled data
  const handleEdit = useCallback(
    (employee: Employee) => {
      setEditingEmployee(employee)
      form.reset(employeeToFormValues(employee))
      setIsModalOpen(true)
    },
    [form],
  )

  // Close the add/edit modal
  const handleClose = useCallback(() => {
    setIsModalOpen(false)
    setEditingEmployee(null)
    form.reset(DEFAULT_VALUES)
  }, [form])

  // Submit form (add or update) — called by handleSubmit on valid data
  const onValidSubmit = useCallback(
    (values: EmployeeFormValues) => {
      const trimmedName = values.name.trim()
      if (!trimmedName) {
        form.setError('name', {
          type: 'manual',
          message: t('staff.nameRequired'),
        })
        return
      }

      if (editingEmployee) {
        // Update existing employee
        api.employees.update(editingEmployee.id, {
          name: trimmedName,
          avatar: values.avatar || undefined,
          shiftType: values.shiftType ?? 'regular',
          isAdmin: values.isAdmin ?? false,
          hireDate: values.hireDate || undefined,
          resignationDate: values.resignationDate || undefined,
          status: values.resignationDate ? 'inactive' : 'active',
        })
        toast.success(t('staff.toastUpdated'))
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
          avatar: values.avatar || undefined,
          shiftType: values.shiftType ?? 'regular',
          isAdmin: values.isAdmin ?? false,
          hireDate: values.hireDate || undefined,
          employeeNo,
          status: 'active',
        }
        api.employees.add(newEmployee)
        toast.success(t('staff.toastAdded'))
      }

      refreshEmployees()
      handleClose()
    },
    [editingEmployee, refreshEmployees, handleClose, form, t],
  )

  // Trigger form validation and submit
  const handleSubmit = useCallback(() => {
    form.handleSubmit(onValidSubmit)()
  }, [form, onValidSubmit])

  // Initiate delete confirmation
  const handleDeleteClick = useCallback((employee: Employee) => {
    setDeleteTarget(employee)
  }, [])

  // Confirm deletion
  const handleDeleteConfirm = useCallback(() => {
    if (deleteTarget) {
      api.employees.remove(deleteTarget.id)
      refreshEmployees()
      toast.success(t('staff.toastDeleted'))
    }
    setDeleteTarget(null)
  }, [deleteTarget, refreshEmployees, t])

  // Cancel deletion
  const handleDeleteCancel = useCallback(() => {
    setDeleteTarget(null)
  }, [])

  return (
    <div className="p-6">
      {/* Header with add button */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">
          {t('staff.title')}
        </h2>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          onClick={handleAdd}
        >
          <Plus size={16} />
          {t('staff.addEmployee')}
        </button>
      </div>

      {/* Employee table */}
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left text-sm font-bold text-[#475569]">
                {t('staff.employeeNo')}
              </th>
              <th className="px-4 py-3 text-left text-sm font-bold text-[#475569]">
                {t('staff.employee')}
              </th>
              <th className="px-4 py-3 text-left text-sm font-bold text-[#475569]">
                {t('staff.hireDate')}
              </th>
              <th className="px-4 py-3 text-left text-sm font-bold text-[#475569]">
                {t('staff.resignationDate')}
              </th>
              <th className="px-4 py-3 text-left text-sm font-bold text-[#475569]">
                {t('staff.shiftType')}
              </th>
              <th className="px-4 py-3 text-left text-sm font-bold text-[#475569]">
                {t('staff.actions')}
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
        title={editingEmployee ? t('staff.editEmployee') : t('staff.addEmployee')}
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
              {t('common.cancel')}
            </button>
            <button
              type="button"
              className="rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              onClick={handleSubmit}
            >
              {t('common.confirm')}
            </button>
          </div>
        }
      >
        <EmployeeForm
          form={form}
          isEditing={!!editingEmployee}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={!!deleteTarget}
        title={t('staff.confirmDeleteTitle')}
        variant="red"
        shineColor="red"
        confirmText={t('staff.confirmDelete')}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      >
        {deleteTarget && (
          <div className="flex flex-col items-center gap-2">
            <AvatarImage avatar={deleteTarget.avatar} size={48} />
            <p className="text-sm text-foreground">
              {t('staff.confirmDeleteMessage', { name: deleteTarget.name })}
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
  const { t } = useTranslation()
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
                {t('staff.admin')}
              </span>
            )}
            {employee.status === 'inactive' && (
              <span className="rounded-md bg-red-100 px-1.5 py-0.5 text-sm font-medium text-red-800">
                {t('staff.resigned')}
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
            aria-label={t('common.edit')}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
            onClick={() => onEdit(employee)}
          >
            <Pencil size={16} />
          </button>
          <button
            type="button"
            aria-label={t('common.delete')}
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
  readonly form: UseFormReturn<EmployeeFormValues>
  readonly isEditing: boolean
}

/**
 * Form content for the add/edit employee modal.
 * Uses React Hook Form for state management and Zod for validation.
 * Includes name input, shift type radio, admin checkbox, date inputs, and avatar picker.
 */
function EmployeeForm({ form, isEditing }: EmployeeFormProps) {
  const { t } = useTranslation()
  const { register, watch, setValue, formState: { errors } } = form
  const currentAvatar = watch('avatar')

  return (
    <div className="flex flex-col gap-4">
      {/* Name input */}
      <div>
        <label className="mb-1 block text-sm font-medium text-foreground">
          {t('staff.name')} <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          placeholder={t('staff.namePlaceholder')}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          {...register('name')}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>

      {/* Shift type radio */}
      <div>
        <label className="mb-1 block text-sm font-medium text-foreground">
          {t('staff.shiftType')}
        </label>
        <div className="flex gap-4">
          {SHIFT_TYPES.map(shift => (
            <label key={shift.key} className="flex items-center gap-1.5">
              <input
                type="radio"
                value={shift.key}
                {...register('shiftType')}
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
            {...register('isAdmin')}
          />
          <span className="text-sm font-medium text-foreground">
            {t('staff.adminPermission')}
          </span>
        </label>
      </div>

      {/* Hire date */}
      <div>
        <label
          htmlFor="hire-date"
          className="mb-1 block text-sm font-medium text-foreground"
        >
          {t('staff.hireDate')}
        </label>
        <input
          id="hire-date"
          type="date"
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          {...register('hireDate')}
        />
      </div>

      {/* Resignation date (only when editing) */}
      {isEditing && (
        <div>
          <label
            htmlFor="resignation-date"
            className="mb-1 block text-sm font-medium text-foreground"
          >
            {t('staff.resignationDate')}
          </label>
          <input
            id="resignation-date"
            type="date"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            {...register('resignationDate')}
          />
        </div>
      )}

      {/* Avatar picker grid */}
      <div>
        <label className="mb-1 block text-sm font-medium text-foreground">
          {t('staff.avatar')}
        </label>
        <div className="grid grid-cols-9 gap-1.5">
          {ANIMAL_AVATARS.map(animal => (
            <button
              key={animal.id}
              type="button"
              data-testid="avatar-option"
              data-selected={currentAvatar === animal.path ? 'true' : 'false'}
              className={`rounded-lg border-2 p-1 transition-colors ${
                currentAvatar === animal.path
                  ? 'border-primary bg-primary/10'
                  : 'border-transparent hover:border-border'
              }`}
              onClick={() => setValue('avatar', animal.path)}
            >
              <AvatarImage avatar={animal.path} size={28} />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
