"use client";

import { useActionState } from "react";

import { createAccount, type ActionState } from "../../_actions/accounts";
import { FormError } from "./FormError";
import { SubmitButton } from "./SubmitButton";

type Props = Readonly<{ defaultCurrency: string }>;

const TYPES = [
  { value: "checking", label: "Checking" },
  { value: "savings", label: "Savings" },
  { value: "credit_card", label: "Credit card" },
  { value: "cash", label: "Cash" },
];

export function AccountForm({ defaultCurrency }: Props) {
  const [state, action] = useActionState<ActionState, FormData>(createAccount, null);

  return (
    <form action={action} className="space-y-4">
      <FormError message={state?.error} />

      <Field label="Name" htmlFor="name">
        <input
          id="name"
          name="name"
          required
          maxLength={80}
          autoFocus
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
      </Field>

      <Field label="Type" htmlFor="type">
        <select
          id="type"
          name="type"
          required
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
        >
          {TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Currency" htmlFor="currency">
          <input
            id="currency"
            name="currency"
            required
            defaultValue={defaultCurrency}
            maxLength={3}
            pattern="[A-Za-z]{3}"
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm uppercase"
          />
        </Field>

        <Field label="Opening balance" htmlFor="openingBalance">
          <input
            id="openingBalance"
            name="openingBalance"
            required
            defaultValue="0"
            inputMode="decimal"
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm tabular-nums"
          />
        </Field>
      </div>

      <p className="text-xs text-muted-foreground">
        Credit-card accounts can have a negative opening balance to represent outstanding debt.
      </p>

      <div className="flex gap-2">
        <SubmitButton label="Create account" pendingLabel="Creating…" />
      </div>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: Readonly<{ label: string; htmlFor: string; children: React.ReactNode }>) {
  return (
    <label htmlFor={htmlFor} className="block space-y-1">
      <span className="block text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}
