"use server";

import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { db } from "@/db/client";
import { accounts, categories, transactions } from "@/db/schema";
import { parseIsoDate } from "@/lib/dates";
import { parseMoneyInput } from "@/lib/money";
import {
  formDataToObject,
  incomeExpenseSchema,
  transferSchema,
} from "@/lib/validation";
import type { ActionState } from "./accounts";

function revalidateTxPaths(): void {
  revalidatePath("/");
  revalidatePath("/transactions");
  revalidatePath("/accounts");
}

export async function createTransaction(
  _prev: ActionState,
  fd: FormData,
): Promise<ActionState> {
  const obj = formDataToObject(fd);
  const type = obj.type;

  if (type === "income" || type === "expense") {
    const parsed = incomeExpenseSchema.safeParse(obj);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
    }
    const { accountId, categoryId, amount, occurredAt, note } = parsed.data;

    const account = db.select().from(accounts).where(eq(accounts.id, accountId)).get();
    if (!account) return { error: "Account not found." };

    const category = db.select().from(categories).where(eq(categories.id, categoryId)).get();
    if (!category) return { error: "Category not found." };
    if (category.kind !== type) {
      return { error: `Category "${category.name}" is not a ${type} category.` };
    }

    let magnitude: number;
    try {
      magnitude = Math.abs(parseMoneyInput(amount, account.currency, "en-IE").amount);
    } catch (e) {
      return { error: (e as Error).message };
    }
    const signed = type === "income" ? magnitude : -magnitude;

    db.insert(transactions)
      .values({
        accountId,
        categoryId,
        type,
        amountMinor: signed,
        currency: account.currency,
        occurredAt: parseIsoDate(occurredAt),
        note: note ?? null,
      })
      .run();
    revalidateTxPaths();
    redirect("/transactions");
  }

  if (type === "transfer") {
    const parsed = transferSchema.safeParse(obj);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
    }
    const { fromAccountId, toAccountId, amount, occurredAt, note } = parsed.data;

    const from = db.select().from(accounts).where(eq(accounts.id, fromAccountId)).get();
    const to = db.select().from(accounts).where(eq(accounts.id, toAccountId)).get();
    if (!from || !to) return { error: "Account not found." };
    if (from.currency !== to.currency) {
      return { error: "Cross-currency transfers not supported in v1." };
    }

    let magnitude: number;
    try {
      magnitude = Math.abs(parseMoneyInput(amount, from.currency, "en-IE").amount);
    } catch (e) {
      return { error: (e as Error).message };
    }
    const groupId = randomUUID();
    const when = parseIsoDate(occurredAt);

    db.transaction((tx) => {
      tx.insert(transactions)
        .values({
          accountId: from.id,
          categoryId: null,
          type: "transfer",
          amountMinor: -magnitude,
          currency: from.currency,
          occurredAt: when,
          note: note ?? null,
          transferGroupId: groupId,
        })
        .run();
      tx.insert(transactions)
        .values({
          accountId: to.id,
          categoryId: null,
          type: "transfer",
          amountMinor: magnitude,
          currency: to.currency,
          occurredAt: when,
          note: note ?? null,
          transferGroupId: groupId,
        })
        .run();
    });

    revalidateTxPaths();
    redirect("/transactions");
  }

  return { error: "Unknown transaction type." };
}

export async function deleteTransaction(fd: FormData): Promise<void> {
  const id = Number(fd.get("id"));
  if (!Number.isInteger(id) || id <= 0) return;

  const row = db.select().from(transactions).where(eq(transactions.id, id)).get();
  if (!row) return;

  db.transaction((tx) => {
    if (row.transferGroupId) {
      tx.delete(transactions)
        .where(eq(transactions.transferGroupId, row.transferGroupId))
        .run();
    } else {
      tx.delete(transactions).where(eq(transactions.id, id)).run();
    }
  });

  revalidateTxPaths();
}

export { and };
