import React from 'react'
import { describe, test, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { App } from '../App'

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
  attendances: {
    getByMonth: vi.fn().mockResolvedValue([]),
    getByDate: vi.fn().mockResolvedValue([]),
    add: vi.fn(),
    set: vi.fn(),
  },
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
  useLiveQuery: vi.fn().mockReturnValue([]),
}))

// Mock Root to prevent full route rendering in tests
vi.mock('src/pages/Root', () => ({
  default: () => <div data-testid="root-mock">Root</div>,
  Root: () => <div data-testid="root-mock">Root</div>,
  Component: () => <div data-testid="root-mock">Root</div>,
}))

describe('App tests', () => {
  test('renders without crashing', () => {
    const { container } = render(<App />)
    expect(container).toBeDefined()
  })
})
