import Link from "next/link";

export const dynamic = "force-dynamic";

import { NetWorthChart } from "./_components/charts/NetWorthChart";
import { SpendingByCategoryChart } from "./_components/charts/SpendingByCategoryChart";
import { EmptyState } from "./_components/EmptyState";
import { MoneyText } from "./_components/MoneyText";
import { listAccounts } from "@/db/queries/accounts";
import { getSettings } from "@/db/queries/settings";
import {
  monthlySpendByCategory,
  netWorthSeries,
} from "@/db/queries/transactions";
import { startOfMonth, startOfNextMonth } from "@/lib/dates";

export default function DashboardPage() {
  const settings = getSettings();
  const accounts = listAccounts();
  const baseCurrency = settings.defaultCurrency;

  const totalMinor = accounts
    .filter((a) => a.currency === baseCurrency)
    .reduce((sum, a) => sum + a.balanceMinor, 0);

  const series = netWorthSeries();
  const monthStart = startOfMonth();
  const monthEnd = startOfNextMonth();
  const slices = monthlySpendByCategory(monthStart, monthEnd);

  if (accounts.length === 0) {
    return (
      <div className="space-y-6">
        <Header settings={settings} />
        <EmptyState
          title="No accounts yet"
          description="Create your first account to start tracking balances and transactions."
          cta={{ href: "/accounts/new", label: "Add account" }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Header settings={settings} />

      <section className="rounded-lg border border-border bg-muted/30 p-6">
        <p className="text-sm text-muted-foreground">Net worth ({baseCurrency})</p>
        <p className="mt-1 text-3xl font-semibold">
          <MoneyText amountMinor={totalMinor} currency={baseCurrency} locale={settings.locale} />
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Sum of {baseCurrency}-denominated accounts. Other currencies excluded in v1.
        </p>
      </section>

      <section className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        {accounts.map((a) => (
          <Link
            key={a.id}
            href={`/accounts/${a.id}`}
            className="rounded-lg border border-border bg-background p-4 hover:bg-muted/40"
          >
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              {a.type.replace("_", " ")}
            </p>
            <p className="mt-1 truncate font-medium">{a.name}</p>
            <p className="mt-2 text-lg font-semibold">
              <MoneyText
                amountMinor={a.balanceMinor}
                currency={a.currency}
                locale={settings.locale}
                signed
              />
            </p>
          </Link>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-border p-4">
          <h2 className="mb-2 text-sm font-medium text-muted-foreground">Net worth over time</h2>
          <NetWorthChart data={series} currency={baseCurrency} locale={settings.locale} />
        </div>
        <div className="rounded-lg border border-border p-4">
          <h2 className="mb-2 text-sm font-medium text-muted-foreground">
            Spending by category (this month)
          </h2>
          {slices.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              No expenses recorded this month.
            </p>
          ) : (
            <SpendingByCategoryChart
              slices={slices}
              currency={baseCurrency}
              locale={settings.locale}
            />
          )}
        </div>
      </section>
    </div>
  );
}

type HeaderProps = Readonly<{ settings: { defaultCurrency: string } }>;

function Header({ settings }: HeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Base currency: {settings.defaultCurrency}
        </p>
      </div>
      <Link
        href="/transactions/new"
        className="rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background hover:opacity-90"
      >
        Add transaction
      </Link>
    </div>
  );
}
