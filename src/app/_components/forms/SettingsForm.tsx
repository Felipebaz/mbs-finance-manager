"use client";

import { useActionState } from "react";

import { updateSettings } from "../../_actions/settings";
import type { ActionState } from "../../_actions/accounts";
import { FormError } from "./FormError";
import { SubmitButton } from "./SubmitButton";

type Props = Readonly<{
  defaultCurrency: string;
  locale: string;
}>;

export function SettingsForm({ defaultCurrency, locale }: Props) {
  const [state, action] = useActionState<ActionState, FormData>(updateSettings, null);

  return (
    <form action={action} className="space-y-4">
      <FormError message={state?.error} />

      <label htmlFor="defaultCurrency" className="block space-y-1">
        <span className="block text-sm font-medium">Default currency (ISO 4217)</span>
        <input
          id="defaultCurrency"
          name="defaultCurrency"
          required
          defaultValue={defaultCurrency}
          maxLength={3}
          pattern="[A-Za-z]{3}"
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm uppercase"
        />
      </label>

      <label htmlFor="locale" className="block space-y-1">
        <span className="block text-sm font-medium">Locale (BCP-47)</span>
        <input
          id="locale"
          name="locale"
          required
          defaultValue={locale}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
        <span className="block text-xs text-muted-foreground">
          Examples: en-IE, en-US, de-DE, es-ES, ja-JP.
        </span>
      </label>

      <SubmitButton label="Save settings" pendingLabel="Saving…" />
    </form>
  );
}
