import "server-only";

import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { drizzle, type BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";

import * as schema from "./schema";
import { seedIfEmpty } from "./seed";

type DB = BetterSQLite3Database<typeof schema>;

const DB_DIR = path.resolve(process.cwd(), "data");
const DB_PATH = path.join(DB_DIR, "moneta.db");
const MIGRATIONS_DIR = path.resolve(process.cwd(), "drizzle");

declare global {
  var __monetaDb: DB | undefined;
}

function createDb(): DB {
  if (!existsSync(DB_DIR)) mkdirSync(DB_DIR, { recursive: true });
  const sqlite = new Database(DB_PATH);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  sqlite.pragma("busy_timeout = 5000");
  const database = drizzle(sqlite, { schema });
  if (existsSync(MIGRATIONS_DIR)) {
    migrate(database, { migrationsFolder: MIGRATIONS_DIR });
  }
  seedIfEmpty(database);
  return database;
}

function getDb(): DB {
  if (!globalThis.__monetaDb) {
    globalThis.__monetaDb = createDb();
  }
  return globalThis.__monetaDb;
}

export const db = new Proxy({} as DB, {
  get(_target, prop, receiver) {
    return Reflect.get(getDb(), prop, receiver);
  },
}) as DB;
