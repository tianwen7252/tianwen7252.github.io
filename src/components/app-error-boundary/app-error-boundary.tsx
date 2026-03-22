import type { ErrorInfo } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { ErrorFallback } from '@/components/error-fallback'

interface AppErrorBoundaryProps {
  children: React.ReactNode
  title?: string
  onReset?: () => void
}

/**
 * Log error details to console. Extensible for future Sentry integration.
 */
function logError(error: unknown, info: ErrorInfo) {
  console.error('[ErrorBoundary]', error)
  if (info.componentStack) {
    console.error('[ErrorBoundary] Component stack:', info.componentStack)
  }
}

/**
 * Application-level error boundary wrapper.
 * Catches rendering errors in child components and displays a fallback UI.
 *
 * Usage:
 * - Global: wrap the root layout to catch any uncaught errors
 * - Module-level: wrap individual pages/sections for granular recovery
 */
export function AppErrorBoundary({
  children,
  title,
  onReset,
}: AppErrorBoundaryProps) {
  return (
    <ErrorBoundary
      FallbackComponent={(props) => <ErrorFallback {...props} title={title} />}
      onError={logError}
      onReset={onReset}
    >
      {children}
    </ErrorBoundary>
  )
}
