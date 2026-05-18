import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";

import * as schema from "./schema";
import { seedIfEmpty } from "./seed";

const DB_DIR = path.resolve(process.cwd(), "data");
const DB_PATH = path.join(DB_DIR, "moneta.db");
const MIGRATIONS_DIR = path.resolve(process.cwd(), "drizzle");

if (!existsSync(DB_DIR)) mkdirSync(DB_DIR, { recursive: true });
const sqlite = new Database(DB_PATH);
sqlite.pragma("foreign_keys = ON");
const db = drizzle(sqlite, { schema });
if (existsSync(MIGRATIONS_DIR)) {
  migrate(db, { migrationsFolder: MIGRATIONS_DIR });
}
seedIfEmpty(db);
console.log("Seed complete.");
