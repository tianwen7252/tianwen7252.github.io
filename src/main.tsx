import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'
import { QueryProvider } from './providers/query-provider'
import { Toaster } from '@/components/ui/sonner'
import {
  requestStoragePersistence,
  logStorageEstimate,
} from '@/lib/storage-persist'
import { DEFAULT_CONFIG } from '@/lib/database'
import { sqliteWasmFactory } from '@/lib/sqlite-wasm'
import { initSchema } from '@/lib/schema'
import { initRepositories } from '@/lib/repositories'
import { seedDatabase } from '@/lib/seed-data'

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

// Initialize SQLite WASM database, then render the app
async function bootstrap() {
  // Try OPFS first, fall back to in-memory if OPFS is unavailable
  let db: Awaited<ReturnType<typeof sqliteWasmFactory.init>>
  try {
    db = await sqliteWasmFactory.init(DEFAULT_CONFIG)
  } catch {
    console.warn('[DB] OPFS unavailable, falling back to in-memory mode')
    db = await sqliteWasmFactory.init({ filename: ':memory:', mode: 'memory' })
  }
  initSchema(sql => db.exec(sql))
  initRepositories(db)

  // Seed with sample data if employees table is empty
  const { rows } = db.exec<{ cnt: number }>(
    'SELECT COUNT(*) as cnt FROM employees',
  )
  if (rows[0]?.cnt === 0) {
    seedDatabase(db)
  }

  createRoot(rootElement).render(
    <StrictMode>
      <QueryProvider>
        <RouterProvider router={router} />
        <Toaster />
      </QueryProvider>
    </StrictMode>,
  )
}

bootstrap().catch(err => {
  rootElement.textContent = `Failed to initialize database: ${err instanceof Error ? err.message : String(err)}`
})
