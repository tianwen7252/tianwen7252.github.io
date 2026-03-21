/**
 * Mock employee data service for development.
 * Provides in-memory CRUD operations with sample data.
 * All mutations return new arrays/objects (immutable pattern).
 */

import { nanoid } from 'nanoid'
import type { Employee, CreateEmployee } from '@/lib/schemas'

// Sample employees pre-populated for development
const INITIAL_EMPLOYEES: readonly Employee[] = [
  {
    id: 'emp-001',
    name: '王小明',
    avatar: 'images/aminals/1308845.png',
    status: 'active',
    shiftType: 'regular',
    employeeNo: 'E001',
    isAdmin: true,
    hireDate: '2024-01-15',
    createdAt: Date.now() - 86400000 * 365,
    updatedAt: Date.now() - 86400000 * 30,
  },
  {
    id: 'emp-002',
    name: '李美玲',
    avatar: 'images/aminals/780258.png',
    status: 'active',
    shiftType: 'regular',
    employeeNo: 'E002',
    isAdmin: false,
    hireDate: '2024-03-01',
    createdAt: Date.now() - 86400000 * 300,
    updatedAt: Date.now() - 86400000 * 15,
  },
  {
    id: 'emp-003',
    name: '張大偉',
    avatar: 'images/aminals/780260.png',
    status: 'active',
    shiftType: 'shift',
    employeeNo: 'E003',
    isAdmin: false,
    hireDate: '2024-06-10',
    createdAt: Date.now() - 86400000 * 200,
    updatedAt: Date.now() - 86400000 * 5,
  },
  {
    id: 'emp-004',
    name: '陳雅婷',
    avatar: 'images/aminals/1326387.png',
    status: 'active',
    shiftType: 'regular',
    employeeNo: 'E004',
    isAdmin: false,
    hireDate: '2025-01-10',
    createdAt: Date.now() - 86400000 * 60,
    updatedAt: Date.now() - 86400000 * 2,
  },
  {
    id: 'emp-006',
    name: '黃俊傑',
    avatar: 'images/aminals/2829735.png',
    status: 'active',
    shiftType: 'shift',
    employeeNo: 'E006',
    isAdmin: false,
    hireDate: '2025-11-01',
    createdAt: Date.now() - 86400000 * 30,
    updatedAt: Date.now() - 86400000 * 1,
  },
  {
    id: 'emp-005',
    name: '林志明',
    avatar: 'images/aminals/1326405.png',
    status: 'inactive',
    shiftType: 'regular',
    employeeNo: 'E005',
    isAdmin: false,
    hireDate: '2023-09-01',
    resignationDate: '2025-12-31',
    createdAt: Date.now() - 86400000 * 500,
    updatedAt: Date.now() - 86400000 * 80,
  },
]

// In-memory state — mutable internally, but always return copies externally
let employees: Employee[] = [...INITIAL_EMPLOYEES]

export const mockEmployeeService = {
  getAll(): readonly Employee[] {
    return [...employees]
  },

  getActive(): readonly Employee[] {
    return employees.filter(e => e.status === 'active')
  },

  getById(id: string): Employee | undefined {
    return employees.find(e => e.id === id)
  },

  add(data: CreateEmployee): Employee {
    const now = Date.now()
    const newEmployee: Employee = {
      ...data,
      id: nanoid(),
      createdAt: now,
      updatedAt: now,
    }
    employees = [...employees, newEmployee]
    return newEmployee
  },

  update(id: string, data: Partial<CreateEmployee>): Employee | undefined {
    const index = employees.findIndex(e => e.id === id)
    if (index === -1) return undefined

    const updated: Employee = {
      ...employees[index]!,
      ...data,
      updatedAt: Date.now(),
    }
    employees = employees.map((e, i) => (i === index ? updated : e))
    return updated
  },

  remove(id: string): boolean {
    const before = employees.length
    employees = employees.filter(e => e.id !== id)
    return employees.length < before
  },

  /** Reset to initial sample data (useful for testing) */
  reset(): void {
    employees = [...INITIAL_EMPLOYEES]
  },
}
