/**
 * Mock for virtual:pwa-register used in tests.
 * The real module is provided by vite-plugin-pwa at build time.
 */
export function registerSW(_options?: {
  onNeedRefresh?: () => void
  onOfflineReady?: () => void
}): () => void {
  return () => {}
}
