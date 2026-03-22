import { Button } from '@/components/ui/button'

export interface ErrorFallbackProps {
  error: unknown
  resetErrorBoundary: (...args: unknown[]) => void
  title?: string
}

/**
 * Extract a displayable message from an unknown thrown value.
 */
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message || '未知錯誤'
  }
  if (typeof error === 'string') {
    return error || '未知錯誤'
  }
  return '未知錯誤'
}

/**
 * Fallback UI displayed when an ErrorBoundary catches an error.
 * Shows error title, message, and a retry button.
 */
export function ErrorFallback({
  error,
  resetErrorBoundary,
  title = '發生錯誤',
}: ErrorFallbackProps) {
  return (
    <div
      className="flex min-h-[200px] flex-col items-center justify-center gap-4 p-6 text-center"
      role="alert"
    >
      <h2 className="text-lg font-semibold text-destructive">{title}</h2>
      <p className="max-w-md text-sm text-muted-foreground">
        {getErrorMessage(error)}
      </p>
      <Button variant="outline" onClick={resetErrorBoundary}>
        重試
      </Button>
    </div>
  )
}
