import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { sql } from "drizzle-orm";

import * as schema from "./schema";

type DB = BetterSQLite3Database<typeof schema>;

const DEFAULT_CATEGORIES: { name: string; kind: schema.CategoryKind; color: string }[] = [
  { name: "Salary", kind: "income", color: "#16a34a" },
  { name: "Other Income", kind: "income", color: "#22c55e" },
  { name: "Groceries", kind: "expense", color: "#0ea5e9" },
  { name: "Rent", kind: "expense", color: "#a855f7" },
  { name: "Utilities", kind: "expense", color: "#f97316" },
  { name: "Transport", kind: "expense", color: "#eab308" },
  { name: "Dining", kind: "expense", color: "#ec4899" },
  { name: "Entertainment", kind: "expense", color: "#8b5cf6" },
  { name: "Other Expense", kind: "expense", color: "#6b7280" },
];

export function seedIfEmpty(db: DB): void {
  const existing = db
    .select({ count: sql<number>`count(*)` })
    .from(schema.settings)
    .all();
  if ((existing[0]?.count ?? 0) > 0) return;

  db.transaction((tx) => {
    tx.insert(schema.settings)
      .values({ id: 1, defaultCurrency: "EUR", locale: "en-IE" })
      .run();
    tx.insert(schema.categories).values(DEFAULT_CATEGORIES).run();
  });
}
