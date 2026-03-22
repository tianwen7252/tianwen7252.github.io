import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useOrderStore } from './order-store'
import type { OrderRepository } from '@/lib/repositories/order-repository'
import type { Order } from '@/lib/schemas'

// Mock the repository provider
vi.mock('@/lib/repositories/provider', () => ({
  getOrderRepo: vi.fn(),
}))

// Import after mock declaration so the mock is applied
import { getOrderRepo } from '@/lib/repositories/provider'
const mockedGetOrderRepo = vi.mocked(getOrderRepo)

/**
 * Helper to create a mock OrderRepository with default stubs.
 */
function createMockOrderRepo(
  overrides?: Partial<OrderRepository>,
): OrderRepository {
  return {
    findAll: vi.fn(),
    findById: vi.fn(),
    findByDateRange: vi.fn(),
    create: vi.fn().mockResolvedValue({
      id: 'order-1',
      number: 1,
      data: [],
      memo: [],
      soups: 0,
      total: 0,
      editor: '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    } satisfies Order),
    getNextOrderNumber: vi.fn().mockResolvedValue(1),
    ...overrides,
  }
}

describe('useOrderStore', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    useOrderStore.setState({
      operatorId: null,
      operatorName: null,
      items: [],
      discounts: [],
    })
    vi.clearAllMocks()
  })

  // ─── Initial State ──────────────────────────────────────────────────────────

  describe('initial state', () => {
    it('should have null operator by default', () => {
      const state = useOrderStore.getState()
      expect(state.operatorId).toBeNull()
      expect(state.operatorName).toBeNull()
    })

    it('should have empty items by default', () => {
      const state = useOrderStore.getState()
      expect(state.items).toEqual([])
    })

    it('should have empty discounts by default', () => {
      const state = useOrderStore.getState()
      expect(state.discounts).toEqual([])
    })
  })

  // ─── setOperator ────────────────────────────────────────────────────────────

  describe('setOperator', () => {
    it('should set operator id and name', () => {
      useOrderStore.getState().setOperator('emp-001', 'Alice')
      const state = useOrderStore.getState()
      expect(state.operatorId).toBe('emp-001')
      expect(state.operatorName).toBe('Alice')
    })

    it('should clear operator when null is passed', () => {
      useOrderStore.getState().setOperator('emp-001', 'Alice')
      useOrderStore.getState().setOperator(null, null)
      const state = useOrderStore.getState()
      expect(state.operatorId).toBeNull()
      expect(state.operatorName).toBeNull()
    })
  })

  // ─── addItem ────────────────────────────────────────────────────────────────

  describe('addItem', () => {
    it('should add a new item with quantity 1 and empty note', () => {
      useOrderStore
        .getState()
        .addItem({ id: 'com-1', name: 'Fried Rice', price: 100 })
      const { items } = useOrderStore.getState()
      expect(items).toHaveLength(1)
      expect(items[0]).toMatchObject({
        commodityId: 'com-1',
        name: 'Fried Rice',
        price: 100,
        quantity: 1,
        note: '',
      })
      // Cart item should have a unique id
      expect(items[0]!.id).toBeDefined()
      expect(typeof items[0]!.id).toBe('string')
      expect(items[0]!.id.length).toBeGreaterThan(0)
    })

    it('should increment quantity when adding duplicate commodity', () => {
      const store = useOrderStore.getState()
      store.addItem({ id: 'com-1', name: 'Fried Rice', price: 100 })
      useOrderStore
        .getState()
        .addItem({ id: 'com-1', name: 'Fried Rice', price: 100 })
      const { items } = useOrderStore.getState()
      expect(items).toHaveLength(1)
      expect(items[0]!.quantity).toBe(2)
    })

    it('should add separate items for different commodities', () => {
      const store = useOrderStore.getState()
      store.addItem({ id: 'com-1', name: 'Fried Rice', price: 100 })
      useOrderStore
        .getState()
        .addItem({ id: 'com-2', name: 'Noodles', price: 80 })
      const { items } = useOrderStore.getState()
      expect(items).toHaveLength(2)
      expect(items[0]!.commodityId).toBe('com-1')
      expect(items[1]!.commodityId).toBe('com-2')
    })

    it('should not mutate the original items array', () => {
      useOrderStore
        .getState()
        .addItem({ id: 'com-1', name: 'Fried Rice', price: 100 })
      const itemsBefore = useOrderStore.getState().items
      useOrderStore
        .getState()
        .addItem({ id: 'com-2', name: 'Noodles', price: 80 })
      const itemsAfter = useOrderStore.getState().items
      // Should be a different array reference (immutable)
      expect(itemsBefore).not.toBe(itemsAfter)
    })
  })

  // ─── removeItem ─────────────────────────────────────────────────────────────

  describe('removeItem', () => {
    it('should remove item by cart item id', () => {
      useOrderStore
        .getState()
        .addItem({ id: 'com-1', name: 'Fried Rice', price: 100 })
      const cartItemId = useOrderStore.getState().items[0]!.id
      useOrderStore.getState().removeItem(cartItemId)
      expect(useOrderStore.getState().items).toHaveLength(0)
    })

    it('should not affect other items when removing one', () => {
      useOrderStore
        .getState()
        .addItem({ id: 'com-1', name: 'Fried Rice', price: 100 })
      useOrderStore
        .getState()
        .addItem({ id: 'com-2', name: 'Noodles', price: 80 })
      const firstItemId = useOrderStore.getState().items[0]!.id
      useOrderStore.getState().removeItem(firstItemId)
      const { items } = useOrderStore.getState()
      expect(items).toHaveLength(1)
      expect(items[0]!.commodityId).toBe('com-2')
    })

    it('should do nothing if cart item id does not exist', () => {
      useOrderStore
        .getState()
        .addItem({ id: 'com-1', name: 'Fried Rice', price: 100 })
      useOrderStore.getState().removeItem('non-existent-id')
      expect(useOrderStore.getState().items).toHaveLength(1)
    })
  })

  // ─── updateQuantity ─────────────────────────────────────────────────────────

  describe('updateQuantity', () => {
    it('should update quantity for a cart item', () => {
      useOrderStore
        .getState()
        .addItem({ id: 'com-1', name: 'Fried Rice', price: 100 })
      const cartItemId = useOrderStore.getState().items[0]!.id
      useOrderStore.getState().updateQuantity(cartItemId, 5)
      expect(useOrderStore.getState().items[0]!.quantity).toBe(5)
    })

    it('should remove item when quantity is set to 0', () => {
      useOrderStore
        .getState()
        .addItem({ id: 'com-1', name: 'Fried Rice', price: 100 })
      const cartItemId = useOrderStore.getState().items[0]!.id
      useOrderStore.getState().updateQuantity(cartItemId, 0)
      expect(useOrderStore.getState().items).toHaveLength(0)
    })

    it('should remove item when quantity is negative', () => {
      useOrderStore
        .getState()
        .addItem({ id: 'com-1', name: 'Fried Rice', price: 100 })
      const cartItemId = useOrderStore.getState().items[0]!.id
      useOrderStore.getState().updateQuantity(cartItemId, -1)
      expect(useOrderStore.getState().items).toHaveLength(0)
    })

    it('should not mutate items when updating quantity', () => {
      useOrderStore
        .getState()
        .addItem({ id: 'com-1', name: 'Fried Rice', price: 100 })
      const itemsBefore = useOrderStore.getState().items
      const cartItemId = itemsBefore[0]!.id
      useOrderStore.getState().updateQuantity(cartItemId, 3)
      const itemsAfter = useOrderStore.getState().items
      expect(itemsBefore).not.toBe(itemsAfter)
      // Original item object should not be mutated
      expect(itemsBefore[0]!.quantity).toBe(1)
    })
  })

  // ─── updateNote ─────────────────────────────────────────────────────────────

  describe('updateNote', () => {
    it('should update note for a cart item', () => {
      useOrderStore
        .getState()
        .addItem({ id: 'com-1', name: 'Fried Rice', price: 100 })
      const cartItemId = useOrderStore.getState().items[0]!.id
      useOrderStore.getState().updateNote(cartItemId, 'No egg')
      expect(useOrderStore.getState().items[0]!.note).toBe('No egg')
    })

    it('should clear note when empty string is passed', () => {
      useOrderStore
        .getState()
        .addItem({ id: 'com-1', name: 'Fried Rice', price: 100 })
      const cartItemId = useOrderStore.getState().items[0]!.id
      useOrderStore.getState().updateNote(cartItemId, 'No egg')
      useOrderStore.getState().updateNote(cartItemId, '')
      expect(useOrderStore.getState().items[0]!.note).toBe('')
    })

    it('should not mutate items when updating note', () => {
      useOrderStore
        .getState()
        .addItem({ id: 'com-1', name: 'Fried Rice', price: 100 })
      const itemsBefore = useOrderStore.getState().items
      const cartItemId = itemsBefore[0]!.id
      useOrderStore.getState().updateNote(cartItemId, 'Extra spicy')
      const itemsAfter = useOrderStore.getState().items
      expect(itemsBefore).not.toBe(itemsAfter)
      expect(itemsBefore[0]!.note).toBe('')
    })

    it('should handle Unicode characters in notes', () => {
      useOrderStore
        .getState()
        .addItem({ id: 'com-1', name: 'Fried Rice', price: 100 })
      const cartItemId = useOrderStore.getState().items[0]!.id
      useOrderStore.getState().updateNote(cartItemId, '不加蛋、少辣')
      expect(useOrderStore.getState().items[0]!.note).toBe('不加蛋、少辣')
    })
  })

  // ─── addDiscount ────────────────────────────────────────────────────────────

  describe('addDiscount', () => {
    it('should add a discount with a unique id', () => {
      useOrderStore.getState().addDiscount('Member Discount', 50)
      const { discounts } = useOrderStore.getState()
      expect(discounts).toHaveLength(1)
      expect(discounts[0]).toMatchObject({
        label: 'Member Discount',
        amount: 50,
      })
      expect(discounts[0]!.id).toBeDefined()
      expect(typeof discounts[0]!.id).toBe('string')
    })

    it('should allow multiple discounts', () => {
      useOrderStore.getState().addDiscount('Member Discount', 50)
      useOrderStore.getState().addDiscount('Holiday Special', 30)
      const { discounts } = useOrderStore.getState()
      expect(discounts).toHaveLength(2)
      expect(discounts[0]!.id).not.toBe(discounts[1]!.id)
    })

    it('should not mutate the original discounts array', () => {
      useOrderStore.getState().addDiscount('Discount A', 10)
      const discountsBefore = useOrderStore.getState().discounts
      useOrderStore.getState().addDiscount('Discount B', 20)
      const discountsAfter = useOrderStore.getState().discounts
      expect(discountsBefore).not.toBe(discountsAfter)
    })
  })

  // ─── removeDiscount ─────────────────────────────────────────────────────────

  describe('removeDiscount', () => {
    it('should remove discount by id', () => {
      useOrderStore.getState().addDiscount('Member Discount', 50)
      const discountId = useOrderStore.getState().discounts[0]!.id
      useOrderStore.getState().removeDiscount(discountId)
      expect(useOrderStore.getState().discounts).toHaveLength(0)
    })

    it('should not affect other discounts when removing one', () => {
      useOrderStore.getState().addDiscount('Discount A', 10)
      useOrderStore.getState().addDiscount('Discount B', 20)
      const firstDiscountId = useOrderStore.getState().discounts[0]!.id
      useOrderStore.getState().removeDiscount(firstDiscountId)
      const { discounts } = useOrderStore.getState()
      expect(discounts).toHaveLength(1)
      expect(discounts[0]!.label).toBe('Discount B')
    })

    it('should do nothing if discount id does not exist', () => {
      useOrderStore.getState().addDiscount('Discount A', 10)
      useOrderStore.getState().removeDiscount('non-existent-id')
      expect(useOrderStore.getState().discounts).toHaveLength(1)
    })
  })

  // ─── clearCart ──────────────────────────────────────────────────────────────

  describe('clearCart', () => {
    it('should clear all items', () => {
      useOrderStore
        .getState()
        .addItem({ id: 'com-1', name: 'Fried Rice', price: 100 })
      useOrderStore
        .getState()
        .addItem({ id: 'com-2', name: 'Noodles', price: 80 })
      useOrderStore.getState().clearCart()
      expect(useOrderStore.getState().items).toEqual([])
    })

    it('should clear all discounts', () => {
      useOrderStore.getState().addDiscount('Discount A', 10)
      useOrderStore.getState().addDiscount('Discount B', 20)
      useOrderStore.getState().clearCart()
      expect(useOrderStore.getState().discounts).toEqual([])
    })

    it('should NOT clear operator when clearing cart', () => {
      useOrderStore.getState().setOperator('emp-001', 'Alice')
      useOrderStore
        .getState()
        .addItem({ id: 'com-1', name: 'Fried Rice', price: 100 })
      useOrderStore.getState().clearCart()
      const state = useOrderStore.getState()
      expect(state.operatorId).toBe('emp-001')
      expect(state.operatorName).toBe('Alice')
    })

    it('should be safe to call on already empty cart', () => {
      useOrderStore.getState().clearCart()
      const state = useOrderStore.getState()
      expect(state.items).toEqual([])
      expect(state.discounts).toEqual([])
    })
  })

  // ─── getSubtotal ────────────────────────────────────────────────────────────

  describe('getSubtotal', () => {
    it('should return 0 for empty cart', () => {
      expect(useOrderStore.getState().getSubtotal()).toBe(0)
    })

    it('should calculate subtotal for a single item', () => {
      useOrderStore
        .getState()
        .addItem({ id: 'com-1', name: 'Fried Rice', price: 100 })
      expect(useOrderStore.getState().getSubtotal()).toBe(100)
    })

    it('should calculate subtotal with quantity', () => {
      useOrderStore
        .getState()
        .addItem({ id: 'com-1', name: 'Fried Rice', price: 100 })
      const cartItemId = useOrderStore.getState().items[0]!.id
      useOrderStore.getState().updateQuantity(cartItemId, 3)
      expect(useOrderStore.getState().getSubtotal()).toBe(300)
    })

    it('should sum subtotals across multiple items', () => {
      useOrderStore
        .getState()
        .addItem({ id: 'com-1', name: 'Fried Rice', price: 100 })
      useOrderStore
        .getState()
        .addItem({ id: 'com-2', name: 'Noodles', price: 80 })
      // com-1: 100 * 1 = 100, com-2: 80 * 1 = 80
      expect(useOrderStore.getState().getSubtotal()).toBe(180)
    })
  })

  // ─── getTotalDiscount ───────────────────────────────────────────────────────

  describe('getTotalDiscount', () => {
    it('should return 0 when no discounts', () => {
      expect(useOrderStore.getState().getTotalDiscount()).toBe(0)
    })

    it('should sum all discount amounts', () => {
      useOrderStore.getState().addDiscount('Discount A', 50)
      useOrderStore.getState().addDiscount('Discount B', 30)
      expect(useOrderStore.getState().getTotalDiscount()).toBe(80)
    })
  })

  // ─── getTotal ───────────────────────────────────────────────────────────────

  describe('getTotal', () => {
    it('should return 0 for empty cart', () => {
      expect(useOrderStore.getState().getTotal()).toBe(0)
    })

    it('should return subtotal when no discounts', () => {
      useOrderStore
        .getState()
        .addItem({ id: 'com-1', name: 'Fried Rice', price: 100 })
      expect(useOrderStore.getState().getTotal()).toBe(100)
    })

    it('should subtract discounts from subtotal', () => {
      useOrderStore
        .getState()
        .addItem({ id: 'com-1', name: 'Fried Rice', price: 100 })
      useOrderStore.getState().addDiscount('Discount', 30)
      expect(useOrderStore.getState().getTotal()).toBe(70)
    })

    it('should never return negative total (min 0)', () => {
      useOrderStore
        .getState()
        .addItem({ id: 'com-1', name: 'Fried Rice', price: 50 })
      useOrderStore.getState().addDiscount('Big Discount', 200)
      expect(useOrderStore.getState().getTotal()).toBe(0)
    })
  })

  // ─── getItemCount ───────────────────────────────────────────────────────────

  describe('getItemCount', () => {
    it('should return 0 for empty cart', () => {
      expect(useOrderStore.getState().getItemCount()).toBe(0)
    })

    it('should sum all item quantities', () => {
      useOrderStore
        .getState()
        .addItem({ id: 'com-1', name: 'Fried Rice', price: 100 })
      useOrderStore
        .getState()
        .addItem({ id: 'com-2', name: 'Noodles', price: 80 })
      const cartItemId = useOrderStore.getState().items[0]!.id
      useOrderStore.getState().updateQuantity(cartItemId, 3)
      // 3 + 1 = 4
      expect(useOrderStore.getState().getItemCount()).toBe(4)
    })
  })

  // ─── submitOrder ────────────────────────────────────────────────────────────

  describe('submitOrder', () => {
    it('should call getNextOrderNumber and create with correct data', async () => {
      const mockRepo = createMockOrderRepo({
        getNextOrderNumber: vi.fn().mockResolvedValue(5),
      })
      mockedGetOrderRepo.mockReturnValue(mockRepo)

      useOrderStore.getState().setOperator('emp-001', 'Alice')
      useOrderStore
        .getState()
        .addItem({ id: 'com-1', name: 'Fried Rice', price: 100 })

      await useOrderStore.getState().submitOrder()

      expect(mockRepo.getNextOrderNumber).toHaveBeenCalled()
      expect(mockRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          number: 5,
          total: 100,
          originalTotal: 100,
          editor: 'emp-001',
        }),
      )
    })

    it('should convert items to OrderData format', async () => {
      const mockRepo = createMockOrderRepo()
      mockedGetOrderRepo.mockReturnValue(mockRepo)

      useOrderStore
        .getState()
        .addItem({ id: 'com-1', name: 'Fried Rice', price: 100 })

      await useOrderStore.getState().submitOrder()

      const createCall = vi.mocked(mockRepo.create).mock.calls[0]![0]
      expect(createCall.data).toEqual([
        { comID: 'com-1', value: 'Fried Rice', amount: '100' },
      ])
    })

    it('should add quantity OrderData for items with quantity > 1', async () => {
      const mockRepo = createMockOrderRepo()
      mockedGetOrderRepo.mockReturnValue(mockRepo)

      useOrderStore
        .getState()
        .addItem({ id: 'com-1', name: 'Fried Rice', price: 100 })
      // Add the same item again (quantity becomes 2)
      useOrderStore
        .getState()
        .addItem({ id: 'com-1', name: 'Fried Rice', price: 100 })

      await useOrderStore.getState().submitOrder()

      const createCall = vi.mocked(mockRepo.create).mock.calls[0]![0]
      expect(createCall.data).toEqual([
        { comID: 'com-1', value: 'Fried Rice', amount: '100' },
        { comID: 'com-1', res: 'qty', operator: '*', amount: '2' },
      ])
    })

    it('should collect non-empty notes into memo array', async () => {
      const mockRepo = createMockOrderRepo()
      mockedGetOrderRepo.mockReturnValue(mockRepo)

      useOrderStore
        .getState()
        .addItem({ id: 'com-1', name: 'Fried Rice', price: 100 })
      useOrderStore
        .getState()
        .addItem({ id: 'com-2', name: 'Noodles', price: 80 })
      const items = useOrderStore.getState().items
      useOrderStore.getState().updateNote(items[0]!.id, 'No egg')
      // Second item has no note (empty string)

      await useOrderStore.getState().submitOrder()

      const createCall = vi.mocked(mockRepo.create).mock.calls[0]![0]
      expect(createCall.memo).toEqual(['No egg'])
    })

    it('should use empty string as editor when no operator set', async () => {
      const mockRepo = createMockOrderRepo()
      mockedGetOrderRepo.mockReturnValue(mockRepo)

      useOrderStore
        .getState()
        .addItem({ id: 'com-1', name: 'Fried Rice', price: 100 })

      await useOrderStore.getState().submitOrder()

      const createCall = vi.mocked(mockRepo.create).mock.calls[0]![0]
      expect(createCall.editor).toBe('')
    })

    it('should set soups to 0', async () => {
      const mockRepo = createMockOrderRepo()
      mockedGetOrderRepo.mockReturnValue(mockRepo)

      useOrderStore
        .getState()
        .addItem({ id: 'com-1', name: 'Fried Rice', price: 100 })

      await useOrderStore.getState().submitOrder()

      const createCall = vi.mocked(mockRepo.create).mock.calls[0]![0]
      expect(createCall.soups).toBe(0)
    })

    it('should clear cart after successful submit', async () => {
      const mockRepo = createMockOrderRepo()
      mockedGetOrderRepo.mockReturnValue(mockRepo)

      useOrderStore
        .getState()
        .addItem({ id: 'com-1', name: 'Fried Rice', price: 100 })
      useOrderStore.getState().addDiscount('Discount', 10)

      await useOrderStore.getState().submitOrder()

      const state = useOrderStore.getState()
      expect(state.items).toEqual([])
      expect(state.discounts).toEqual([])
    })

    it('should NOT clear cart if submit fails', async () => {
      const mockRepo = createMockOrderRepo({
        create: vi.fn().mockRejectedValue(new Error('DB error')),
      })
      mockedGetOrderRepo.mockReturnValue(mockRepo)

      useOrderStore
        .getState()
        .addItem({ id: 'com-1', name: 'Fried Rice', price: 100 })

      await expect(useOrderStore.getState().submitOrder()).rejects.toThrow(
        'DB error',
      )

      // Cart should still have items
      expect(useOrderStore.getState().items).toHaveLength(1)
    })

    it('should handle multiple items with different quantities', async () => {
      const mockRepo = createMockOrderRepo()
      mockedGetOrderRepo.mockReturnValue(mockRepo)

      useOrderStore
        .getState()
        .addItem({ id: 'com-1', name: 'Fried Rice', price: 100 })
      useOrderStore
        .getState()
        .addItem({ id: 'com-2', name: 'Noodles', price: 80 })
      const items = useOrderStore.getState().items
      useOrderStore.getState().updateQuantity(items[0]!.id, 2)
      // com-2 stays at quantity 1

      await useOrderStore.getState().submitOrder()

      const createCall = vi.mocked(mockRepo.create).mock.calls[0]![0]
      expect(createCall.data).toEqual([
        { comID: 'com-1', value: 'Fried Rice', amount: '100' },
        { comID: 'com-1', res: 'qty', operator: '*', amount: '2' },
        { comID: 'com-2', value: 'Noodles', amount: '80' },
      ])
    })

    it('should pass correct total with discounts applied', async () => {
      const mockRepo = createMockOrderRepo()
      mockedGetOrderRepo.mockReturnValue(mockRepo)

      useOrderStore
        .getState()
        .addItem({ id: 'com-1', name: 'Fried Rice', price: 100 })
      useOrderStore.getState().addDiscount('Discount', 30)

      await useOrderStore.getState().submitOrder()

      const createCall = vi.mocked(mockRepo.create).mock.calls[0]![0]
      expect(createCall.total).toBe(70)
      expect(createCall.originalTotal).toBe(100)
    })

    it('should throw error when cart is empty', async () => {
      const mockRepo = createMockOrderRepo()
      mockedGetOrderRepo.mockReturnValue(mockRepo)

      await expect(useOrderStore.getState().submitOrder()).rejects.toThrow(
        'Cannot submit an empty order',
      )
      expect(mockRepo.create).not.toHaveBeenCalled()
    })

    it('should serialize discount entries into OrderData', async () => {
      const mockRepo = createMockOrderRepo()
      mockedGetOrderRepo.mockReturnValue(mockRepo)

      useOrderStore
        .getState()
        .addItem({ id: 'com-1', name: 'Bento', price: 100 })
      useOrderStore.getState().addDiscount('會員折扣', 50)

      await useOrderStore.getState().submitOrder()

      const createCall = vi.mocked(mockRepo.create).mock.calls[0]![0]
      const discountEntry = createCall.data.find(
        d => d.type === 'discount',
      )
      expect(discountEntry).toEqual({
        res: '會員折扣',
        type: 'discount',
        operator: '+',
        amount: '-50',
      })
    })
  })

  describe('addDiscount validation', () => {
    it('should ignore zero amount', () => {
      useOrderStore.getState().addDiscount('bad', 0)
      expect(useOrderStore.getState().discounts).toHaveLength(0)
    })

    it('should ignore negative amount', () => {
      useOrderStore.getState().addDiscount('bad', -50)
      expect(useOrderStore.getState().discounts).toHaveLength(0)
    })
  })
})
