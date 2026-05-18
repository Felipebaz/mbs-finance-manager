import Link from "next/link";

export const dynamic = "force-dynamic";

import { EmptyState } from "../_components/EmptyState";
import { MoneyText } from "../_components/MoneyText";
import { getSettings } from "@/db/queries/settings";
import { listTransactions } from "@/db/queries/transactions";
import { formatDateForDisplay } from "@/lib/dates";

export default function TransactionsPage() {
  const settings = getSettings();
  const txs = listTransactions(500);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Transactions</h1>
        <Link
          href="/transactions/new"
          className="rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background hover:opacity-90"
        >
          New transaction
        </Link>
      </div>

      {txs.length === 0 ? (
        <EmptyState
          title="No transactions yet"
          description="Add an income, expense, or transfer."
          cta={{ href: "/transactions/new", label: "Add transaction" }}
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-2 font-medium">Date</th>
                <th className="px-4 py-2 font-medium">Account</th>
                <th className="px-4 py-2 font-medium">Category</th>
                <th className="px-4 py-2 font-medium">Type</th>
                <th className="px-4 py-2 font-medium">Note</th>
                <th className="px-4 py-2 text-right font-medium">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {txs.map((t) => (
                <tr key={t.id}>
                  <td className="px-4 py-2 whitespace-nowrap text-muted-foreground">
                    {formatDateForDisplay(t.occurredAt, settings.locale)}
                  </td>
                  <td className="px-4 py-2">{t.accountName}</td>
                  <td className="px-4 py-2">
                    {t.categoryName ? (
                      <span className="inline-flex items-center gap-2">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ background: t.categoryColor ?? "#6b7280" }}
                        />
                        {t.categoryName}
                      </span>
                    ) : t.type === "transfer" ? (
                      <span className="text-muted-foreground">Transfer</span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-2 capitalize">{t.type}</td>
                  <td className="px-4 py-2 text-muted-foreground">{t.note ?? ""}</td>
                  <td className="px-4 py-2 text-right">
                    <MoneyText
                      amountMinor={t.amountMinor}
                      currency={t.currency}
                      locale={settings.locale}
                      signed
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
