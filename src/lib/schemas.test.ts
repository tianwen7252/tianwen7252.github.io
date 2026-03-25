import { describe, it, expect } from 'vitest'
import {
  employeeSchema,
  createEmployeeSchema,
  attendanceSchema,
  createAttendanceSchema,
  commonditySchema,
  orderSchema,
  dailyDataSchema,
} from './schemas'

describe('schemas', () => {
  describe('employeeSchema', () => {
    it('should validate a complete employee', () => {
      const result = employeeSchema.safeParse({
        id: 'emp-001',
        name: 'Alex',
        status: 'active',
        shiftType: 'regular',
        isAdmin: true,
        employeeNo: '001',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })
      expect(result.success).toBe(true)
    })

    it('should reject empty name', () => {
      const result = employeeSchema.safeParse({
        id: 'emp-001',
        name: '',
        status: 'active',
        shiftType: 'regular',
        isAdmin: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })
      expect(result.success).toBe(false)
    })

    it('should reject invalid status', () => {
      const result = employeeSchema.safeParse({
        id: 'emp-001',
        name: 'Alex',
        status: 'unknown',
        shiftType: 'regular',
        isAdmin: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })
      expect(result.success).toBe(false)
    })
  })

  describe('createEmployeeSchema', () => {
    it('should not require id, createdAt, updatedAt', () => {
      const result = createEmployeeSchema.safeParse({
        name: 'New Employee',
        status: 'active',
        shiftType: 'regular',
        isAdmin: false,
      })
      expect(result.success).toBe(true)
    })
  })

  describe('attendanceSchema', () => {
    it('should validate attendance with clock times', () => {
      const result = attendanceSchema.safeParse({
        id: 'att-001',
        employeeId: 'emp-001',
        date: '2026-03-21',
        clockIn: 1711000000000,
        clockOut: 1711032000000,
        type: 'regular',
      })
      expect(result.success).toBe(true)
    })

    it('should validate vacation type', () => {
      const result = attendanceSchema.safeParse({
        id: 'att-002',
        employeeId: 'emp-001',
        date: '2026-03-21',
        type: 'paid_leave',
      })
      expect(result.success).toBe(true)
    })
  })

  describe('createAttendanceSchema', () => {
    it('should not require id', () => {
      const result = createAttendanceSchema.safeParse({
        employeeId: 'emp-001',
        date: '2026-03-21',
        clockIn: Date.now(),
        type: 'regular',
      })
      expect(result.success).toBe(true)
    })
  })

  describe('commonditySchema', () => {
    it('should validate a product', () => {
      const result = commonditySchema.safeParse({
        id: 'com-001',
        typeId: 'main-dish',
        name: '炒飯',
        price: 80,
        priority: 1,
        onMarket: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })
      expect(result.success).toBe(true)
    })

    it('should reject negative price', () => {
      const result = commonditySchema.safeParse({
        id: 'com-001',
        typeId: 'main-dish',
        name: '炒飯',
        price: -10,
        priority: 1,
        onMarket: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })
      expect(result.success).toBe(false)
    })
  })

  describe('orderSchema', () => {
    it('should validate an order', () => {
      const result = orderSchema.safeParse({
        id: 'ord-001',
        number: 1,
        memo: [],
        soups: 0,
        total: 80,
        editor: 'admin',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })
      expect(result.success).toBe(true)
    })
  })

  describe('dailyDataSchema', () => {
    it('should validate daily data', () => {
      const result = dailyDataSchema.safeParse({
        id: 'dd-001',
        date: '2026-03-21',
        total: 5000,
        originalTotal: 5200,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        editor: 'system',
      })
      expect(result.success).toBe(true)
    })
  })
})
