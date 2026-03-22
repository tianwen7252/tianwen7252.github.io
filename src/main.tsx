import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'
import { QueryProvider } from './providers/query-provider'
import { Toaster } from '@/components/ui/sonner'
import {
  requestStoragePersistence,
  logStorageEstimate,
} from '@/lib/storage-persist'

// Initialize i18n before rendering (side-effect import)
import './lib/i18n'

import './styles/globals.css'
import { router } from './routes/router'

// Request persistent storage for OPFS protection (fire-and-forget)
requestStoragePersistence()

if (import.meta.env.DEV) {
  logStorageEstimate()
}

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Root element not found')
}

createRoot(rootElement).render(
  <StrictMode>
    <QueryProvider>
      <RouterProvider router={router} />
      <Toaster />
    </QueryProvider>
  </StrictMode>,
)
