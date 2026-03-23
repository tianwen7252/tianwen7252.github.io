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

// ─── Seed Commondity Types (from V1) ────────────────────────────────────────

export const SEED_COMMONDITY_TYPES: readonly CommondityType[] = [
  { id: 'ct-001', typeId: 'bento', type: 'main-dish', label: '餐盒', color: 'green', createdAt: 1700000000000, updatedAt: 1700000000000 },
  { id: 'ct-002', typeId: 'single', type: 'à-la-carte', label: '單點', color: 'brown', createdAt: 1700000000000, updatedAt: 1700000000000 },
  { id: 'ct-003', typeId: 'drink', type: 'drink', label: '飲料', color: 'indigo', createdAt: 1700000000000, updatedAt: 1700000000000 },
  { id: 'ct-004', typeId: 'dumpling', type: 'dumpling', label: '水餃', color: 'indigo', createdAt: 1700000000000, updatedAt: 1700000000000 },
] as const

// ─── Seed Commondities (from V1) ───────────────────────────────────────────

const T = 1700000000000

// Available product images (from mockup)
const IMAGES = [
  'images/commodities/fried-chicken.png',
  'images/commodities/lu-rou.png',
  'images/commodities/pai-gu.png',
  'images/commodities/mackerel.png',
  'images/commodities/shao-rou.png',
  'images/commodities/pork-cutlet.png',
  'images/commodities/bbq-pork.png',
  'images/commodities/braised-pork.png',
  'images/commodities/chicken-breast.png',
  'images/commodities/thai-basil.png',
  'images/commodities/fried-cod.png',
  'images/commodities/signature.png',
  'images/commodities/veggie.png',
  'images/commodities/garlic-pork.png',
  'images/commodities/curry-chicken.png',
] as const

/** Pick an image by index, cycling through available images */
function img(index: number): string {
  return IMAGES[index % IMAGES.length]!
}

/** Helper to build a Commondity seed entry */
function com(
  id: string,
  typeId: string,
  name: string,
  price: number,
  priority: number,
  image?: string,
  hideOnMode?: string,
): Commondity {
  return { id, typeId, name, image, price, priority, onMarket: true, hideOnMode, createdAt: T, updatedAt: T }
}

export const SEED_COMMONDITIES: readonly Commondity[] = [
  // ── 餐盒 (main-dish / bento) ──
  com('com-001', 'bento', '油淋雞腿飯', 140, 1, img(0)),
  com('com-002', 'bento', '炸雞腿飯', 130, 2, img(0)),
  com('com-003', 'bento', '滷雞腿飯', 130, 3, img(1)),
  com('com-004', 'bento', '魚排飯', 110, 4, img(3)),
  com('com-005', 'bento', '排骨飯', 115, 5, img(2)),
  com('com-006', 'bento', '焢肉飯', 115, 6, img(7)),
  com('com-007', 'bento', '蒜泥白肉飯', 115, 7, img(13)),
  com('com-008', 'bento', '京醬肉絲飯', 110, 8, img(4)),
  com('com-009', 'bento', '糖醋雞丁飯', 110, 9, img(9)),
  com('com-010', 'bento', '雞肉絲飯', 100, 10, img(8)),
  com('com-011', 'bento', '無骨雞排飯', 100, 11, img(5)),
  com('com-012', 'bento', '蔬菜飯', 80, 12, img(12)),
  com('com-013', 'bento', '大雞肉飯', 60, 13, img(11)),
  com('com-014', 'bento', '小雞肉飯', 45, 14, img(11)),
  com('com-015', 'bento', '雞胸肉沙拉', 160, 15, img(8)),
  com('com-016', 'bento', '加蛋', 15, 16, undefined, 'both'),
  com('com-017', 'bento', '加菜', 15, 17, undefined, 'both'),

  // ── 單點 (à-la-carte / single) ──
  com('com-101', 'single', '油淋雞腿', 100, 1, img(0)),
  com('com-102', 'single', '炸雞腿', 90, 2, img(0)),
  com('com-103', 'single', '滷雞腿', 90, 3, img(1)),
  com('com-104', 'single', '魚排', 65, 4, img(10)),
  com('com-105', 'single', '排骨', 75, 5, img(2)),
  com('com-106', 'single', '焢肉', 75, 6, img(7)),
  com('com-107', 'single', '蒜泥白肉', 75, 7, img(13)),
  com('com-108', 'single', '京醬肉絲', 70, 8, img(4)),
  com('com-109', 'single', '糖醋雞丁', 70, 9, img(9)),
  com('com-110', 'single', '雞肉絲', 55, 10, img(8)),
  com('com-111', 'single', '無骨雞排', 55, 11, img(5)),
  com('com-112', 'single', '蔬菜', 30, 12, img(12)),
  com('com-113', 'single', '加蛋', 15, 13),
  com('com-114', 'single', '加菜(大)', 30, 14),
  com('com-115', 'single', '白飯', 10, 15),
  com('com-116', 'single', '白飯(小)', 5, 16),

  // ── 飲料 (drink) ──
  com('com-201', 'drink', '果醋飲', 20, 1),
  com('com-202', 'drink', '果醋飲x3', 50, 2),
  com('com-203', 'drink', '原萃綠茶', 25, 3),
  com('com-204', 'drink', '樂天優格', 25, 4),
  com('com-205', 'drink', '蜂蜜牛奶', 23, 5),
  com('com-206', 'drink', '可樂Zero', 25, 6),
  com('com-207', 'drink', '維大力', 25, 7),
  com('com-208', 'drink', '樹頂蘋果汁', 40, 8),
  com('com-209', 'drink', '瓶裝水', 10, 9),

  // ── 水餃 (dumpling) ──
  com('com-301', 'dumpling', '干貝水餃', 275, 1, img(14)),
  com('com-302', 'dumpling', '招牌水餃', 240, 2, img(14)),
  com('com-303', 'dumpling', '韭菜水餃', 240, 3, img(14)),
  com('com-304', 'dumpling', '養生水餃', 275, 4, img(14)),
  com('com-305', 'dumpling', '玉米水餃', 240, 5, img(14)),
] as const

// ─── Database Seeding ───────────────────────────────────────────────────────

/** Seed employees and attendances into an empty database. */
export function seedEmployees(db: Database): void {
  for (const emp of SEED_EMPLOYEES) {
    db.exec(
      `INSERT OR IGNORE INTO employees (id, name, avatar, status, shift_type, employee_no, is_admin, hire_date, resignation_date, created_at, updated_at)
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

  const attendances = buildSeedAttendances()
  for (const att of attendances) {
    db.exec(
      `INSERT OR IGNORE INTO attendances (id, employee_id, date, clock_in, clock_out, type)
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
}

/** Seed commodity types and commodities into an empty database. */
export function seedCommodities(db: Database): void {
  for (const ct of SEED_COMMONDITY_TYPES) {
    db.exec(
      `INSERT OR IGNORE INTO commondity_types (id, type_id, type, label, color, created_at, updated_at)
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

  for (const com of SEED_COMMONDITIES) {
    db.exec(
      `INSERT OR IGNORE INTO commondities (id, type_id, name, image, price, priority, on_market, hide_on_mode, editor, created_at, updated_at)
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

/**
 * Insert all seed data into the database using parameterized SQL.
 * Seeds employees and commodities independently based on table emptiness.
 */
export function seedDatabase(db: Database): void {
  seedEmployees(db)
  seedCommodities(db)
}
