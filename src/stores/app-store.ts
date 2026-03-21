import { create } from 'zustand'

/**
 * Global app store — UI state that doesn't belong to a specific feature.
 * Feature-specific state (employees, orders, etc.) should use
 * separate stores or TanStack Query.
 */
interface AppState {
  /** Currently authenticated employee ID (null = not logged in) */
  readonly currentEmployeeId: string | null
  /** Whether the app is in admin mode */
  readonly isAdmin: boolean
}

interface AppActions {
  setCurrentEmployee: (employeeId: string | null, isAdmin: boolean) => void
  logout: () => void
}

export const useAppStore = create<AppState & AppActions>(set => ({
  currentEmployeeId: null,
  isAdmin: false,

  setCurrentEmployee: (employeeId, isAdmin) =>
    set({ currentEmployeeId: employeeId, isAdmin }),

  logout: () => set({ currentEmployeeId: null, isAdmin: false }),
}))
