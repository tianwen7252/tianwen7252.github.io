import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// Initialize i18n for all tests (default: zh-TW)
import '@/lib/i18n'

// Auto-cleanup after each test
afterEach(() => {
  cleanup()
})
