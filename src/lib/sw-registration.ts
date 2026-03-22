/**
 * Service worker registration wrapper.
 * Uses vite-plugin-pwa's virtual module for SW lifecycle management.
 */
import { registerSW } from 'virtual:pwa-register'

export interface SwUpdateCallbacks {
  readonly onNeedRefresh: () => void
  readonly onOfflineReady: () => void
}

/**
 * Initialize service worker with lifecycle callbacks.
 * @returns A function that triggers the SW update when called.
 */
export function initServiceWorker(callbacks: SwUpdateCallbacks): () => void {
  const updateSW = registerSW({
    onNeedRefresh: callbacks.onNeedRefresh,
    onOfflineReady: callbacks.onOfflineReady,
  })
  return updateSW
}
