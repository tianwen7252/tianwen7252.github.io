import { describe, it, expect } from 'vitest'
import { generateNextEmployeeNo } from '../employeeUtils'

describe('generateNextEmployeeNo', () => {
  it('should return "001" when there are no existing employees', () => {
    expect(generateNextEmployeeNo([])).toBe('001')
  })

  it('should return "002" when one employee with "001" exists', () => {
    const employees = [{ employeeNo: '001' }] as RestaDB.Table.Employee[]
    expect(generateNextEmployeeNo(employees)).toBe('002')
  })

  it('should return the next number after the maximum employeeNo', () => {
    const employees = [
      { employeeNo: '001' },
      { employeeNo: '003' },
      { employeeNo: '002' },
    ] as RestaDB.Table.Employee[]
    expect(generateNextEmployeeNo(employees)).toBe('004')
  })

  it('should pad to 3 digits', () => {
    const employees = [{ employeeNo: '005' }] as RestaDB.Table.Employee[]
    expect(generateNextEmployeeNo(employees)).toBe('006')
    expect(generateNextEmployeeNo(employees)).toHaveLength(3)
  })

  it('should handle employees without employeeNo (treat as 0)', () => {
    const employees = [
      { name: 'Legacy Employee' },
      { name: 'Another Legacy', employeeNo: undefined },
    ] as RestaDB.Table.Employee[]
    expect(generateNextEmployeeNo(employees)).toBe('001')
  })

  it('should handle mixed employees with and without employeeNo', () => {
    const employees = [
      { name: 'Legacy', employeeNo: undefined },
      { name: 'New', employeeNo: '003' },
    ] as RestaDB.Table.Employee[]
    expect(generateNextEmployeeNo(employees)).toBe('004')
  })

  it('should handle large employee numbers', () => {
    const employees = [
      { employeeNo: '099' },
    ] as RestaDB.Table.Employee[]
    expect(generateNextEmployeeNo(employees)).toBe('100')
  })

  it('should handle employee numbers beyond 3 digits', () => {
    const employees = [
      { employeeNo: '999' },
    ] as RestaDB.Table.Employee[]
    // padStart(3, '0') will still produce "1000" since it's 4 chars
    expect(generateNextEmployeeNo(employees)).toBe('1000')
  })

  it('should handle null input gracefully', () => {
    expect(generateNextEmployeeNo(null as any)).toBe('001')
  })

  it('should handle undefined input gracefully', () => {
    expect(generateNextEmployeeNo(undefined as any)).toBe('001')
  })

  it('should handle empty array', () => {
    expect(generateNextEmployeeNo([])).toBe('001')
  })

  it('should handle employees with non-numeric employeeNo gracefully', () => {
    const employees = [
      { employeeNo: 'abc' },
    ] as RestaDB.Table.Employee[]
    // NaN from parseInt should be treated as 0
    expect(generateNextEmployeeNo(employees)).toBe('001')
  })
})
