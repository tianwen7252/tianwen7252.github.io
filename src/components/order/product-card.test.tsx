import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProductCard } from './product-card'
import type { Commondity } from '@/lib/schemas'

/** Factory to create mock Commondity objects */
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

describe('ProductCard', () => {
  const defaultCommodity = makeCommodity()

  it('should render the product name', () => {
    render(<ProductCard commodity={defaultCommodity} onAdd={vi.fn()} />)
    expect(screen.getByText('滷肉便當')).toBeTruthy()
  })

  it('should render the price in $xxx format', () => {
    render(<ProductCard commodity={defaultCommodity} onAdd={vi.fn()} />)
    expect(screen.getByText('$100')).toBeTruthy()
  })

  it('should render the product image when image path is provided', () => {
    render(<ProductCard commodity={defaultCommodity} onAdd={vi.fn()} />)
    const img = screen.getByRole('img', { name: '滷肉便當' })
    expect(img).toBeTruthy()
    expect(img.getAttribute('src')).toBe('/images/braised-pork.png')
  })

  it('should not render an img element when image is undefined', () => {
    const noImageCommodity = makeCommodity({ image: undefined })
    render(<ProductCard commodity={noImageCommodity} onAdd={vi.fn()} />)
    expect(screen.queryByRole('img')).toBeNull()
  })

  it('should call onAdd with correct commodity data when clicked', async () => {
    const onAdd = vi.fn()
    const user = userEvent.setup()
    render(<ProductCard commodity={defaultCommodity} onAdd={onAdd} />)
    await user.click(screen.getByRole('button'))
    expect(onAdd).toHaveBeenCalledWith({
      id: 'com-1',
      name: '滷肉便當',
      price: 100,
    })
    expect(onAdd).toHaveBeenCalledTimes(1)
  })

  it('should be rendered as a button for full-card clickability', () => {
    render(<ProductCard commodity={defaultCommodity} onAdd={vi.fn()} />)
    expect(screen.getByRole('button')).toBeTruthy()
  })

  it('should render different prices correctly', () => {
    const expensiveItem = makeCommodity({ price: 250 })
    render(<ProductCard commodity={expensiveItem} onAdd={vi.fn()} />)
    expect(screen.getByText('$250')).toBeTruthy()
  })

  it('should render zero price as $0', () => {
    const freeItem = makeCommodity({ price: 0 })
    render(<ProductCard commodity={freeItem} onAdd={vi.fn()} />)
    expect(screen.getByText('$0')).toBeTruthy()
  })

  it('should render special characters in product name', () => {
    const specialName = makeCommodity({ name: '紅燒雞腿便當 (大)' })
    render(<ProductCard commodity={specialName} onAdd={vi.fn()} />)
    expect(screen.getByText('紅燒雞腿便當 (大)')).toBeTruthy()
  })

  it('should not call onAdd without user interaction', () => {
    const onAdd = vi.fn()
    render(<ProductCard commodity={defaultCommodity} onAdd={onAdd} />)
    expect(onAdd).not.toHaveBeenCalled()
  })
})
