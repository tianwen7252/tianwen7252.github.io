import React from 'react'
import { describe, test, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import OrderList from '../OrderList'

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
  employees: { get: vi.fn().mockResolvedValue([]) },
  orders: {
    get: vi.fn().mockResolvedValue([]),
    add: vi.fn().mockResolvedValue(1),
    set: vi.fn(),
    delete: vi.fn(),
  },
  dailyData: { get: vi.fn().mockResolvedValue([]) },
  resetCommonditType: vi.fn(),
  resetOrderType: vi.fn(),
}))

vi.mock('dexie-react-hooks', () => ({
  useLiveQuery: vi.fn((_callback, _deps, defaultValue) => defaultValue),
}))

describe('OrderList tests', () => {
  test('renders without crashing', () => {
    const { container } = render(
      <MemoryRouter>
        <OrderList />
      </MemoryRouter>,
    )
    expect(container).toBeDefined()
  })
})
