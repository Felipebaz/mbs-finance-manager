"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { db } from "@/db/client";
import { getSettings } from "@/db/queries/settings";
import { accounts } from "@/db/schema";
import { parseMoneyInput } from "@/lib/money";
import { accountSchema, formDataToObject } from "@/lib/validation";

export type ActionState = { error?: string } | null;

export async function createAccount(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const parsed = accountSchema.safeParse(formDataToObject(fd));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const { name, type, currency, openingBalance } = parsed.data;
  const { locale } = getSettings();
  let openingMinor: number;
  try {
    openingMinor = parseMoneyInput(openingBalance, currency, locale).amount;
  } catch (e) {
    return { error: (e as Error).message };
  }

  db.insert(accounts)
    .values({
      name,
      type,
      currency,
      openingBalanceMinor: openingMinor,
    })
    .run();

  revalidatePath("/accounts");
  revalidatePath("/");
  redirect("/accounts");
}

export async function archiveAccount(formData: FormData): Promise<void> {
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id) || id <= 0) return;
  db.update(accounts)
    .set({ archivedAt: new Date() })
    .where(eq(accounts.id, id))
    .run();
  revalidatePath("/accounts");
  revalidatePath("/");
}
