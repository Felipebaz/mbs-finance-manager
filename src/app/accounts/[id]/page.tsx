import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

import { MoneyText } from "../../_components/MoneyText";
import { getAccountWithBalance } from "@/db/queries/accounts";
import { getSettings } from "@/db/queries/settings";
import { transactionsForAccount } from "@/db/queries/transactions";
import { formatDateForDisplay } from "@/lib/dates";

const ACCOUNT_LABELS: Record<string, string> = {
  checking: "Checking",
  savings: "Savings",
  credit_card: "Credit card",
  cash: "Cash",
};

type PageProps = Readonly<{ params: Promise<{ id: string }> }>;

export default async function AccountDetailPage({ params }: PageProps) {
  const { id: idRaw } = await params;
  const id = Number(idRaw);
  if (!Number.isInteger(id) || id <= 0) notFound();

  const account = getAccountWithBalance(id);
  if (!account) notFound();

  const settings = getSettings();
  const txs = transactionsForAccount(account.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            {ACCOUNT_LABELS[account.type] ?? account.type} · {account.currency}
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">{account.name}</h1>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Balance</p>
          <p className="text-2xl font-semibold">
            <MoneyText
              amountMinor={account.balanceMinor}
              currency={account.currency}
              locale={settings.locale}
              signed
            />
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <Link
          href={`/transactions/new?accountId=${account.id}`}
          className="rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background hover:opacity-90"
        >
          Add transaction
        </Link>
        <Link
          href="/accounts"
          className="rounded-md border border-border px-3 py-2 text-sm font-medium hover:bg-muted/40"
        >
          Back
        </Link>
      </div>

      <section>
        <h2 className="mb-2 text-sm font-medium text-muted-foreground">Transactions</h2>
        {txs.length === 0 ? (
          <p className="rounded-lg border border-border bg-muted/30 p-6 text-sm text-muted-foreground">
            No transactions on this account yet.
          </p>
        ) : (
          <ul className="divide-y divide-border rounded-lg border border-border">
            {txs.map((t) => (
              <li
                key={t.id}
                className="flex items-center justify-between gap-4 px-4 py-3"
              >
                <div>
                  <p className="font-medium">
                    {t.categoryName ?? (t.type === "transfer" ? "Transfer" : "—")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDateForDisplay(t.occurredAt, settings.locale)} · {t.type}
                    {t.note ? ` · ${t.note}` : ""}
                  </p>
                </div>
                <p className="font-semibold">
                  <MoneyText
                    amountMinor={t.amountMinor}
                    currency={t.currency}
                    locale={settings.locale}
                    signed
                  />
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
