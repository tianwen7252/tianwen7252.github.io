/**
 * Tests for the CloudBackupDbStats component.
 * Covers table rendering with row counts and total row.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// ── Mocks ───────────────────────────────────────────────────────────────────

const mockRefetch = vi.fn()
let mockDbStats = {
  tables: [
    { tableName: 'commodities', rowCount: 25 },
    { tableName: 'orders', rowCount: 100 },
    { tableName: 'employees', rowCount: 8 },
  ],
  totalRows: 133,
  isLoading: false,
  error: null as Error | null,
  refetch: mockRefetch,
}

vi.mock('@/hooks/use-db-stats', () => ({
  useDbStats: () => mockDbStats,
}))

import { CloudBackupDbStats } from './cloud-backup-db-stats'

// ── Helpers ─────────────────────────────────────────────────────────────────

function renderWithProviders(ui: React.ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  )
}

// ── Tests ───────────────────────────────────────────────────────────────────

describe('CloudBackupDbStats', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockDbStats = {
      tables: [
        { tableName: 'commodities', rowCount: 25 },
        { tableName: 'orders', rowCount: 100 },
        { tableName: 'employees', rowCount: 8 },
      ],
      totalRows: 133,
      isLoading: false,
      error: null,
      refetch: mockRefetch,
    }
  })

  it('renders the card title', () => {
    renderWithProviders(<CloudBackupDbStats />)
    expect(screen.getByText('資料庫統計')).toBeTruthy()
  })

  it('renders table headers', () => {
    renderWithProviders(<CloudBackupDbStats />)
    expect(screen.getByText('資料表')).toBeTruthy()
    expect(screen.getByText('筆數')).toBeTruthy()
  })

  it('renders all table names from useDbStats', () => {
    renderWithProviders(<CloudBackupDbStats />)
    expect(screen.getByText('commodities')).toBeTruthy()
    expect(screen.getByText('orders')).toBeTruthy()
    expect(screen.getByText('employees')).toBeTruthy()
  })

  it('renders row counts for each table', () => {
    renderWithProviders(<CloudBackupDbStats />)
    expect(screen.getByText('25')).toBeTruthy()
    expect(screen.getByText('100')).toBeTruthy()
    expect(screen.getByText('8')).toBeTruthy()
  })

  it('renders total row at the bottom', () => {
    renderWithProviders(<CloudBackupDbStats />)
    expect(screen.getByText('合計')).toBeTruthy()
    expect(screen.getByText('133')).toBeTruthy()
  })

  it('renders empty table when no stats are available', () => {
    mockDbStats = {
      ...mockDbStats,
      tables: [],
      totalRows: 0,
    }
    renderWithProviders(<CloudBackupDbStats />)
    expect(screen.getByText('合計')).toBeTruthy()
    expect(screen.getByText('0')).toBeTruthy()
  })
})
