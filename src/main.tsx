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
  const worker = new Worker(
    new URL('./lib/db-worker.ts', import.meta.url),
    { type: 'module' },
  )

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
