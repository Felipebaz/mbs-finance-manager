import "server-only";

import { eq, isNull, sql } from "drizzle-orm";

import { db } from "../client";
import { accounts, transactions, type Account } from "../schema";

export type AccountWithBalance = Account & { balanceMinor: number };

export function listAccounts(): AccountWithBalance[] {
  const rows = db
    .select({
      account: accounts,
      txSum: sql<number>`coalesce(sum(${transactions.amountMinor}), 0)`,
    })
    .from(accounts)
    .leftJoin(transactions, eq(transactions.accountId, accounts.id))
    .where(isNull(accounts.archivedAt))
    .groupBy(accounts.id)
    .orderBy(accounts.name)
    .all();

  return rows.map((r) => ({
    ...r.account,
    balanceMinor: r.account.openingBalanceMinor + Number(r.txSum ?? 0),
  }));
}

export function getAccount(id: number): Account | undefined {
  return db.select().from(accounts).where(eq(accounts.id, id)).get();
}

export function getAccountWithBalance(id: number): AccountWithBalance | undefined {
  const account = getAccount(id);
  if (!account) return undefined;
  const row = db
    .select({
      sum: sql<number>`coalesce(sum(${transactions.amountMinor}), 0)`,
    })
    .from(transactions)
    .where(eq(transactions.accountId, id))
    .get();
  return {
    ...account,
    balanceMinor: account.openingBalanceMinor + Number(row?.sum ?? 0),
  };
}

export function listActiveAccountsBasic(): Account[] {
  return db
    .select()
    .from(accounts)
    .where(isNull(accounts.archivedAt))
    .orderBy(accounts.name)
    .all();
}
