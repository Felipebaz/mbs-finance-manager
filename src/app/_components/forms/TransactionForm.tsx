"use client";

import { useActionState, useState } from "react";

import { createTransaction } from "../../_actions/transactions";
import type { ActionState } from "../../_actions/accounts";
import { FormError } from "./FormError";
import { SubmitButton } from "./SubmitButton";

type AccountOpt = Readonly<{
  id: number;
  name: string;
  currency: string;
}>;

type CategoryOpt = Readonly<{
  id: number;
  name: string;
  kind: "income" | "expense";
}>;

type Props = Readonly<{
  accounts: AccountOpt[];
  categories: CategoryOpt[];
  defaultAccountId?: number;
  defaultDate: string;
}>;

type TxType = "income" | "expense" | "transfer";

export function TransactionForm({
  accounts,
  categories,
  defaultAccountId,
  defaultDate,
}: Props) {
  const [type, setType] = useState<TxType>("expense");
  const [state, action] = useActionState<ActionState, FormData>(createTransaction, null);

  const matchingCategories = categories.filter((c) =>
    type === "income" ? c.kind === "income" : c.kind === "expense",
  );

  return (
    <form action={action} className="space-y-4">
      <FormError message={state?.error} />

      <fieldset className="space-y-1">
        <legend className="block text-sm font-medium">Type</legend>
        <div className="flex gap-2">
          {(["expense", "income", "transfer"] as const).map((t) => (
            <label
              key={t}
              className={[
                "cursor-pointer rounded-md border px-3 py-2 text-sm capitalize",
                type === t
                  ? "border-foreground bg-foreground text-background"
                  : "border-border hover:bg-muted/40",
              ].join(" ")}
            >
              <input
                type="radio"
                name="type"
                value={t}
                checked={type === t}
                onChange={() => setType(t)}
                className="sr-only"
              />
              {t}
            </label>
          ))}
        </div>
      </fieldset>

      {type === "transfer" ? (
        <div className="grid grid-cols-2 gap-3">
          <label htmlFor="fromAccountId" className="block space-y-1">
            <span className="block text-sm font-medium">From</span>
            <select
              id="fromAccountId"
              name="fromAccountId"
              required
              defaultValue={defaultAccountId}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            >
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.currency})
                </option>
              ))}
            </select>
          </label>
          <label htmlFor="toAccountId" className="block space-y-1">
            <span className="block text-sm font-medium">To</span>
            <select
              id="toAccountId"
              name="toAccountId"
              required
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            >
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.currency})
                </option>
              ))}
            </select>
          </label>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <label htmlFor="accountId" className="block space-y-1">
            <span className="block text-sm font-medium">Account</span>
            <select
              id="accountId"
              name="accountId"
              required
              defaultValue={defaultAccountId}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            >
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.currency})
                </option>
              ))}
            </select>
          </label>
          <label htmlFor="categoryId" className="block space-y-1">
            <span className="block text-sm font-medium">Category</span>
            <select
              id="categoryId"
              name="categoryId"
              required
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            >
              {matchingCategories.length === 0 ? (
                <option value="">No categories of this kind</option>
              ) : (
                matchingCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))
              )}
            </select>
          </label>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <label htmlFor="amount" className="block space-y-1">
          <span className="block text-sm font-medium">Amount</span>
          <input
            id="amount"
            name="amount"
            required
            inputMode="decimal"
            placeholder="0.00"
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm tabular-nums"
          />
        </label>
        <label htmlFor="occurredAt" className="block space-y-1">
          <span className="block text-sm font-medium">Date</span>
          <input
            id="occurredAt"
            name="occurredAt"
            type="date"
            required
            defaultValue={defaultDate}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          />
        </label>
      </div>

      <label htmlFor="note" className="block space-y-1">
        <span className="block text-sm font-medium">Note (optional)</span>
        <input
          id="note"
          name="note"
          maxLength={280}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
      </label>

      <SubmitButton label="Save transaction" pendingLabel="Saving…" />
    </form>
  );
}
