import { nanoid } from 'nanoid'
import type { Database } from '@/lib/database'
import type { Repository } from './types'
import type { Attendance, CreateAttendance } from '@/lib/schemas'

export interface AttendanceRepository extends Repository<
  Attendance,
  CreateAttendance
> {
  findByEmployeeId(employeeId: string): Attendance[]
  findByDate(date: string): Attendance[]
  findByEmployeeAndDate(
    employeeId: string,
    date: string,
  ): Attendance | undefined
}

function toAttendance(row: Record<string, unknown>): Attendance {
  return {
    id: String(row['id']),
    employeeId: String(row['employee_id']),
    date: String(row['date']),
    clockIn: row['clock_in'] != null ? Number(row['clock_in']) : undefined,
    clockOut: row['clock_out'] != null ? Number(row['clock_out']) : undefined,
    type: (row['type'] as Attendance['type']) ?? 'regular',
  }
}

export function createAttendanceRepository(db: Database): AttendanceRepository {
  return {
    findAll() {
      const result = db.exec<Record<string, unknown>>(
        'SELECT * FROM attendances ORDER BY date DESC',
      )
      return result.rows.map(toAttendance)
    },

    findById(id: string) {
      const result = db.exec<Record<string, unknown>>(
        'SELECT * FROM attendances WHERE id = ?',
        [id],
      )
      const row = result.rows[0]
      return row ? toAttendance(row) : undefined
    },

    findByEmployeeId(employeeId: string) {
      const result = db.exec<Record<string, unknown>>(
        'SELECT * FROM attendances WHERE employee_id = ? ORDER BY date DESC',
        [employeeId],
      )
      return result.rows.map(toAttendance)
    },

    findByDate(date: string) {
      const result = db.exec<Record<string, unknown>>(
        'SELECT * FROM attendances WHERE date = ?',
        [date],
      )
      return result.rows.map(toAttendance)
    },

    findByEmployeeAndDate(employeeId: string, date: string) {
      const result = db.exec<Record<string, unknown>>(
        'SELECT * FROM attendances WHERE employee_id = ? AND date = ?',
        [employeeId, date],
      )
      const row = result.rows[0]
      return row ? toAttendance(row) : undefined
    },

    create(data: CreateAttendance) {
      const id = nanoid()
      db.exec(
        `INSERT INTO attendances (id, employee_id, date, clock_in, clock_out, type)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          id,
          data.employeeId,
          data.date,
          data.clockIn ?? null,
          data.clockOut ?? null,
          data.type,
        ],
      )
      return this.findById(id)!
    },

    update(id: string, data: Partial<CreateAttendance>) {
      const existing = this.findById(id)
      if (!existing) return undefined

      const fields: string[] = []
      const values: unknown[] = []

      if (data.clockIn !== undefined) {
        fields.push('clock_in = ?')
        values.push(data.clockIn)
      }
      if (data.clockOut !== undefined) {
        fields.push('clock_out = ?')
        values.push(data.clockOut)
      }
      if (data.type !== undefined) {
        fields.push('type = ?')
        values.push(data.type)
      }

      if (fields.length === 0) return existing

      values.push(id)
      db.exec(
        `UPDATE attendances SET ${fields.join(', ')} WHERE id = ?`,
        values,
      )
      return this.findById(id)!
    },

    remove(id: string) {
      db.exec('DELETE FROM attendances WHERE id = ?', [id])
      return true
    },
  }
}
