import { describe, it, expect, beforeEach } from 'vitest'
import { useAppStore } from './app-store'

describe('useAppStore', () => {
  beforeEach(() => {
    useAppStore.setState({
      currentEmployeeId: null,
      isAdmin: false,
    })
  })

  it('should have initial state', () => {
    const state = useAppStore.getState()
    expect(state.currentEmployeeId).toBeNull()
    expect(state.isAdmin).toBe(false)
  })

  it('should set current employee', () => {
    useAppStore.getState().setCurrentEmployee('emp-001', true)
    const state = useAppStore.getState()
    expect(state.currentEmployeeId).toBe('emp-001')
    expect(state.isAdmin).toBe(true)
  })

  it('should logout', () => {
    useAppStore.getState().setCurrentEmployee('emp-001', true)
    useAppStore.getState().logout()
    const state = useAppStore.getState()
    expect(state.currentEmployeeId).toBeNull()
    expect(state.isAdmin).toBe(false)
  })

  it('should set non-admin employee', () => {
    useAppStore.getState().setCurrentEmployee('emp-002', false)
    const state = useAppStore.getState()
    expect(state.currentEmployeeId).toBe('emp-002')
    expect(state.isAdmin).toBe(false)
  })
})
