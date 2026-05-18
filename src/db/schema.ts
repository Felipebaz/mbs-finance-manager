import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const accountTypes = ["checking", "savings", "credit_card", "cash"] as const;
export type AccountType = (typeof accountTypes)[number];

export const categoryKinds = ["income", "expense"] as const;
export type CategoryKind = (typeof categoryKinds)[number];

export const transactionTypes = ["income", "expense", "transfer"] as const;
export type TransactionType = (typeof transactionTypes)[number];

export const accounts = sqliteTable("accounts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  type: text("type", { enum: accountTypes }).notNull(),
  currency: text("currency", { length: 3 }).notNull(),
  openingBalanceMinor: integer("opening_balance_minor").notNull().default(0),
  archivedAt: integer("archived_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const categories = sqliteTable("categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  kind: text("kind", { enum: categoryKinds }).notNull(),
  color: text("color").notNull().default("#6b7280"),
  archivedAt: integer("archived_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const transactions = sqliteTable(
  "transactions",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    accountId: integer("account_id")
      .notNull()
      .references(() => accounts.id, { onDelete: "restrict" }),
    categoryId: integer("category_id").references(() => categories.id, {
      onDelete: "set null",
    }),
    type: text("type", { enum: transactionTypes }).notNull(),
    amountMinor: integer("amount_minor").notNull(),
    currency: text("currency", { length: 3 }).notNull(),
    occurredAt: integer("occurred_at", { mode: "timestamp" }).notNull(),
    note: text("note"),
    transferGroupId: text("transfer_group_id"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => [
    index("tx_account_idx").on(t.accountId),
    index("tx_category_idx").on(t.categoryId),
    index("tx_occurred_idx").on(t.occurredAt),
    index("tx_group_idx").on(t.transferGroupId),
  ],
);

export const settings = sqliteTable("settings", {
  id: integer("id").primaryKey(),
  defaultCurrency: text("default_currency", { length: 3 }).notNull(),
  locale: text("locale").notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
export type Settings = typeof settings.$inferSelect;
