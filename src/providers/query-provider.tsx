import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const DEFAULT_STALE_TIME = 5 * 60 * 1000 // 5 minutes

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: DEFAULT_STALE_TIME,
            retry: 1,
          },
        },
      }),
  )

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
