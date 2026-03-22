/**
 * Hook for service worker update state management.
 * Tracks whether a new version is available and provides update/dismiss actions.
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { initServiceWorker } from '@/lib/sw-registration'

export function useSwUpdate() {
  const [needRefresh, setNeedRefresh] = useState(false)
  const [offlineReady, setOfflineReady] = useState(false)
  const updateSwRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    const updateSW = initServiceWorker({
      onNeedRefresh: () => setNeedRefresh(true),
      onOfflineReady: () => setOfflineReady(true),
    })
    updateSwRef.current = updateSW
  }, [])

  const updateApp = useCallback(() => {
    updateSwRef.current?.()
  }, [])

  const dismissPrompt = useCallback(() => {
    setNeedRefresh(false)
    setOfflineReady(false)
  }, [])

  return { needRefresh, offlineReady, updateApp, dismissPrompt }
}
