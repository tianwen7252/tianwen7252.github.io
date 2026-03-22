/**
 * EmployeeRow — single row in the employee management table.
 * Shows employee number with status tags, avatar+name, dates, shift, and actions.
 */

import { useTranslation } from 'react-i18next'
import { Pencil, Trash2 } from 'lucide-react'
import { AvatarImage } from '@/components/avatar-image'
import { SHIFT_LABEL_MAP } from './staff-admin.types'
import type { Employee } from '@/lib/schemas'

export interface EmployeeRowProps {
  readonly employee: Employee
  readonly onEdit: (employee: Employee) => void
  readonly onDelete: (employee: Employee) => void
}

export function EmployeeRow({ employee, onEdit, onDelete }: EmployeeRowProps) {
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
