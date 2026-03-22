/**
 * Enable seed data initialization on first run.
 * Set to false once real data is entered via UI.
 */
export const ENABLE_SEED_DATA = true

/**
 * When true, clears all data from employees and attendances tables on startup.
 * Useful for resetting to a clean state. Takes precedence over ENABLE_SEED_DATA.
 */
export const DELETE_SEED_DATA = false
