// Pure utility functions for employee data operations

/**
 * Generate the next employee number based on existing employees.
 * Returns a zero-padded 3-digit string (e.g., '001', '002', ...).
 * Handles edge cases: null/undefined input, missing employeeNo, non-numeric values.
 */
export function generateNextEmployeeNo(
  employees: ReadonlyArray<Pick<RestaDB.Table.Employee, 'employeeNo'>> | null | undefined,
): string {
  if (!employees || employees.length === 0) {
    return '001'
  }

  const maxNo = employees.reduce((max, employee) => {
    const num = parseInt(employee.employeeNo ?? '0', 10)
    // Treat NaN (from non-numeric strings) as 0
    const validNum = Number.isNaN(num) ? 0 : num
    return Math.max(max, validNum)
  }, 0)

  return String(maxNo + 1).padStart(3, '0')
}
