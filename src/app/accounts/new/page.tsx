import Link from "next/link";

import { AccountForm } from "../../_components/forms/AccountForm";
import { getSettings } from "@/db/queries/settings";

export const dynamic = "force-dynamic";

export default function NewAccountPage() {
  const settings = getSettings();
  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">New account</h1>
        <p className="text-sm text-muted-foreground">
          Add a checking, savings, credit card, or cash account.
        </p>
      </div>
      <AccountForm defaultCurrency={settings.defaultCurrency} />
      <Link href="/accounts" className="text-sm text-muted-foreground hover:underline">
        ← Back to accounts
      </Link>
    </div>
  );
}
