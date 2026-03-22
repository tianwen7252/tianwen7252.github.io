/**
 * API provider factory and singleton.
 * Creates the appropriate backend implementation based on configuration.
 * Currently only 'mock' is implemented; 'sqlite' is planned for future.
 */

import { createMockApiProvider } from './mock'
import type { ApiProvider } from './types'

export function createApiProvider(
  backend: 'mock' | 'sqlite' = 'mock',
): ApiProvider {
  if (backend === 'sqlite') {
    console.warn('SQLite backend not yet implemented, falling back to mock')
    return createMockApiProvider()
  }
  return createMockApiProvider()
}

const _provider = createMockApiProvider()

/** Production API singleton — typed without reset(). */
export const api: ApiProvider = _provider

/**
 * Reset all mock data to initial state.
 * Only works with mock backend. Use in test beforeEach/afterEach.
 */
export function resetApi(): void {
  _provider.reset()
}
