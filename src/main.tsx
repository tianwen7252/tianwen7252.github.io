import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'
import { QueryProvider } from './providers/query-provider'
import { Toaster } from '@/components/ui/sonner'
import {
  requestStoragePersistence,
  logStorageEstimate,
} from '@/lib/storage-persist'
import { ENABLE_SEED_DATA, DELETE_SEED_DATA } from '@/lib/db-config'
import {
  createWorkerDatabase,
  initWorkerDb,
  waitForWorkerReady,
} from '@/lib/worker-database'
import { initRepositories } from '@/lib/repositories'

// Initialize i18n before rendering (side-effect import)
import './lib/i18n'

// Prevent pinch-to-zoom on iPad (Safari ignores viewport meta for gestures)
document.addEventListener('gesturestart', (e) => e.preventDefault())
document.addEventListener('gesturechange', (e) => e.preventDefault())
document.addEventListener('gestureend', (e) => e.preventDefault())

// Prevent double-tap zoom
// comment this out since it prevents the button from being clicked repeatedly.
// document.addEventListener(
//   'touchend',
//   (e) => {
//     if (e.touches.length > 0) return
//     const now = Date.now()
//     const DOUBLE_TAP_THRESHOLD = 300
//     const lastTouch = (document as unknown as Record<string, number>)
//       .__lastTouchEnd ?? 0
//     if (now - lastTouch < DOUBLE_TAP_THRESHOLD) {
//       e.preventDefault()
//     }
//     ;(document as unknown as Record<string, number>).__lastTouchEnd = now
//   },
//   { passive: false },
// )

import './styles/globals.css'
import { router } from './routes/router'

// Request persistent storage for OPFS protection (fire-and-forget)
requestStoragePersistence()

if (import.meta.env.DEV) {
  logStorageEstimate()
}

const rootElement = document.getElementById('root')!

// Initialize SQLite WASM database via Web Worker, then render the app
async function bootstrap() {
  const worker = new Worker(new URL('./lib/db-worker.ts', import.meta.url), {
    type: 'module',
  })

  await waitForWorkerReady(worker)
  await initWorkerDb(worker, ENABLE_SEED_DATA, DELETE_SEED_DATA)

  const db = createWorkerDatabase(worker)
  initRepositories(db)

  createRoot(rootElement).render(
    <StrictMode>
      <QueryProvider>
        <RouterProvider router={router} />
        <Toaster />
      </QueryProvider>
    </StrictMode>,
  )
}

bootstrap().catch((err) => {
  rootElement.textContent = `Failed to initialize database: ${err instanceof Error ? err.message : String(err)}`
})
