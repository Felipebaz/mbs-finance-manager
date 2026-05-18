"use server";

import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { db } from "@/db/client";
import { getSettings } from "@/db/queries/settings";
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

function parseAmount(
  raw: string,
  currency: string,
  locale: string,
): { ok: true; magnitude: number } | { ok: false; error: string } {
  try {
    return {
      ok: true,
      magnitude: Math.abs(parseMoneyInput(raw, currency, locale).amount),
    };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

function handleIncomeExpense(
  obj: Record<string, string>,
  locale: string,
): ActionState {
  const parsed = incomeExpenseSchema.safeParse(obj);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const { accountId, categoryId, type, amount, occurredAt, note } = parsed.data;

  const account = db.select().from(accounts).where(eq(accounts.id, accountId)).get();
  if (!account) return { error: "Account not found." };

  const category = db.select().from(categories).where(eq(categories.id, categoryId)).get();
  if (!category) return { error: "Category not found." };
  if (category.kind !== type) {
    return { error: `Category "${category.name}" is not a ${type} category.` };
  }

  const amt = parseAmount(amount, account.currency, locale);
  if (!amt.ok) return { error: amt.error };

  const signed = type === "income" ? amt.magnitude : -amt.magnitude;
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
  return null;
}

function handleTransfer(
  obj: Record<string, string>,
  locale: string,
): ActionState {
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

  const amt = parseAmount(amount, from.currency, locale);
  if (!amt.ok) return { error: amt.error };

  const groupId = randomUUID();
  const when = parseIsoDate(occurredAt);

  db.transaction((tx) => {
    tx.insert(transactions)
      .values({
        accountId: from.id,
        categoryId: null,
        type: "transfer",
        amountMinor: -amt.magnitude,
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
        amountMinor: amt.magnitude,
        currency: to.currency,
        occurredAt: when,
        note: note ?? null,
        transferGroupId: groupId,
      })
      .run();
  });
  return null;
}

export async function createTransaction(
  _prev: ActionState,
  fd: FormData,
): Promise<ActionState> {
  const obj = formDataToObject(fd);
  const { locale } = getSettings();

  let result: ActionState;
  if (obj.type === "income" || obj.type === "expense") {
    result = handleIncomeExpense(obj, locale);
  } else if (obj.type === "transfer") {
    result = handleTransfer(obj, locale);
  } else {
    return { error: "Unknown transaction type." };
  }

  if (result?.error) return result;
  revalidateTxPaths();
  redirect("/transactions");
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
