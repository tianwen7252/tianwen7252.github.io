/**
 * Centralized test data constants for E2E tests.
 * All seed data used across tests is defined here for consistency.
 */

// Database name and version must match src/libs/dataCenter.ts
export const DB_NAME = 'TianwenDB'
export const DB_VERSION = 8

// Commodity types matching src/constants/defaults/commondities.ts
export const COMMONDITY_TYPES = [
  { typeID: '1', type: 'main-dish', label: '🍱 餐盒', color: 'green' },
  { typeID: '2', type: 'à-la-carte', label: '🍖 單點', color: 'brown' },
  { typeID: '3', type: 'others', label: '🧃 飲料|水餃', color: 'indigo' },
] as const

// Commodities for seeding — at least 5 items across different categories
export const COMMONDITIES = [
  {
    name: '油淋雞腿飯',
    price: 140,
    priority: 1,
    typeID: '1',
    onMarket: '1' as const,
  },
  {
    name: '排骨飯',
    price: 115,
    priority: 5,
    typeID: '1',
    onMarket: '1' as const,
  },
  {
    name: '雞肉絲飯',
    price: 100,
    priority: 10,
    typeID: '1',
    onMarket: '1' as const,
  },
  {
    name: '油淋雞腿',
    price: 100,
    priority: 1,
    typeID: '2',
    onMarket: '1' as const,
  },
  {
    name: '果醋飲',
    price: 20,
    priority: 6,
    typeID: '3',
    onMarket: '1' as const,
  },
  {
    name: '招牌水餃',
    price: 240,
    priority: 2,
    typeID: '3',
    onMarket: '1' as const,
  },
] as const

// Order types matching src/constants/defaults/orderTypes.ts
export const ORDER_TYPES = [
  { name: '飯少', priority: 1, type: 'meal' as const },
  { name: '飯多', priority: 2, type: 'meal' as const },
  { name: '不要湯', priority: 4, type: 'meal' as const },
  { name: '優惠價', color: 'purple', priority: 6, type: 'order' as const },
  { name: '外送', color: 'gold', priority: 8, type: 'order' as const },
] as const

// Employees for testing
export const EMPLOYEES = [
  { name: '小明', avatar: '', status: 'active' },
  { name: '小華', avatar: '', status: 'active' },
] as const

/**
 * Generate a timestamp for "today" at the given hour:minute.
 * Uses the page's local timezone context.
 */
export function todayTimestamp(hour: number, minute = 0): number {
  const now = new Date()
  const d = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    hour,
    minute,
    0,
    0,
  )
  return d.getTime()
}

/**
 * Generate today's date string in YYYY/MM/DD format.
 * Must match the format used in src/libs/api.ts (line 109): day.format('YYYY/MM/DD')
 */
export function todayDateString(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}/${m}/${d}`
}

// Sample orders for seeding — 5 orders for today
export function createTestOrders() {
  const now = Date.now()
  return [
    {
      uuid: 'test-uuid-001',
      number: 1,
      data: [{ res: '油淋雞腿飯', value: '140', type: 'main-dish' }],
      memo: [],
      soups: 1,
      createdAt: todayTimestamp(9, 0),
      updatedAt: todayTimestamp(9, 0),
      total: 140,
      editor: 'e2e-test',
    },
    {
      uuid: 'test-uuid-002',
      number: 2,
      data: [
        { res: '排骨飯', value: '115', type: 'main-dish' },
        { res: '果醋飲', value: '20', type: 'others' },
      ],
      memo: [],
      soups: 1,
      createdAt: todayTimestamp(10, 30),
      updatedAt: todayTimestamp(10, 30),
      total: 135,
      editor: 'e2e-test',
    },
    {
      uuid: 'test-uuid-003',
      number: 3,
      data: [{ res: '雞肉絲飯', value: '100', type: 'main-dish' }],
      memo: ['不要湯'],
      soups: 0,
      createdAt: todayTimestamp(11, 0),
      updatedAt: todayTimestamp(11, 0),
      total: 100,
      editor: 'e2e-test',
    },
    {
      uuid: 'test-uuid-004',
      number: 4,
      data: [
        { res: '油淋雞腿', value: '100', type: 'à-la-carte' },
        { res: '招牌水餃', value: '240', type: 'others' },
      ],
      memo: ['外送'],
      soups: 0,
      createdAt: todayTimestamp(13, 0),
      updatedAt: todayTimestamp(13, 0),
      total: 340,
      editor: 'e2e-test',
    },
    {
      uuid: 'test-uuid-005',
      number: 5,
      data: [{ res: '排骨飯', value: '115', type: 'main-dish' }],
      memo: ['優惠價'],
      soups: 1,
      createdAt: todayTimestamp(14, 0),
      updatedAt: todayTimestamp(14, 0),
      total: 100,
      originalTotal: 115,
      editor: 'e2e-test',
    },
  ]
}

// Daily data summary for today
export function createTestDailyData() {
  const orders = createTestOrders()
  const total = orders.reduce((sum, o) => sum + o.total, 0)
  const originalTotal = orders.reduce(
    (sum, o) => sum + (o.originalTotal ?? o.total),
    0,
  )
  return [
    {
      date: todayDateString(),
      total,
      originalTotal,
      createdAt: todayTimestamp(9, 0),
      updatedAt: todayTimestamp(14, 0),
      editor: 'e2e-test',
    },
  ]
}

/**
 * Generate today's date string in YYYY-MM-DD format.
 * Used by attendance records — must match ClockIn.tsx: dayjs().format('YYYY-MM-DD')
 */
export function todayDateStringDash(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// Attendance records for today
export function createTestAttendances() {
  return [
    {
      employeeId: 1,
      date: todayDateStringDash(),
      clockIn: todayTimestamp(8, 0),
      clockOut: todayTimestamp(15, 0),
    },
    {
      employeeId: 2,
      date: todayDateStringDash(),
      clockIn: todayTimestamp(9, 0),
    },
  ]
}
