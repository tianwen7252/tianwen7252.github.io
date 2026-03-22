import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'

// Mock the sonner toast function — vi.hoisted ensures mockToast is
// available when vi.mock factory (which is hoisted) executes.
const mockToast = vi.hoisted(() => ({
  success: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
}))

vi.mock('sonner', () => ({
  toast: mockToast,
}))

describe('useToast', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return success, error, and info methods', async () => {
    const { useToast } = await import('./use-toast')
    const { result } = renderHook(() => useToast())

    expect(typeof result.current.success).toBe('function')
    expect(typeof result.current.error).toBe('function')
    expect(typeof result.current.info).toBe('function')
  })

  it('should call toast.success with the provided message', async () => {
    const { useToast } = await import('./use-toast')
    const { result } = renderHook(() => useToast())

    result.current.success('Operation successful')

    expect(mockToast.success).toHaveBeenCalledOnce()
    expect(mockToast.success).toHaveBeenCalledWith('Operation successful')
  })

  it('should call toast.error with the provided message', async () => {
    const { useToast } = await import('./use-toast')
    const { result } = renderHook(() => useToast())

    result.current.error('Something went wrong')

    expect(mockToast.error).toHaveBeenCalledOnce()
    expect(mockToast.error).toHaveBeenCalledWith('Something went wrong')
  })

  it('should call toast.info with the provided message', async () => {
    const { useToast } = await import('./use-toast')
    const { result } = renderHook(() => useToast())

    result.current.info('Here is some information')

    expect(mockToast.info).toHaveBeenCalledOnce()
    expect(mockToast.info).toHaveBeenCalledWith('Here is some information')
  })

  it('should handle empty string messages', async () => {
    const { useToast } = await import('./use-toast')
    const { result } = renderHook(() => useToast())

    result.current.success('')
    result.current.error('')
    result.current.info('')

    expect(mockToast.success).toHaveBeenCalledWith('')
    expect(mockToast.error).toHaveBeenCalledWith('')
    expect(mockToast.info).toHaveBeenCalledWith('')
  })

  it('should handle messages with special characters', async () => {
    const { useToast } = await import('./use-toast')
    const { result } = renderHook(() => useToast())

    const specialMessage = '員工已新增 (ID: #123) <script>alert("xss")</script>'
    result.current.success(specialMessage)

    expect(mockToast.success).toHaveBeenCalledWith(specialMessage)
  })

  it('should handle Traditional Chinese messages', async () => {
    const { useToast } = await import('./use-toast')
    const { result } = renderHook(() => useToast())

    result.current.success('員工已新增')
    result.current.error('操作失敗')
    result.current.info('請確認資料')

    expect(mockToast.success).toHaveBeenCalledWith('員工已新增')
    expect(mockToast.error).toHaveBeenCalledWith('操作失敗')
    expect(mockToast.info).toHaveBeenCalledWith('請確認資料')
  })
})
