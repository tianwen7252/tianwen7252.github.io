/**
 * Tests for the API provider factory and singleton.
 * Verifies createApiProvider returns correct backends
 * and the api singleton is properly initialized.
 */

import { describe, it, expect, vi } from 'vitest'
import { createApiProvider, api, resetApi } from './provider'
import type { ApiProvider } from './types'

describe('createApiProvider', () => {
  it('defaults to mock backend when no argument provided', () => {
    const provider = createApiProvider()
    expect(provider).toBeDefined()
    expect(provider.employees).toBeDefined()
    expect(provider.attendances).toBeDefined()
  })

  it('returns mock backend when explicitly passed "mock"', () => {
    const provider = createApiProvider('mock')
    expect(provider).toBeDefined()
    expect(provider.employees).toBeDefined()
    expect(provider.attendances).toBeDefined()
  })

  it('falls back to mock with console.warn when passed "sqlite"', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const provider = createApiProvider('sqlite')
    expect(provider).toBeDefined()
    expect(provider.employees).toBeDefined()
    expect(provider.attendances).toBeDefined()
    expect(warnSpy).toHaveBeenCalledWith(
      'SQLite backend not yet implemented, falling back to mock',
    )
    warnSpy.mockRestore()
  })

  it('returns an object that satisfies ApiProvider interface', () => {
    const provider: ApiProvider = createApiProvider()

    // Verify employees API has required methods
    expect(typeof provider.employees.getAll).toBe('function')
    expect(typeof provider.employees.getActive).toBe('function')
    expect(typeof provider.employees.getById).toBe('function')
    expect(typeof provider.employees.add).toBe('function')
    expect(typeof provider.employees.update).toBe('function')
    expect(typeof provider.employees.remove).toBe('function')

    // Verify attendances API has required methods
    expect(typeof provider.attendances.getAll).toBe('function')
    expect(typeof provider.attendances.getById).toBe('function')
    expect(typeof provider.attendances.getByDate).toBe('function')
    expect(typeof provider.attendances.getByMonth).toBe('function')
    expect(typeof provider.attendances.getByEmployeeId).toBe('function')
    expect(typeof provider.attendances.getByEmployeeAndDate).toBe('function')
    expect(typeof provider.attendances.add).toBe('function')
    expect(typeof provider.attendances.update).toBe('function')
    expect(typeof provider.attendances.remove).toBe('function')
  })
})

describe('api singleton', () => {
  it('is a valid ApiProvider', () => {
    expect(api).toBeDefined()
    expect(api.employees).toBeDefined()
    expect(api.attendances).toBeDefined()
  })

  it('has functional employees API', () => {
    resetApi()
    const employees = api.employees.getAll()
    expect(employees.length).toBeGreaterThan(0)
  })

  it('has functional attendances API', () => {
    resetApi()
    const attendances = api.attendances.getAll()
    expect(attendances.length).toBeGreaterThan(0)
  })

  it('resetApi resets all mock data', () => {
    api.employees.remove('emp-001')
    expect(api.employees.getAll().length).toBe(5)
    resetApi()
    expect(api.employees.getAll().length).toBe(6)
  })
})
