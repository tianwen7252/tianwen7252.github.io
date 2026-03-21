import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockUpdateFn = vi.fn()
const mockRegisterSW = vi.fn(() => mockUpdateFn)

vi.mock('virtual:pwa-register', () => ({
  registerSW: mockRegisterSW,
}))

describe('initServiceWorker', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRegisterSW.mockReturnValue(mockUpdateFn)
  })

  it('should call registerSW with correct callbacks', async () => {
    const { initServiceWorker } = await import('./sw-registration')
    const callbacks = {
      onNeedRefresh: vi.fn(),
      onOfflineReady: vi.fn(),
    }

    initServiceWorker(callbacks)

    expect(mockRegisterSW).toHaveBeenCalledOnce()
    expect(mockRegisterSW).toHaveBeenCalledWith({
      onNeedRefresh: callbacks.onNeedRefresh,
      onOfflineReady: callbacks.onOfflineReady,
    })
  })

  it('should return the update function from registerSW', async () => {
    const { initServiceWorker } = await import('./sw-registration')
    const result = initServiceWorker({
      onNeedRefresh: vi.fn(),
      onOfflineReady: vi.fn(),
    })

    expect(result).toBe(mockUpdateFn)
  })

  it('should pass onNeedRefresh callback correctly', async () => {
    const { initServiceWorker } = await import('./sw-registration')
    const onNeedRefresh = vi.fn()

    initServiceWorker({ onNeedRefresh, onOfflineReady: vi.fn() })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const passedOptions = (mockRegisterSW.mock.calls as any)[0][0]
    expect(passedOptions.onNeedRefresh).toBe(onNeedRefresh)
  })

  it('should pass onOfflineReady callback correctly', async () => {
    const { initServiceWorker } = await import('./sw-registration')
    const onOfflineReady = vi.fn()

    initServiceWorker({ onNeedRefresh: vi.fn(), onOfflineReady })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const passedOptions = (mockRegisterSW.mock.calls as any)[0][0]
    expect(passedOptions.onOfflineReady).toBe(onOfflineReady)
  })
})
