"use client";

import { useActionState } from "react";

import { createCategory } from "../../_actions/categories";
import type { ActionState } from "../../_actions/accounts";
import { FormError } from "./FormError";
import { SubmitButton } from "./SubmitButton";

export function CategoryForm() {
  const [state, action] = useActionState<ActionState, FormData>(createCategory, null);

  return (
    <form action={action} className="space-y-4">
      <FormError message={state?.error} />

      <label htmlFor="name" className="block space-y-1">
        <span className="block text-sm font-medium">Name</span>
        <input
          id="name"
          name="name"
          required
          maxLength={60}
          autoFocus
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
      </label>

      <label htmlFor="kind" className="block space-y-1">
        <span className="block text-sm font-medium">Kind</span>
        <select
          id="kind"
          name="kind"
          required
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
        >
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
      </label>

      <label htmlFor="color" className="block space-y-1">
        <span className="block text-sm font-medium">Color</span>
        <input
          id="color"
          name="color"
          type="color"
          defaultValue="#6b7280"
          className="h-10 w-20 rounded-md border border-border bg-background"
        />
      </label>

      <SubmitButton label="Create category" pendingLabel="Creating…" />
    </form>
  );
}
