import Link from "next/link";

export const dynamic = "force-dynamic";

import { EmptyState } from "../_components/EmptyState";
import { MoneyText } from "../_components/MoneyText";
import { listAccounts } from "@/db/queries/accounts";
import { getSettings } from "@/db/queries/settings";

const ACCOUNT_LABELS: Record<string, string> = {
  checking: "Checking",
  savings: "Savings",
  credit_card: "Credit card",
  cash: "Cash",
};

export default function AccountsPage() {
  const settings = getSettings();
  const accounts = listAccounts();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Accounts</h1>
        <Link
          href="/accounts/new"
          className="rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background hover:opacity-90"
        >
          New account
        </Link>
      </div>

      {accounts.length === 0 ? (
        <EmptyState
          title="No accounts yet"
          description="Add a checking, savings, credit card or cash account."
          cta={{ href: "/accounts/new", label: "Add account" }}
        />
      ) : (
        <ul className="divide-y divide-border rounded-lg border border-border">
          {accounts.map((a) => (
            <li key={a.id}>
              <Link
                href={`/accounts/${a.id}`}
                className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-muted/40"
              >
                <div>
                  <p className="font-medium">{a.name}</p>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    {ACCOUNT_LABELS[a.type] ?? a.type} · {a.currency}
                  </p>
                </div>
                <p className="text-lg font-semibold">
                  <MoneyText
                    amountMinor={a.balanceMinor}
                    currency={a.currency}
                    locale={settings.locale}
                    signed
                  />
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
