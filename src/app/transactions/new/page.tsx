import Link from "next/link";

import { TransactionForm } from "../../_components/forms/TransactionForm";
import { EmptyState } from "../../_components/EmptyState";
import { listActiveAccountsBasic } from "@/db/queries/accounts";
import { listCategories } from "@/db/queries/categories";
import { formatIsoDate } from "@/lib/dates";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ accountId?: string }>;

export default async function NewTransactionPage({
  searchParams,
}: Readonly<{ searchParams: SearchParams }>) {
  const { accountId } = await searchParams;
  const accounts = listActiveAccountsBasic();
  const categories = listCategories().filter(
    (c) => c.kind === "income" || c.kind === "expense",
  );

  if (accounts.length === 0) {
    return (
      <div className="mx-auto max-w-xl space-y-6">
        <h1 className="text-2xl font-semibold tracking-tight">New transaction</h1>
        <EmptyState
          title="No accounts yet"
          description="Add an account before recording transactions."
          cta={{ href: "/accounts/new", label: "Add account" }}
        />
      </div>
    );
  }

  const accountOpts = accounts.map((a) => ({
    id: a.id,
    name: a.name,
    currency: a.currency,
  }));
  const categoryOpts = categories.map((c) => ({
    id: c.id,
    name: c.name,
    kind: c.kind,
  }));

  const defaultAccountId = accountId ? Number(accountId) : undefined;
  const defaultDate = formatIsoDate(new Date());

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">New transaction</h1>
        <p className="text-sm text-muted-foreground">
          Record an income, expense, or transfer between accounts.
        </p>
      </div>
      <TransactionForm
        accounts={accountOpts}
        categories={categoryOpts}
        defaultAccountId={defaultAccountId}
        defaultDate={defaultDate}
      />
      <Link href="/transactions" className="text-sm text-muted-foreground hover:underline">
        ← Back to transactions
      </Link>
    </div>
  );
}
