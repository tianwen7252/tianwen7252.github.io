import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useOrderStore } from '@/stores/order-store'
import type { CartItem, Discount } from '@/stores/order-store'

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

/** Factory to create mock CartItem objects */
function makeCartItem(overrides: Partial<CartItem> = {}): CartItem {
  return {
    id: 'cart-1',
    commodityId: 'com-1',
    name: '經典漢堡',
    price: 120,
    quantity: 1,
    note: '',
    ...overrides,
  }
}

/** Factory to create mock Discount objects */
function makeDiscount(overrides: Partial<Discount> = {}): Discount {
  return {
    id: 'disc-1',
    label: '會員折扣',
    amount: 50,
    ...overrides,
  }
}

describe('OrderPanel', () => {
  beforeEach(() => {
    // Reset store state before each test
    act(() => {
      useOrderStore.setState({
        items: [],
        discounts: [],
        operatorId: null,
        operatorName: null,
      })
    })
  })

  // Lazy import to ensure mock is applied first
  async function renderOrderPanel() {
    const { OrderPanel } = await import('./order-panel')
    return render(<OrderPanel />)
  }

  it('should render the header', async () => {
    await renderOrderPanel()
    expect(screen.getByText('目前訂單')).toBeTruthy()
  })

  it('should show empty state when cart has no items', async () => {
    await renderOrderPanel()
    expect(screen.getByText('尚無訂單項目')).toBeTruthy()
  })

  it('should render cart items', async () => {
    act(() => {
      useOrderStore.setState({
        items: [
          makeCartItem({ id: 'c1', name: '經典漢堡', price: 120, quantity: 2 }),
          makeCartItem({ id: 'c2', name: '香草奶昔', price: 80, quantity: 1 }),
        ],
      })
    })
    await renderOrderPanel()
    expect(screen.getByText('經典漢堡')).toBeTruthy()
    expect(screen.getByText('香草奶昔')).toBeTruthy()
  })

  it('should render discount section', async () => {
    act(() => {
      useOrderStore.setState({
        items: [makeCartItem()],
        discounts: [makeDiscount({ label: '會員折扣', amount: 50 })],
      })
    })
    await renderOrderPanel()
    expect(screen.getByText('折扣優惠 (可多選)')).toBeTruthy()
    expect(screen.getByText(/會員折扣/)).toBeTruthy()
  })

  it('should render order summary with correct totals', async () => {
    act(() => {
      useOrderStore.setState({
        items: [
          makeCartItem({ price: 120, quantity: 2 }),
          makeCartItem({ id: 'c2', commodityId: 'com-2', name: '香草奶昔', price: 80, quantity: 1 }),
        ],
        discounts: [makeDiscount({ amount: 50 })],
      })
    })
    await renderOrderPanel()
    // Subtotal: 120*2 + 80*1 = 320
    expect(screen.getByText('$320')).toBeTruthy()
    // Total: 320 - 50 = 270
    expect(screen.getByText('$270')).toBeTruthy()
  })

  it('should render submit button', async () => {
    await renderOrderPanel()
    expect(screen.getByRole('button', { name: /提交訂單/i })).toBeTruthy()
  })

  it('should disable submit button when cart is empty', async () => {
    await renderOrderPanel()
    const submitButton = screen.getByRole('button', { name: /提交訂單/i })
    expect(submitButton.hasAttribute('disabled')).toBe(true)
  })

  it('should enable submit button when cart has items', async () => {
    act(() => {
      useOrderStore.setState({
        items: [makeCartItem()],
      })
    })
    await renderOrderPanel()
    const submitButton = screen.getByRole('button', { name: /提交訂單/i })
    expect(submitButton.hasAttribute('disabled')).toBe(false)
  })

  it('should call removeItem when item remove button is clicked', async () => {
    act(() => {
      useOrderStore.setState({
        items: [makeCartItem({ id: 'cart-42', name: '滷肉便當' })],
      })
    })
    const user = userEvent.setup()
    await renderOrderPanel()
    // Click the remove button on the item row
    await user.click(screen.getByRole('button', { name: /remove/i }))
    // Item should be removed from store
    expect(useOrderStore.getState().items).toHaveLength(0)
  })

  it('should call removeDiscount when discount remove button is clicked', async () => {
    act(() => {
      useOrderStore.setState({
        items: [makeCartItem()],
        discounts: [makeDiscount({ id: 'disc-99', label: '測試折扣', amount: 30 })],
      })
    })
    const user = userEvent.setup()
    await renderOrderPanel()
    // Find the remove button within the discount tag
    const discountTag = screen.getByTestId('discount-tag')
    const removeBtn = discountTag.querySelector('button')
    expect(removeBtn).toBeTruthy()
    await user.click(removeBtn!)
    expect(useOrderStore.getState().discounts).toHaveLength(0)
  })

  it('should call submitOrder and show toast on success', async () => {
    const { toast } = await import('sonner')
    // Mock the repo to prevent actual DB calls
    vi.spyOn(useOrderStore.getState(), 'submitOrder').mockResolvedValueOnce()

    act(() => {
      useOrderStore.setState({
        items: [makeCartItem()],
      })
    })

    const user = userEvent.setup()
    await renderOrderPanel()
    const submitButton = screen.getByRole('button', { name: /提交訂單/i })
    await user.click(submitButton)

    expect(toast.success).toHaveBeenCalledWith('訂單已提交')
  })

  it('should show error toast when submitOrder fails', async () => {
    const { toast } = await import('sonner')
    vi.spyOn(useOrderStore.getState(), 'submitOrder').mockRejectedValueOnce(
      new Error('Network error'),
    )

    act(() => {
      useOrderStore.setState({
        items: [makeCartItem()],
      })
    })

    const user = userEvent.setup()
    await renderOrderPanel()
    const submitButton = screen.getByRole('button', { name: /提交訂單/i })
    await user.click(submitButton)

    expect(toast.error).toHaveBeenCalledWith('提交失敗，請重試')
  })

  it('should not render empty state when items exist', async () => {
    act(() => {
      useOrderStore.setState({
        items: [makeCartItem()],
      })
    })
    await renderOrderPanel()
    expect(screen.queryByText('尚無訂單項目')).toBeNull()
  })

  it('should update quantity via increase button', async () => {
    act(() => {
      useOrderStore.setState({
        items: [makeCartItem({ id: 'cart-1', quantity: 1 })],
      })
    })
    const user = userEvent.setup()
    await renderOrderPanel()
    await user.click(screen.getByRole('button', { name: /increase/i }))
    const updatedItem = useOrderStore.getState().items.find(i => i.id === 'cart-1')
    expect(updatedItem?.quantity).toBe(2)
  })

  it('should show item note when present', async () => {
    act(() => {
      useOrderStore.setState({
        items: [makeCartItem({ note: '不加蛋' })],
      })
    })
    await renderOrderPanel()
    expect(screen.getByText('不加蛋')).toBeTruthy()
  })
})
