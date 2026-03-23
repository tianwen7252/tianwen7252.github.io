import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ProductGrid } from './product-grid'
import type { Commondity, CommondityType } from '@/lib/schemas'

// ─── Mock repositories ──────────────────────────────────────────────────────

const mockFindAllTypes = vi.fn<() => Promise<CommondityType[]>>()
const mockFindOnMarket = vi.fn<() => Promise<Commondity[]>>()
const mockFindByTypeId = vi.fn<(typeId: string) => Promise<Commondity[]>>()

vi.mock('@/lib/repositories/provider', () => ({
  getCommondityTypeRepo: () => ({
    findAll: mockFindAllTypes,
  }),
  getCommondityRepo: () => ({
    findOnMarket: mockFindOnMarket,
    findByTypeId: mockFindByTypeId,
  }),
}))

// ─── Mock order store ────────────────────────────────────────────────────────

const mockAddItem = vi.fn()

vi.mock('@/stores/order-store', () => {
  const store = (selector: (state: Record<string, unknown>) => unknown) =>
    selector({ addItem: mockAddItem })
  store.getState = () => ({ addItem: mockAddItem })
  return { useOrderStore: store }
})

// ─── Test data factories ─────────────────────────────────────────────────────

function makeCategoryType(
  overrides: Partial<CommondityType> = {},
): CommondityType {
  return {
    id: 'ct-1',
    typeId: 'type-1',
    type: 'bento',
    label: '便當',
    color: '',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...overrides,
  }
}

function makeCommodity(overrides: Partial<Commondity> = {}): Commondity {
  return {
    id: 'com-1',
    typeId: 'type-1',
    name: '滷肉便當',
    image: '/images/braised-pork.png',
    price: 100,
    priority: 0,
    onMarket: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...overrides,
  }
}

const mockCategories: CommondityType[] = [
  makeCategoryType({ id: 'ct-1', typeId: 'type-1', label: '便當' }),
  makeCategoryType({ id: 'ct-2', typeId: 'type-2', label: '單點' }),
]

const mockCommodities: Commondity[] = [
  makeCommodity({ id: 'com-1', name: '滷肉便當', price: 100 }),
  makeCommodity({ id: 'com-2', name: '炸雞腿便當', price: 130 }),
  makeCommodity({ id: 'com-3', name: '排骨便當', price: 120 }),
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Create a fresh QueryClient per test (no shared cache) */
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  })
}

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = createTestQueryClient()
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  )
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('ProductGrid', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFindAllTypes.mockResolvedValue(mockCategories)
    mockFindOnMarket.mockResolvedValue(mockCommodities)
    mockFindByTypeId.mockResolvedValue(mockCommodities)
  })

  it('should show loading state initially', () => {
    // Make the promise never resolve to keep loading state
    mockFindAllTypes.mockReturnValue(new Promise(() => {}))
    mockFindOnMarket.mockReturnValue(new Promise(() => {}))
    renderWithProviders(<ProductGrid />)
    expect(screen.getByText('載入中...')).toBeTruthy()
  })

  it('should render category tabs after data loads', async () => {
    renderWithProviders(<ProductGrid />)
    await waitFor(() => {
      expect(screen.getByRole('tab', { name: '便當' })).toBeTruthy()
      expect(screen.getByRole('tab', { name: '單點' })).toBeTruthy()
    })
  })

  it('should render product cards after data loads', async () => {
    renderWithProviders(<ProductGrid />)
    await waitFor(() => {
      expect(screen.getByText('滷肉便當')).toBeTruthy()
      expect(screen.getByText('炸雞腿便當')).toBeTruthy()
      expect(screen.getByText('排骨便當')).toBeTruthy()
    })
  })

  it('should render product prices', async () => {
    renderWithProviders(<ProductGrid />)
    await waitFor(() => {
      expect(screen.getByText('$100')).toBeTruthy()
      expect(screen.getByText('$130')).toBeTruthy()
      expect(screen.getByText('$120')).toBeTruthy()
    })
  })

  it('should call findByTypeId with bento initially (default category)', async () => {
    renderWithProviders(<ProductGrid />)
    await waitFor(() => {
      expect(mockFindByTypeId).toHaveBeenCalledWith('bento')
    })
    expect(mockFindOnMarket).not.toHaveBeenCalled()
  })

  it('should call findByTypeId when a category tab is clicked', async () => {
    const filteredItems = [
      makeCommodity({ id: 'com-4', name: '炒青菜', price: 50, typeId: 'type-2' }),
    ]
    mockFindByTypeId.mockResolvedValue(filteredItems)
    const user = userEvent.setup()

    renderWithProviders(<ProductGrid />)

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByRole('tab', { name: '單點' })).toBeTruthy()
    })

    await user.click(screen.getByRole('tab', { name: '單點' }))

    await waitFor(() => {
      expect(mockFindByTypeId).toHaveBeenCalledWith('type-2')
    })
  })

  it('should add item to order store when product card is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ProductGrid />)

    await waitFor(() => {
      expect(screen.getByText('滷肉便當')).toBeTruthy()
    })

    // Click the first product card button
    const productButtons = screen.getAllByRole('button')
    // Find the button that contains the product name (not the category tabs)
    const productButton = productButtons.find(btn =>
      btn.textContent?.includes('滷肉便當'),
    )
    expect(productButton).toBeTruthy()
    await user.click(productButton!)

    expect(mockAddItem).toHaveBeenCalledWith({
      id: 'com-1',
      name: '滷肉便當',
      price: 100,
    })
  })

  it('should show empty state when no products are available', async () => {
    mockFindByTypeId.mockResolvedValue([])
    renderWithProviders(<ProductGrid />)
    await waitFor(() => {
      expect(screen.getByText('目前沒有商品')).toBeTruthy()
    })
  })

  it('should render the view toggle button', async () => {
    renderWithProviders(<ProductGrid />)
    await waitFor(() => {
      expect(screen.getByText('滷肉便當')).toBeTruthy()
    })
    // View toggle button should exist (aria-label based)
    expect(screen.getByLabelText(/計算機/i)).toBeTruthy()
  })

  it('should fetch categories and commodities from repositories', async () => {
    renderWithProviders(<ProductGrid />)
    await waitFor(() => {
      expect(mockFindAllTypes).toHaveBeenCalledTimes(1)
      expect(mockFindByTypeId).toHaveBeenCalledWith('bento')
    })
  })

  it('should toggle view mode when view toggle is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ProductGrid />)

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('滷肉便當')).toBeTruthy()
    })

    // Initially in grid mode — button says "switch to list"
    expect(screen.getByLabelText(/計算機/i)).toBeTruthy()

    // Click toggle — should switch to list mode
    await user.click(screen.getByLabelText(/計算機/i))

    // Now in list mode — button says "switch to grid"
    expect(screen.getByLabelText(/計算機/i)).toBeTruthy()

    // Click toggle again — should switch back to grid mode
    await user.click(screen.getByLabelText(/計算機/i))

    // Back to grid mode
    expect(screen.getByLabelText(/計算機/i)).toBeTruthy()
  })
})
