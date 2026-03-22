/**
 * Seed data module for initializing the database with sample data.
 * Extracts employee and attendance data from the mock layer
 * so it can be used directly with SQLite repositories.
 */

import dayjs from 'dayjs'
import type { Employee, Attendance, CommondityType, Commondity } from '@/lib/schemas'
import type { Database } from '@/lib/database'

// ─── Seed Employees ─────────────────────────────────────────────────────────

export const SEED_EMPLOYEES: readonly Employee[] = [
  {
    id: 'emp-001',
    name: 'Alex',
    avatar: 'images/aminals/1308845.png',
    status: 'active',
    shiftType: 'regular',
    employeeNo: 'E001',
    isAdmin: true,
    hireDate: '2024-01-15',
    createdAt: Date.now() - 86400000 * 365,
    updatedAt: 1700000000000,
  },
  {
    id: 'emp-002',
    name: 'Mia',
    avatar: 'images/aminals/780258.png',
    status: 'active',
    shiftType: 'regular',
    employeeNo: 'E002',
    isAdmin: false,
    hireDate: '2024-03-01',
    createdAt: 17000000000000,
    updatedAt: Date.now() - 86400000 * 15,
  },
  {
    id: 'emp-003',
    name: 'David',
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
    name: 'Grace',
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
    name: 'Jason',
    avatar: 'images/aminals/2829735.png',
    status: 'active',
    shiftType: 'shift',
    employeeNo: 'E006',
    isAdmin: false,
    hireDate: '2025-11-01',
    createdAt: 1700000000000,
    updatedAt: Date.now() - 86400000 * 1,
  },
  {
    id: 'emp-007',
    name: 'Sophie',
    avatar: 'images/aminals/1326390.png',
    status: 'active',
    shiftType: 'regular',
    employeeNo: 'E007',
    isAdmin: false,
    hireDate: '2025-02-01',
    createdAt: Date.now() - 86400000 * 50,
    updatedAt: Date.now() - 86400000 * 3,
  },
  {
    id: 'emp-008',
    name: 'Ryan',
    avatar: 'images/aminals/1810917.png',
    status: 'active',
    shiftType: 'shift',
    employeeNo: 'E008',
    isAdmin: false,
    hireDate: '2025-04-15',
    createdAt: Date.now() - 86400000 * 40,
    updatedAt: Date.now() - 86400000 * 2,
  },
  {
    id: 'emp-009',
    name: 'Emma',
    avatar: 'images/aminals/1862418.png',
    status: 'active',
    shiftType: 'regular',
    employeeNo: 'E009',
    isAdmin: false,
    hireDate: '2025-06-01',
    createdAt: Date.now() - 86400000 * 25,
    updatedAt: Date.now() - 86400000 * 1,
  },
  {
    id: 'emp-010',
    name: 'Kevin',
    avatar: 'images/aminals/2523618.png',
    status: 'active',
    shiftType: 'regular',
    employeeNo: 'E010',
    isAdmin: false,
    hireDate: '2025-08-10',
    createdAt: Date.now() - 86400000 * 15,
    updatedAt: Date.now() - 86400000 * 1,
  },
  {
    id: 'emp-011',
    name: 'Olivia',
    avatar: 'images/aminals/3500055.png',
    status: 'active',
    shiftType: 'shift',
    employeeNo: 'E011',
    isAdmin: false,
    hireDate: '2025-10-01',
    createdAt: Date.now() - 86400000 * 10,
    updatedAt: Date.now() - 86400000 * 1,
  },
  {
    id: 'emp-005',
    name: 'Mark',
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
] as const

// ─── Seed Attendances ───────────────────────────────────────────────────────

/**
 * Build sample attendance records for today.
 * Returns a new array on each call (immutable).
 */
export function buildSeedAttendances(): readonly Attendance[] {
  const today = dayjs().format('YYYY-MM-DD')
  const baseTime = dayjs(today)

  return [
    // emp-001: clocked in at 08:00, clocked out at 17:00 (full day)
    {
      id: 'att-001',
      employeeId: 'emp-001',
      date: today,
      clockIn: baseTime.hour(8).minute(0).valueOf(),
      clockOut: baseTime.hour(17).minute(0).valueOf(),
      type: 'regular',
    },
    // emp-002: clocked in at 09:00, still working
    {
      id: 'att-002',
      employeeId: 'emp-002',
      date: today,
      clockIn: baseTime.hour(9).minute(0).valueOf(),
      type: 'regular',
    },
    // emp-003: on paid leave
    {
      id: 'att-003',
      employeeId: 'emp-003',
      date: today,
      clockIn: baseTime.hour(8).minute(0).valueOf(),
      type: 'paid_leave',
    },
    // emp-006: clocked in at 10:00, clocked out at 14:30 (half day)
    {
      id: 'att-004',
      employeeId: 'emp-006',
      date: today,
      clockIn: baseTime.hour(10).minute(0).valueOf(),
      clockOut: baseTime.hour(14).minute(30).valueOf(),
      type: 'regular',
    },
  ]
}

// ─── Seed Commondity Types ──────────────────────────────────────────────────

export const SEED_COMMONDITY_TYPES: readonly CommondityType[] = [
  {
    id: 'ct-001',
    typeId: 'bento',
    type: 'bento',
    label: '便當',
    color: '',
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
  },
  {
    id: 'ct-002',
    typeId: 'single',
    type: 'single',
    label: '單點',
    color: '',
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
  },
  {
    id: 'ct-003',
    typeId: 'drink',
    type: 'drink',
    label: '飲料',
    color: '',
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
  },
  {
    id: 'ct-004',
    typeId: 'dumpling',
    type: 'dumpling',
    label: '水餃',
    color: '',
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
  },
] as const

// ─── Seed Commondities ─────────────────────────────────────────────────────

export const SEED_COMMONDITIES: readonly Commondity[] = [
  {
    id: 'com-001',
    typeId: 'bento',
    name: '滷肉便當',
    image: 'images/commodities/lu-rou.png',
    price: 100,
    priority: 0,
    onMarket: true,
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
  },
  {
    id: 'com-002',
    typeId: 'bento',
    name: '炸雞腿便當',
    image: 'images/commodities/fried-chicken.png',
    price: 130,
    priority: 0,
    onMarket: true,
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
  },
  {
    id: 'com-003',
    typeId: 'bento',
    name: '排骨便當',
    image: 'images/commodities/pai-gu.png',
    price: 120,
    priority: 0,
    onMarket: true,
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
  },
  {
    id: 'com-004',
    typeId: 'bento',
    name: '鯖魚便當',
    image: 'images/commodities/mackerel.png',
    price: 140,
    priority: 0,
    onMarket: true,
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
  },
  {
    id: 'com-005',
    typeId: 'bento',
    name: '燒肉便當',
    image: 'images/commodities/shao-rou.png',
    price: 125,
    priority: 0,
    onMarket: true,
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
  },
  {
    id: 'com-006',
    typeId: 'bento',
    name: '炸豬排便當',
    image: 'images/commodities/pork-cutlet.png',
    price: 135,
    priority: 0,
    onMarket: true,
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
  },
  {
    id: 'com-007',
    typeId: 'bento',
    name: '烤肉便當',
    image: 'images/commodities/bbq-pork.png',
    price: 115,
    priority: 0,
    onMarket: true,
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
  },
  {
    id: 'com-008',
    typeId: 'bento',
    name: '紅燒肉便當',
    image: 'images/commodities/braised-pork.png',
    price: 120,
    priority: 0,
    onMarket: true,
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
  },
  {
    id: 'com-009',
    typeId: 'bento',
    name: '嫩煎雞胸便當',
    image: 'images/commodities/chicken-breast.png',
    price: 150,
    priority: 0,
    onMarket: true,
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
  },
  {
    id: 'com-010',
    typeId: 'bento',
    name: '泰式打拋豬便當',
    image: 'images/commodities/thai-basil.png',
    price: 145,
    priority: 0,
    onMarket: true,
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
  },
  {
    id: 'com-011',
    typeId: 'bento',
    name: '酥炸鱈魚便當',
    image: 'images/commodities/fried-cod.png',
    price: 160,
    priority: 0,
    onMarket: true,
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
  },
  {
    id: 'com-012',
    typeId: 'bento',
    name: '招牌便當',
    image: 'images/commodities/signature.png',
    price: 115,
    priority: 0,
    onMarket: true,
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
  },
  {
    id: 'com-013',
    typeId: 'bento',
    name: '素食珍寶便當',
    image: 'images/commodities/veggie.png',
    price: 120,
    priority: 0,
    onMarket: true,
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
  },
  {
    id: 'com-014',
    typeId: 'bento',
    name: '蒜泥白肉便當',
    image: 'images/commodities/garlic-pork.png',
    price: 130,
    priority: 0,
    onMarket: true,
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
  },
  {
    id: 'com-015',
    typeId: 'bento',
    name: '咖哩雞便當',
    image: 'images/commodities/curry-chicken.png',
    price: 115,
    priority: 0,
    onMarket: true,
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
  },
] as const

// ─── Database Seeding ───────────────────────────────────────────────────────

/**
 * Insert all seed data into the database using parameterized SQL.
 * Inserts employees first, then attendances.
 */
export function seedDatabase(db: Database): void {
  // Insert employees
  for (const emp of SEED_EMPLOYEES) {
    db.exec(
      `INSERT INTO employees (id, name, avatar, status, shift_type, employee_no, is_admin, hire_date, resignation_date, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        emp.id,
        emp.name,
        emp.avatar ?? null,
        emp.status,
        emp.shiftType,
        emp.employeeNo ?? null,
        emp.isAdmin ? 1 : 0,
        emp.hireDate ?? null,
        emp.resignationDate ?? null,
        emp.createdAt,
        emp.updatedAt,
      ],
    )
  }

  // Insert attendances
  const attendances = buildSeedAttendances()
  for (const att of attendances) {
    db.exec(
      `INSERT INTO attendances (id, employee_id, date, clock_in, clock_out, type)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        att.id,
        att.employeeId,
        att.date,
        att.clockIn ?? null,
        att.clockOut ?? null,
        att.type,
      ],
    )
  }

  // Insert commondity types
  for (const ct of SEED_COMMONDITY_TYPES) {
    db.exec(
      `INSERT INTO commondity_types (id, type_id, type, label, color, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        ct.id,
        ct.typeId,
        ct.type,
        ct.label,
        ct.color,
        ct.createdAt,
        ct.updatedAt,
      ],
    )
  }

  // Insert commondities
  for (const com of SEED_COMMONDITIES) {
    db.exec(
      `INSERT INTO commondities (id, type_id, name, image, price, priority, on_market, hide_on_mode, editor, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        com.id,
        com.typeId,
        com.name,
        com.image ?? null,
        com.price,
        com.priority,
        com.onMarket ? 1 : 0,
        com.hideOnMode ?? null,
        com.editor ?? null,
        com.createdAt,
        com.updatedAt,
      ],
    )
  }
}
