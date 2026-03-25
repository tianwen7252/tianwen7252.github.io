/**
 * Repository provider — singleton access to repository instances.
 * Call initRepositories(db) once at app startup, then use
 * getEmployeeRepo() / getAttendanceRepo() / etc. anywhere.
 */

import type { AsyncDatabase } from '@/lib/worker-database'
import {
  createEmployeeRepository,
  type EmployeeRepository,
} from './employee-repository'
import {
  createAttendanceRepository,
  type AttendanceRepository,
} from './attendance-repository'
import {
  createCommondityTypeRepository,
  type CommondityTypeRepository,
} from './commondity-type-repository'
import {
  createCommondityRepository,
  type CommondityRepository,
} from './commondity-repository'
import {
  createOrderRepository,
  type OrderRepository,
} from './order-repository'
import {
  createOrderItemRepository,
  type OrderItemRepository,
} from './order-item-repository'
import {
  createOrderDiscountRepository,
  type OrderDiscountRepository,
} from './order-discount-repository'
import {
  createStatisticsRepository,
  type StatisticsRepository,
} from './statistics-repository'

let employeeRepo: EmployeeRepository | null = null
let attendanceRepo: AttendanceRepository | null = null
let commondityTypeRepo: CommondityTypeRepository | null = null
let commondityRepo: CommondityRepository | null = null
let orderRepo: OrderRepository | null = null
let orderItemRepo: OrderItemRepository | null = null
let orderDiscountRepo: OrderDiscountRepository | null = null
let statisticsRepo: StatisticsRepository | null = null

/**
 * Initialize all repositories with the given async database instance.
 * Must be called before any getXxxRepo() calls.
 */
export function initRepositories(db: AsyncDatabase): void {
  employeeRepo = createEmployeeRepository(db)
  attendanceRepo = createAttendanceRepository(db)
  commondityTypeRepo = createCommondityTypeRepository(db)
  commondityRepo = createCommondityRepository(db)
  orderRepo = createOrderRepository(db)
  orderItemRepo = createOrderItemRepository(db)
  orderDiscountRepo = createOrderDiscountRepository(db)
  statisticsRepo = createStatisticsRepository(db)
}

/**
 * Get the EmployeeRepository singleton.
 * Throws if initRepositories() has not been called.
 */
export function getEmployeeRepo(): EmployeeRepository {
  if (!employeeRepo) {
    throw new Error(
      'Repositories not initialized. Call initRepositories(db) first.',
    )
  }
  return employeeRepo
}

/**
 * Get the AttendanceRepository singleton.
 * Throws if initRepositories() has not been called.
 */
export function getAttendanceRepo(): AttendanceRepository {
  if (!attendanceRepo) {
    throw new Error(
      'Repositories not initialized. Call initRepositories(db) first.',
    )
  }
  return attendanceRepo
}

/**
 * Get the CommondityTypeRepository singleton.
 * Throws if initRepositories() has not been called.
 */
export function getCommondityTypeRepo(): CommondityTypeRepository {
  if (!commondityTypeRepo) {
    throw new Error(
      'Repositories not initialized. Call initRepositories(db) first.',
    )
  }
  return commondityTypeRepo
}

/**
 * Get the CommondityRepository singleton.
 * Throws if initRepositories() has not been called.
 */
export function getCommondityRepo(): CommondityRepository {
  if (!commondityRepo) {
    throw new Error(
      'Repositories not initialized. Call initRepositories(db) first.',
    )
  }
  return commondityRepo
}

/**
 * Get the OrderRepository singleton.
 * Throws if initRepositories() has not been called.
 */
export function getOrderRepo(): OrderRepository {
  if (!orderRepo) {
    throw new Error(
      'Repositories not initialized. Call initRepositories(db) first.',
    )
  }
  return orderRepo
}

/**
 * Get the OrderItemRepository singleton.
 * Throws if initRepositories() has not been called.
 */
export function getOrderItemRepo(): OrderItemRepository {
  if (!orderItemRepo) {
    throw new Error(
      'Repositories not initialized. Call initRepositories(db) first.',
    )
  }
  return orderItemRepo
}

/**
 * Get the OrderDiscountRepository singleton.
 * Throws if initRepositories() has not been called.
 */
export function getOrderDiscountRepo(): OrderDiscountRepository {
  if (!orderDiscountRepo) {
    throw new Error(
      'Repositories not initialized. Call initRepositories(db) first.',
    )
  }
  return orderDiscountRepo
}

/**
 * Get the StatisticsRepository singleton.
 * Throws if initRepositories() has not been called.
 */
export function getStatisticsRepo(): StatisticsRepository {
  if (!statisticsRepo) {
    throw new Error(
      'Repositories not initialized. Call initRepositories(db) first.',
    )
  }
  return statisticsRepo
}

/**
 * Reset all repository singletons to null.
 * Useful for testing or app teardown.
 */
export function resetRepositories(): void {
  employeeRepo = null
  attendanceRepo = null
  commondityTypeRepo = null
  commondityRepo = null
  orderRepo = null
  orderItemRepo = null
  orderDiscountRepo = null
  statisticsRepo = null
}
