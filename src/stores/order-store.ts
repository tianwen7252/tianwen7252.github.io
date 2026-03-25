import { create } from 'zustand'
import { nanoid } from 'nanoid'
import { getOrderRepo } from '@/lib/repositories/provider'
import type { OrderData } from '@/lib/schemas'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CartItem {
  /** Unique cart item id (nanoid) */
  readonly id: string
  /** Reference to commodity */
  readonly commodityId: string
  /** Category type identifier (e.g., "bento", "drink") */
  readonly typeId: string
  /** Product name (for display) */
  readonly name: string
  /** Unit price */
  readonly price: number
  /** Quantity (>= 1) */
  readonly quantity: number
  /** Customer note (e.g., "不加蛋") */
  readonly note: string
  /** True when the bento includes a soup/congee (rice-based bentos only) */
  readonly includesSoup: boolean
}

export interface Discount {
  /** Unique discount id */
  readonly id: string
  /** Display label (e.g., "會員折扣") */
  readonly label: string
  /** Positive value (e.g., 50 means -$50) */
  readonly amount: number
}

interface OrderState {
  /** Currently selected operator employee id */
  readonly operatorId: string | null
  /** Currently selected operator display name */
  readonly operatorName: string | null
  /** Cart items (immutable array) */
  readonly items: readonly CartItem[]
  /** Applied discounts (immutable array) */
  readonly discounts: readonly Discount[]
  /** Last added/updated cart item — [id, seq] where seq increments to trigger scroll */
  readonly lastAddedItem: readonly [string, number] | null
}

interface OrderActions {
  setOperator: (employeeId: string | null, name: string | null) => void
  addItem: (commodity: { id: string; name: string; price: number; typeId: string; includesSoup: boolean }) => void
  removeItem: (cartItemId: string) => void
  updateQuantity: (cartItemId: string, quantity: number) => void
  updateNote: (cartItemId: string, note: string) => void
  addDiscount: (label: string, amount: number) => void
  removeDiscount: (discountId: string) => void
  clearCart: () => void
  submitOrder: (memoTags?: string[]) => Promise<void>
  getSubtotal: () => number
  getTotalDiscount: () => number
  getTotal: () => number
  getItemCount: () => number
  getBentoCount: () => number
  getSoupCount: () => number
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useOrderStore = create<OrderState & OrderActions>((set, get) => ({
  operatorId: null,
  operatorName: null,
  items: [],
  discounts: [],
  lastAddedItem: null,

  setOperator: (employeeId, name) =>
    set({ operatorId: employeeId, operatorName: name }),

  addItem: (commodity) =>
    set(state => {
      const existing = state.items.find(
        item => item.commodityId === commodity.id,
      )
      if (existing) {
        // Increment quantity for duplicate commodity (immutable map)
        return {
          items: state.items.map(item =>
            item.id === existing.id
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          ),
          lastAddedItem: [existing.id, (state.lastAddedItem?.[1] ?? 0) + 1] as const,
        }
      }
      // Add new cart item
      const newItem: CartItem = {
        id: nanoid(),
        commodityId: commodity.id,
        typeId: commodity.typeId,
        name: commodity.name,
        price: commodity.price,
        quantity: 1,
        note: '',
        includesSoup: commodity.includesSoup,
      }
      return { items: [...state.items, newItem], lastAddedItem: [newItem.id, (state.lastAddedItem?.[1] ?? 0) + 1] as const }
    }),

  removeItem: (cartItemId) =>
    set(state => ({
      items: state.items.filter(item => item.id !== cartItemId),
    })),

  updateQuantity: (cartItemId, quantity) =>
    set(state => {
      if (quantity <= 0) {
        return { items: state.items.filter(item => item.id !== cartItemId) }
      }
      return {
        items: state.items.map(item =>
          item.id === cartItemId ? { ...item, quantity } : item,
        ),
      }
    }),

  updateNote: (cartItemId, note) =>
    set(state => ({
      items: state.items.map(item =>
        item.id === cartItemId ? { ...item, note } : item,
      ),
    })),

  addDiscount: (label, amount) => {
    if (amount <= 0) return
    set(state => ({
      discounts: [
        ...state.discounts,
        { id: nanoid(), label, amount },
      ],
    }))
  },

  removeDiscount: (discountId) =>
    set(state => ({
      discounts: state.discounts.filter(d => d.id !== discountId),
    })),

  clearCart: () => set({ items: [], discounts: [] }),

  submitOrder: async (memoTags) => {
    const { items, discounts, operatorId, getSubtotal, getTotal, getSoupCount } = get()

    // Guard against empty cart
    if (items.length === 0) {
      throw new Error('Cannot submit an empty order')
    }

    const subtotal = getSubtotal()
    const total = getTotal()

    const repo = getOrderRepo()
    const number = await repo.getNextOrderNumber()

    // Convert cart items to OrderData format
    const orderData: OrderData[] = []
    for (const item of items) {
      orderData.push({
        comID: item.commodityId,
        value: item.name,
        amount: String(item.price),
      })
      if (item.quantity > 1) {
        orderData.push({
          comID: item.commodityId,
          res: 'qty',
          operator: '*',
          amount: String(item.quantity),
        })
      }
    }

    // Serialize discount entries into OrderData
    for (const discount of discounts) {
      orderData.push({
        res: discount.label,
        type: 'discount',
        operator: '+',
        amount: String(-discount.amount),
      })
    }

    // Collect non-empty notes, prepended by memoTags
    const itemNotes = items
      .map(item => item.note)
      .filter(note => note !== '')
    const memo = [...(memoTags ?? []), ...itemNotes]

    await repo.create({
      number,
      data: orderData,
      memo,
      soups: getSoupCount(),
      total,
      originalTotal: subtotal,
      editor: operatorId ?? '',
    })

    // Clear cart after successful submit
    get().clearCart()
  },

  getSubtotal: () => {
    const { items } = get()
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  },

  getTotalDiscount: () => {
    const { discounts } = get()
    return discounts.reduce((sum, d) => sum + d.amount, 0)
  },

  getTotal: () => {
    const subtotal = get().getSubtotal()
    const totalDiscount = get().getTotalDiscount()
    return Math.max(0, subtotal - totalDiscount)
  },

  getItemCount: () => {
    const { items } = get()
    return items.reduce((sum, item) => sum + item.quantity, 0)
  },

  getBentoCount: () => {
    // Only bentos with includesSoup=true qualify — these are the rice-based bentos.
    // Add-ons (加蛋, 加菜) and non-rice bentos (雞胸肉沙拉) have includesSoup=false
    // and are excluded because they don't include a soup bowl.
    const { items } = get()
    return items
      .filter(item => item.includesSoup)
      .reduce((sum, item) => sum + item.quantity, 0)
  },

  // Kept separate from getBentoCount to allow future decoupling
  // (e.g., half soups for small bentos, or soup-free promos).
  getSoupCount: () => {
    return get().getBentoCount()
  },
}))
