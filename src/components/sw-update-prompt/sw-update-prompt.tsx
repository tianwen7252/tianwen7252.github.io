/**
 * Toast-style banner for service worker update notifications.
 * Shows "有新版本可用" with update/dismiss buttons when a new SW is waiting.
 * Shows "已可離線使用" briefly when precaching completes.
 */

import { useEffect } from 'react'
import { useSwUpdate } from '@/hooks/use-sw-update'

export function SwUpdatePrompt() {
  const { needRefresh, offlineReady, updateApp, dismissPrompt } = useSwUpdate()

  // Auto-dismiss offline-ready message after 5 seconds
  useEffect(() => {
    if (offlineReady) {
      const timer = setTimeout(dismissPrompt, 5000)
      return () => clearTimeout(timer)
    }
  }, [offlineReady, dismissPrompt])

  if (!needRefresh && !offlineReady) return null

  return (
    <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-border bg-card px-6 py-3 shadow-lg">
      {needRefresh && (
        <div className="flex items-center gap-4">
          <span className="text-sm">有新版本可用</span>
          <button
            type="button"
            className="rounded-lg bg-primary px-3 py-1 text-sm font-semibold text-primary-foreground"
            onClick={updateApp}
          >
            更新
          </button>
          <button
            type="button"
            className="text-sm text-muted-foreground hover:text-foreground"
            onClick={dismissPrompt}
          >
            稍後
          </button>
        </div>
      )}
      {offlineReady && !needRefresh && (
        <span className="text-sm text-muted-foreground">已可離線使用</span>
      )}
    </div>
  )
}
