import pg from 'pg';
import { config } from '../config.js';

const { Pool } = pg;

const pool = new Pool({
  connectionString: config.databaseUrl,
  ssl: config.databaseUrl.includes('supa')
    ? { rejectUnauthorized: false }
    : undefined,
});

export async function query(text: string, params?: unknown[]) {
  return pool.query(text, params);
}

export async function getClient() {
  return pool.connect();
}

export async function initializeDatabase(): Promise<void> {
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS employees (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      employee_id TEXT NOT NULL,
      name TEXT NOT NULL,
      department TEXT NOT NULL,
      manager TEXT NOT NULL,
      rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
      is_frozen INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS user_settings (
      user_id INTEGER PRIMARY KEY,
      target_percentages TEXT NOT NULL DEFAULT '{"rating1":10,"rating2":20,"rating3":40,"rating4":20,"rating5":10}',
      deviation_threshold REAL NOT NULL DEFAULT 2,
      theme TEXT NOT NULL DEFAULT 'dark',
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_employees_user_id ON employees(user_id);
  `);

  console.log('Database tables initialized');
}
