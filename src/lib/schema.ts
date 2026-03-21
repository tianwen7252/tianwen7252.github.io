/**
 * V2 SQLite database schema definition.
 * Mirrors the V1 Dexie/IndexedDB data model with SQL-native improvements.
 */

export const SCHEMA_VERSION = 1

// SQL statements for creating the database schema
export const CREATE_TABLES = `
  -- Product categories
  CREATE TABLE IF NOT EXISTS commondity_types (
    id TEXT PRIMARY KEY,
    type_id TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL,
    label TEXT NOT NULL,
    color TEXT NOT NULL DEFAULT '',
    created_at INTEGER NOT NULL DEFAULT (unixepoch('now') * 1000),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch('now') * 1000)
  );

  -- Products (keeps 'commondity' spelling for V1 compatibility)
  CREATE TABLE IF NOT EXISTS commondities (
    id TEXT PRIMARY KEY,
    type_id TEXT NOT NULL,
    name TEXT NOT NULL,
    price REAL NOT NULL DEFAULT 0,
    priority INTEGER NOT NULL DEFAULT 0,
    on_market INTEGER NOT NULL DEFAULT 1,
    hide_on_mode TEXT,
    editor TEXT,
    created_at INTEGER NOT NULL DEFAULT (unixepoch('now') * 1000),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch('now') * 1000),
    FOREIGN KEY (type_id) REFERENCES commondity_types(type_id)
  );

  -- Orders
  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    number INTEGER NOT NULL,
    data TEXT NOT NULL DEFAULT '[]',
    memo TEXT NOT NULL DEFAULT '[]',
    soups INTEGER NOT NULL DEFAULT 0,
    total REAL NOT NULL DEFAULT 0,
    original_total REAL,
    edited_memo TEXT,
    editor TEXT NOT NULL DEFAULT '',
    created_at INTEGER NOT NULL DEFAULT (unixepoch('now') * 1000),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch('now') * 1000)
  );

  CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

  -- Order types
  CREATE TABLE IF NOT EXISTS order_types (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    priority INTEGER NOT NULL DEFAULT 0,
    type TEXT NOT NULL DEFAULT 'order',
    color TEXT,
    created_at INTEGER NOT NULL DEFAULT (unixepoch('now') * 1000),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch('now') * 1000),
    editor TEXT
  );

  -- Daily aggregated data
  CREATE TABLE IF NOT EXISTS daily_data (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL UNIQUE,
    total REAL NOT NULL DEFAULT 0,
    original_total REAL NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL DEFAULT (unixepoch('now') * 1000),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch('now') * 1000),
    editor TEXT NOT NULL DEFAULT ''
  );

  CREATE INDEX IF NOT EXISTS idx_daily_data_date ON daily_data(date);

  -- Employees
  CREATE TABLE IF NOT EXISTS employees (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    avatar TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    shift_type TEXT DEFAULT 'regular',
    employee_no TEXT UNIQUE,
    is_admin INTEGER NOT NULL DEFAULT 0,
    hire_date TEXT,
    resignation_date TEXT,
    created_at INTEGER NOT NULL DEFAULT (unixepoch('now') * 1000),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch('now') * 1000)
  );

  -- Attendance records
  CREATE TABLE IF NOT EXISTS attendances (
    id TEXT PRIMARY KEY,
    employee_id TEXT NOT NULL,
    date TEXT NOT NULL,
    clock_in INTEGER,
    clock_out INTEGER,
    type TEXT NOT NULL DEFAULT 'regular',
    FOREIGN KEY (employee_id) REFERENCES employees(id)
  );

  CREATE INDEX IF NOT EXISTS idx_attendances_employee_date
    ON attendances(employee_id, date);

  -- Schema version tracking
  CREATE TABLE IF NOT EXISTS schema_meta (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  INSERT OR IGNORE INTO schema_meta (key, value)
    VALUES ('version', '${SCHEMA_VERSION}');
` as const

/**
 * Initialize the database schema.
 * Idempotent — safe to call multiple times.
 */
export function initSchema(exec: (sql: string) => void): void {
  exec('PRAGMA foreign_keys = ON')
  exec(CREATE_TABLES)
}
