import React from 'react'
import { describe, test, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { Order } from '../Order'

vi.mock('src/libs/dataCenter', () => ({
  db: {},
  init: vi.fn(),
  initDB: vi.fn(),
  DB_NAME: 'TianwenDB',
}))

vi.mock('src/libs/api', () => ({
  commondityTypes: { get: vi.fn().mockResolvedValue([]), set: vi.fn() },
  commondity: {
    get: vi.fn().mockResolvedValue([]),
    getMapData: vi.fn().mockResolvedValue({}),
    add: vi.fn(),
    clear: vi.fn(),
  },
  orderTypes: { get: vi.fn().mockResolvedValue([]) },
  orders: { get: vi.fn().mockResolvedValue([]), set: vi.fn(), delete: vi.fn() },
  resetCommonditType: vi.fn(),
  resetOrderType: vi.fn(),
}))

vi.mock('dexie-react-hooks', () => ({
  useLiveQuery: vi.fn().mockReturnValue([]),
}))

// Mock swipe-listener to avoid DOM attachment issues in tests
vi.mock('swipe-listener', () => ({
  default: vi.fn().mockReturnValue({ off: vi.fn() }),
}))

const mockRecord: RestaDB.Table.Order = {
  id: 1,
  number: 1,
  data: [{ value: '100', res: 'Test Item', type: 'main-dish' }],
  total: 100,
  originalTotal: 100,
  memo: ['內用'],
  createdAt: Date.now(),
}

describe('Order tests', () => {
  test('renders without crashing', () => {
    const { container } = render(
      <Order record={mockRecord} number={1} />,
    )
    expect(container).toBeDefined()
  })
})
