import React from 'react'
import { describe, test, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import Settings from '../Settings'

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
  orders: { get: vi.fn().mockResolvedValue([]) },
  dailyData: { get: vi.fn().mockResolvedValue([]) },
  resetCommonditType: vi.fn(),
  resetOrderType: vi.fn(),
}))

vi.mock('dexie-react-hooks', () => ({
  useLiveQuery: vi.fn().mockReturnValue([]),
}))

vi.mock('src/components/Settings/Backup/fileService', () => ({
  backupAndUpload: vi.fn(),
  listDriveFiles: vi.fn().mockResolvedValue([]),
  deleteFiles: vi.fn(),
  restoreFromBackup: vi.fn(),
  generateDefaultBackupName: vi.fn().mockReturnValue('backup-name'),
}))

describe('Settings tests', () => {
  test('renders without crashing', () => {
    const { container } = render(<Settings />)
    expect(container).toBeDefined()
  })
})
