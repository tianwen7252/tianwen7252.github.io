/**
 * Request persistent storage to prevent iOS from evicting OPFS data.
 * iOS Safari may evict origin data after ~7 days of inactivity without this.
 * Critical for SQLite WASM OPFS persistence.
 *
 * @returns true if persistence was granted, false if denied or unavailable
 */
export async function requestStoragePersistence(): Promise<boolean> {
  if (!navigator.storage?.persist) {
    console.warn('[Storage] Persistence API not available')
    return false
  }

  const alreadyPersisted = await navigator.storage.persisted()
  if (alreadyPersisted) {
    console.info('[Storage] Already persisted')
    return true
  }

  const granted = await navigator.storage.persist()
  if (granted) {
    console.info('[Storage] Persistence granted')
  } else {
    console.warn(
      '[Storage] Persistence denied — OPFS data may be evicted by the browser',
    )
  }

  return granted
}

/**
 * Log current storage usage for debugging.
 */
export async function logStorageEstimate(): Promise<void> {
  if (!navigator.storage?.estimate) return

  const estimate = await navigator.storage.estimate()
  const usedMB = ((estimate.usage ?? 0) / (1024 * 1024)).toFixed(2)
  const quotaMB = ((estimate.quota ?? 0) / (1024 * 1024)).toFixed(2)
  console.info(`[Storage] Used: ${usedMB} MB / Quota: ${quotaMB} MB`)
}
