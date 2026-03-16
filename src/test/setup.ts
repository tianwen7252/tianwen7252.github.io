import 'fake-indexeddb/auto'
import 'src/libs/dayjs'
import dayjs from 'dayjs'
import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

// Set default timezone for consistent test results across environments
dayjs.tz.setDefault('Asia/Taipei')

// Mock matchMedia for antd components that depend on window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock IntersectionObserver for components using StickyHeader or observation hooks
class IntersectionObserverMock {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
}
vi.stubGlobal('IntersectionObserver', IntersectionObserverMock)

afterEach(() => {
  cleanup()
})
