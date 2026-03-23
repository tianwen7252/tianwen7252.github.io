import { describe, it, expect } from 'vitest'
import zhTW from './zh-TW.json'
import en from './en.json'

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('i18n translations', () => {
  describe('zh-TW order translations', () => {
    it('should have order namespace', () => {
      expect(zhTW.order).toBeDefined()
    })

    it('should have order.title', () => {
      expect(zhTW.order.title).toBe('點餐')
    })

    it('should have order.currentOrder', () => {
      expect(zhTW.order.currentOrder).toBe('目前訂單')
    })

    it('should have order.emptyOrder', () => {
      expect(zhTW.order.emptyOrder).toBe('尚無訂單項目')
    })

    it('should have order.subtotal', () => {
      expect(zhTW.order.subtotal).toBe('小計')
    })

    it('should have order.discount', () => {
      expect(zhTW.order.discount).toBe('折扣優惠')
    })

    it('should have order.discountHint', () => {
      expect(zhTW.order.discountHint).toBe('可多選')
    })

    it('should have order.total', () => {
      expect(zhTW.order.total).toBe('總金額')
    })

    it('should have order.submit', () => {
      expect(zhTW.order.submit).toBe('提交訂單')
    })

    it('should have order.submitSuccess', () => {
      expect(zhTW.order.submitSuccess).toBe('訂單已送出')
    })

    it('should have order.submitError', () => {
      expect(zhTW.order.submitError).toBe('訂單送出失敗')
    })

    it('should have order.loading', () => {
      expect(zhTW.order.loading).toBe('載入中...')
    })

    it('should have order.loadError', () => {
      expect(zhTW.order.loadError).toBe('載入商品失敗，請重試')
    })

    it('should have order.noProducts', () => {
      expect(zhTW.order.noProducts).toBe('目前沒有商品')
    })
  })

  describe('en order translations', () => {
    it('should have order namespace', () => {
      expect(en.order).toBeDefined()
    })

    it('should have order.title', () => {
      expect(en.order.title).toBe('Order')
    })

    it('should have order.currentOrder', () => {
      expect(en.order.currentOrder).toBe('Current Order')
    })

    it('should have order.emptyOrder', () => {
      expect(en.order.emptyOrder).toBe('No items in order')
    })

    it('should have order.subtotal', () => {
      expect(en.order.subtotal).toBe('Subtotal')
    })

    it('should have order.discount', () => {
      expect(en.order.discount).toBe('Discounts')
    })

    it('should have order.discountHint', () => {
      expect(en.order.discountHint).toBe('Multiple allowed')
    })

    it('should have order.total', () => {
      expect(en.order.total).toBe('Total')
    })

    it('should have order.submit', () => {
      expect(en.order.submit).toBe('Submit Order')
    })

    it('should have order.submitSuccess', () => {
      expect(en.order.submitSuccess).toBe('Order submitted')
    })

    it('should have order.submitError', () => {
      expect(en.order.submitError).toBe('Failed to submit order')
    })

    it('should have order.loading', () => {
      expect(en.order.loading).toBe('Loading...')
    })

    it('should have order.loadError', () => {
      expect(en.order.loadError).toBe('Failed to load products')
    })

    it('should have order.noProducts', () => {
      expect(en.order.noProducts).toBe('No products available')
    })
  })

  describe('translation key parity', () => {
    it('should have the same order keys in both locales', () => {
      const zhKeys = Object.keys(zhTW.order).sort()
      const enKeys = Object.keys(en.order).sort()
      expect(zhKeys).toEqual(enKeys)
    })
  })
})
