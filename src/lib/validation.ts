import { z } from "zod";

import { accountTypes, categoryKinds, transactionTypes } from "@/db/schema";
import { isLikelyIsoCurrency } from "./currency";

const currencyCode = z
  .string()
  .trim()
  .transform((s) => s.toUpperCase())
  .refine((s) => isLikelyIsoCurrency(s), { message: "Unknown currency code." });

const isoDateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD.");

const moneyInput = z
  .string()
  .trim()
  .min(1, "Amount required.")
  .max(32, "Amount too long.");

export const accountSchema = z.object({
  name: z.string().trim().min(1, "Name required.").max(80),
  type: z.enum(accountTypes),
  currency: currencyCode,
  openingBalance: moneyInput,
});
export type AccountInput = z.infer<typeof accountSchema>;

export const categorySchema = z.object({
  name: z.string().trim().min(1, "Name required.").max(60),
  kind: z.enum(categoryKinds),
  color: z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{6}$/, "Color must be #RRGGBB.")
    .default("#6b7280"),
});
export type CategoryInput = z.infer<typeof categorySchema>;

const baseTx = {
  type: z.enum(transactionTypes),
  amount: moneyInput,
  occurredAt: isoDateString,
  note: z.string().trim().max(280).optional().or(z.literal("").transform(() => undefined)),
};

const intId = z.coerce.number().int().positive();

export const incomeExpenseSchema = z.object({
  type: z.enum(["income", "expense"]),
  accountId: intId,
  categoryId: intId,
  amount: moneyInput,
  occurredAt: isoDateString,
  note: baseTx.note,
});
export type IncomeExpenseInput = z.infer<typeof incomeExpenseSchema>;

export const transferSchema = z
  .object({
    type: z.literal("transfer"),
    fromAccountId: intId,
    toAccountId: intId,
    amount: moneyInput,
    occurredAt: isoDateString,
    note: baseTx.note,
  })
  .refine((d) => d.fromAccountId !== d.toAccountId, {
    message: "Source and destination must differ.",
    path: ["toAccountId"],
  });
export type TransferInput = z.infer<typeof transferSchema>;

export const settingsSchema = z.object({
  defaultCurrency: currencyCode,
  locale: z.string().trim().min(2).max(15),
});
export type SettingsInput = z.infer<typeof settingsSchema>;

export function formDataToObject(fd: FormData): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of fd.entries()) {
    if (typeof v === "string") out[k] = v;
  }
  return out;
}
