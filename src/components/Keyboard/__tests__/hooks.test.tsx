import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useNumberInput } from '../hooks'

describe('useNumberInput Hook', () => {
  const mockCommData = {
    '1': [
      { name: 'Item 1', price: 100 },
      { name: 'Item 2', price: 200 },
    ],
  }

  it('initializes with empty state', () => {
    const { result } = renderHook(() => useNumberInput(mockCommData))

    expect(result.current.data).toEqual([])
    expect(result.current.total).toBe(0)
    expect(result.current.priceMap).toEqual({})
  })

  it('handles number input correctly', () => {
    const { result } = renderHook(() => useNumberInput(mockCommData))

    act(() => {
      result.current.input('+100', 'Item 1')
    })

    expect(result.current.total).toBe(100)
    expect(result.current.data).toHaveLength(1)
    expect(result.current.data[0]).toEqual({
      value: '100',
      res: 'Item 1',
    })
  })

  it('handles clear operation', () => {
    const { result } = renderHook(() => useNumberInput(mockCommData))

    act(() => {
      result.current.input('+100', 'Item 1')
      result.current.clear()
    })

    expect(result.current.total).toBe(0)
    expect(result.current.data).toHaveLength(0)
  })

  it('handles update operation', () => {
    const { result } = renderHook(() => useNumberInput(mockCommData))

    const mockData = [
      {
        value: '100',
        res: 'Item 1',
      },
    ]

    act(() => {
      result.current.update(mockData, 100)
    })

    expect(result.current.total).toBe(100)
    expect(result.current.data).toEqual(mockData)
  })

  it('handles updateItemRes operation', () => {
    const { result } = renderHook(() => useNumberInput(mockCommData))

    act(() => {
      result.current.input('+100', 'Item 1')
      result.current.updateItemRes('+100|Item 2', result.current.data[0])
    })

    expect(result.current.data[0].res).toBe('Item 2')
  })
})
