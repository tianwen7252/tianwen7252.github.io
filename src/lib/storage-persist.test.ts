import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  requestStoragePersistence,
  logStorageEstimate,
} from './storage-persist'

describe('requestStoragePersistence', () => {
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>
  let consoleInfoSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    // Mock navigator.storage since happy-dom may not have it
    Object.defineProperty(navigator, 'storage', {
      value: {
        persist: vi.fn(),
        persisted: vi.fn(),
        estimate: vi.fn(),
      },
      writable: true,
      configurable: true,
    })

    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns true when already persisted', async () => {
    vi.mocked(navigator.storage.persisted).mockResolvedValue(true)

    const result = await requestStoragePersistence()

    expect(result).toBe(true)
    // persist() should NOT be called when already persisted
    expect(navigator.storage.persist).not.toHaveBeenCalled()
  })

  it('logs info when already persisted', async () => {
    vi.mocked(navigator.storage.persisted).mockResolvedValue(true)

    await requestStoragePersistence()

    expect(consoleInfoSpy).toHaveBeenCalledWith('[Storage] Already persisted')
  })

  it('returns true when persist() grants permission', async () => {
    vi.mocked(navigator.storage.persisted).mockResolvedValue(false)
    vi.mocked(navigator.storage.persist).mockResolvedValue(true)

    const result = await requestStoragePersistence()

    expect(result).toBe(true)
  })

  it('logs info when granted', async () => {
    vi.mocked(navigator.storage.persisted).mockResolvedValue(false)
    vi.mocked(navigator.storage.persist).mockResolvedValue(true)

    await requestStoragePersistence()

    expect(consoleInfoSpy).toHaveBeenCalledWith('[Storage] Persistence granted')
  })

  it('returns false when persist() denies permission', async () => {
    vi.mocked(navigator.storage.persisted).mockResolvedValue(false)
    vi.mocked(navigator.storage.persist).mockResolvedValue(false)

    const result = await requestStoragePersistence()

    expect(result).toBe(false)
  })

  it('logs warning when denied', async () => {
    vi.mocked(navigator.storage.persisted).mockResolvedValue(false)
    vi.mocked(navigator.storage.persist).mockResolvedValue(false)

    await requestStoragePersistence()

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      '[Storage] Persistence denied — OPFS data may be evicted by the browser',
    )
  })

  it('returns false when Storage API not available', async () => {
    // Remove navigator.storage entirely
    Object.defineProperty(navigator, 'storage', {
      value: undefined,
      writable: true,
      configurable: true,
    })

    const result = await requestStoragePersistence()

    expect(result).toBe(false)
  })

  it('logs warning when API not available', async () => {
    Object.defineProperty(navigator, 'storage', {
      value: undefined,
      writable: true,
      configurable: true,
    })

    await requestStoragePersistence()

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      '[Storage] Persistence API not available',
    )
  })
})

describe('logStorageEstimate', () => {
  let consoleInfoSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    Object.defineProperty(navigator, 'storage', {
      value: {
        persist: vi.fn(),
        persisted: vi.fn(),
        estimate: vi.fn(),
      },
      writable: true,
      configurable: true,
    })

    consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('logs usage and quota in MB format', async () => {
    vi.mocked(navigator.storage.estimate).mockResolvedValue({
      usage: 5 * 1024 * 1024, // 5 MB
      quota: 100 * 1024 * 1024, // 100 MB
    })

    await logStorageEstimate()

    expect(consoleInfoSpy).toHaveBeenCalledWith(
      '[Storage] Used: 5.00 MB / Quota: 100.00 MB',
    )
  })

  it('handles missing estimate API gracefully', async () => {
    Object.defineProperty(navigator, 'storage', {
      value: undefined,
      writable: true,
      configurable: true,
    })

    // Should not throw
    await expect(logStorageEstimate()).resolves.toBeUndefined()
  })

  it('handles zero usage and quota', async () => {
    vi.mocked(navigator.storage.estimate).mockResolvedValue({
      usage: 0,
      quota: 0,
    })

    await logStorageEstimate()

    expect(consoleInfoSpy).toHaveBeenCalledWith(
      '[Storage] Used: 0.00 MB / Quota: 0.00 MB',
    )
  })

  it('handles undefined usage and quota fields', async () => {
    vi.mocked(navigator.storage.estimate).mockResolvedValue({})

    await logStorageEstimate()

    expect(consoleInfoSpy).toHaveBeenCalledWith(
      '[Storage] Used: 0.00 MB / Quota: 0.00 MB',
    )
  })
})
