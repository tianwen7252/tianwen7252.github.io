import { toast } from 'sonner'

/**
 * Custom hook providing toast notification methods.
 * Wraps sonner's toast function with typed success/error/info variants.
 *
 * Usage:
 *   const { success, error, info } = useToast()
 *   success('Operation completed')
 */
export function useToast() {
  return {
    success: (message: string) => toast.success(message),
    error: (message: string) => toast.error(message),
    info: (message: string) => toast.info(message),
  } as const
}
