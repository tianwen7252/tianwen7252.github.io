import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSwUpdate } from './use-sw-update'
import type { SwUpdateCallbacks } from '@/lib/sw-registration'

const mockUpdateSW = vi.fn()
let mockCallbacks: SwUpdateCallbacks

vi.mock('@/lib/sw-registration', () => ({
  initServiceWorker: vi.fn((callbacks: SwUpdateCallbacks) => {
    mockCallbacks = callbacks
    return mockUpdateSW
  }),
}))

describe('useSwUpdate', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should have initial state with needRefresh=false and offlineReady=false', () => {
    const { result } = renderHook(() => useSwUpdate())

    expect(result.current.needRefresh).toBe(false)
    expect(result.current.offlineReady).toBe(false)
  })

  it('should set needRefresh to true when onNeedRefresh fires', () => {
    const { result } = renderHook(() => useSwUpdate())

    act(() => {
      mockCallbacks.onNeedRefresh()
    })

    expect(result.current.needRefresh).toBe(true)
  })

  it('should set offlineReady to true when onOfflineReady fires', () => {
    const { result } = renderHook(() => useSwUpdate())

    act(() => {
      mockCallbacks.onOfflineReady()
    })

    expect(result.current.offlineReady).toBe(true)
  })

  it('should call the update function when updateApp is invoked', () => {
    const { result } = renderHook(() => useSwUpdate())

    act(() => {
      result.current.updateApp()
    })

    expect(mockUpdateSW).toHaveBeenCalledOnce()
  })

  it('should reset both states when dismissPrompt is called', () => {
    const { result } = renderHook(() => useSwUpdate())

    // First, trigger both states
    act(() => {
      mockCallbacks.onNeedRefresh()
      mockCallbacks.onOfflineReady()
    })

    expect(result.current.needRefresh).toBe(true)
    expect(result.current.offlineReady).toBe(true)

    // Then dismiss
    act(() => {
      result.current.dismissPrompt()
    })

    expect(result.current.needRefresh).toBe(false)
    expect(result.current.offlineReady).toBe(false)
  })
})
