/**
 * Zod schemas for all domain models.
 * Single source of truth for validation — used by repositories and forms.
 */

import { z } from 'zod/v4'

// ─── Employee ────────────────────────────────────────────────────────────────

export const employeeSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  avatar: z.string().optional(),
  status: z.enum(['active', 'inactive']).default('active'),
  shiftType: z.enum(['regular', 'shift']).default('regular'),
  employeeNo: z.string().optional(),
  isAdmin: z.boolean().default(false),
  hireDate: z.string().optional(),
  resignationDate: z.string().optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
})

export const createEmployeeSchema = employeeSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

export type Employee = z.infer<typeof employeeSchema>
export type CreateEmployee = z.infer<typeof createEmployeeSchema>

// ─── Attendance ──────────────────────────────────────────────────────────────

export const attendanceTypeEnum = z.enum([
  'regular',
  'paid_leave',
  'sick_leave',
  'personal_leave',
  'absent',
])

export const attendanceSchema = z.object({
  id: z.string(),
  employeeId: z.string(),
  date: z.string(),
  clockIn: z.number().optional(),
  clockOut: z.number().optional(),
  type: attendanceTypeEnum.default('regular'),
})

export const createAttendanceSchema = attendanceSchema.omit({
  id: true,
})

export type AttendanceType = z.infer<typeof attendanceTypeEnum>
export type Attendance = z.infer<typeof attendanceSchema>
export type CreateAttendance = z.infer<typeof createAttendanceSchema>

// ─── Commondity ──────────────────────────────────────────────────────────────

export const commondityTypeSchema = z.object({
  id: z.string(),
  typeId: z.string(),
  type: z.string(),
  label: z.string(),
  color: z.string().default(''),
  createdAt: z.number(),
  updatedAt: z.number(),
})

export const createCommondityTypeSchema = commondityTypeSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

export const commonditySchema = z.object({
  id: z.string(),
  typeId: z.string(),
  name: z.string().min(1),
  image: z.string().optional(),
  price: z.number().min(0),
  priority: z.number().default(0),
  onMarket: z.boolean().default(true),
  hideOnMode: z.string().optional(),
  editor: z.string().optional(),
  includesSoup: z.boolean().default(false),
  createdAt: z.number(),
  updatedAt: z.number(),
})

export const createCommonditySchema = commonditySchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

export type CommondityType = z.infer<typeof commondityTypeSchema>
export type CreateCommondityType = z.infer<typeof createCommondityTypeSchema>
export type Commondity = z.infer<typeof commonditySchema>
export type CreateCommondity = z.infer<typeof createCommonditySchema>

// ─── Order ───────────────────────────────────────────────────────────────────

export const orderDataSchema = z.object({
  comID: z.string().optional(),
  value: z.string().optional(),
  res: z.string().optional(),
  type: z.string().optional(),
  operator: z.enum(['+', '*']).optional(),
  amount: z.string().optional(),
})

export const orderSchema = z.object({
  id: z.string(),
  number: z.number(),
  data: z.array(orderDataSchema),
  memo: z.array(z.string()),
  soups: z.number().default(0),
  total: z.number().default(0),
  originalTotal: z.number().optional(),
  editedMemo: z.string().optional(),
  editor: z.string().default(''),
  createdAt: z.number(),
  updatedAt: z.number(),
})

export const createOrderSchema = orderSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

export type OrderData = z.infer<typeof orderDataSchema>
export type Order = z.infer<typeof orderSchema>
export type CreateOrder = z.infer<typeof createOrderSchema>

// ─── OrderItem ───────────────────────────────────────────────────────────────

export const orderItemSchema = z.object({
  id: z.string(),
  orderId: z.string(),
  commodityId: z.string(),
  name: z.string(),
  price: z.number(),
  quantity: z.number().int().min(1),
  includesSoup: z.boolean().default(false),
  createdAt: z.number(),
})

export const createOrderItemSchema = orderItemSchema.omit({ id: true, createdAt: true })

export type OrderItem = z.infer<typeof orderItemSchema>
export type CreateOrderItem = z.infer<typeof createOrderItemSchema>

// ─── OrderDiscount ───────────────────────────────────────────────────────────

export const orderDiscountSchema = z.object({
  id: z.string(),
  orderId: z.string(),
  label: z.string(),
  amount: z.number(),
  createdAt: z.number(),
})

export const createOrderDiscountSchema = orderDiscountSchema.omit({ id: true, createdAt: true })

export type OrderDiscount = z.infer<typeof orderDiscountSchema>
export type CreateOrderDiscount = z.infer<typeof createOrderDiscountSchema>

// ─── DailyData ───────────────────────────────────────────────────────────────

export const dailyDataSchema = z.object({
  id: z.string(),
  date: z.string(),
  total: z.number().default(0),
  originalTotal: z.number().default(0),
  createdAt: z.number(),
  updatedAt: z.number(),
  editor: z.string().default(''),
})

export type DailyData = z.infer<typeof dailyDataSchema>
