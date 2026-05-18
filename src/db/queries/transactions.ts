import "server-only";

import { and, desc, eq, gte, lt, sql } from "drizzle-orm";

import { db } from "../client";
import { accounts, categories, transactions, type Transaction } from "../schema";

export type TransactionWithRefs = Transaction & {
  accountName: string;
  accountCurrency: string;
  categoryName: string | null;
  categoryColor: string | null;
};

const txWithRefsColumns = {
  id: transactions.id,
  accountId: transactions.accountId,
  categoryId: transactions.categoryId,
  type: transactions.type,
  amountMinor: transactions.amountMinor,
  currency: transactions.currency,
  occurredAt: transactions.occurredAt,
  note: transactions.note,
  transferGroupId: transactions.transferGroupId,
  createdAt: transactions.createdAt,
  accountName: accounts.name,
  accountCurrency: accounts.currency,
  categoryName: categories.name,
  categoryColor: categories.color,
} as const;

export function listTransactions(limit = 200): TransactionWithRefs[] {
  return db
    .select(txWithRefsColumns)
    .from(transactions)
    .innerJoin(accounts, eq(transactions.accountId, accounts.id))
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .orderBy(desc(transactions.occurredAt), desc(transactions.id))
    .limit(limit)
    .all();
}

export function transactionsForAccount(accountId: number, limit = 200): TransactionWithRefs[] {
  return db
    .select(txWithRefsColumns)
    .from(transactions)
    .innerJoin(accounts, eq(transactions.accountId, accounts.id))
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .where(eq(transactions.accountId, accountId))
    .orderBy(desc(transactions.occurredAt), desc(transactions.id))
    .limit(limit)
    .all();
}

export type SpendSlice = {
  categoryId: number | null;
  name: string;
  color: string;
  amountMinor: number;
};

export function monthlySpendByCategory(rangeStart: Date, rangeEnd: Date): SpendSlice[] {
  const rows = db
    .select({
      categoryId: transactions.categoryId,
      name: categories.name,
      color: categories.color,
      sum: sql<number>`coalesce(sum(-${transactions.amountMinor}), 0)`,
    })
    .from(transactions)
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .where(
      and(
        eq(transactions.type, "expense"),
        gte(transactions.occurredAt, rangeStart),
        lt(transactions.occurredAt, rangeEnd),
      ),
    )
    .groupBy(transactions.categoryId)
    .all();

  return rows
    .map((r): SpendSlice => ({
      categoryId: r.categoryId,
      name: r.name ?? "Uncategorized",
      color: r.color ?? "#6b7280",
      amountMinor: Number(r.sum ?? 0),
    }))
    .filter((s) => s.amountMinor > 0);
}

export type NetWorthPoint = { date: string; totalMinor: number };

export function netWorthSeries(): NetWorthPoint[] {
  const openingTotal = db
    .select({ sum: sql<number>`coalesce(sum(${accounts.openingBalanceMinor}), 0)` })
    .from(accounts)
    .get();
  const opening = Number(openingTotal?.sum ?? 0);

  const rows = db
    .select({
      occurredAt: transactions.occurredAt,
      type: transactions.type,
      amountMinor: transactions.amountMinor,
    })
    .from(transactions)
    .orderBy(transactions.occurredAt, transactions.id)
    .all();

  let running = opening;
  const dayMap = new Map<string, number>();
  for (const r of rows) {
    const delta = r.type === "transfer" ? 0 : r.amountMinor;
    running += delta;
    const day = r.occurredAt.toISOString().slice(0, 10);
    dayMap.set(day, running);
  }
  const points: NetWorthPoint[] = Array.from(dayMap, ([date, totalMinor]) => ({
    date,
    totalMinor,
  }));
  points.sort((a, b) => a.date.localeCompare(b.date));
  if (points.length === 0) {
    points.push({
      date: new Date().toISOString().slice(0, 10),
      totalMinor: opening,
    });
  }
  return points;
}

export type { Category } from "../schema";
