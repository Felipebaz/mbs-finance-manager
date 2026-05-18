import { getSettings } from "@/db/queries/settings";

export const dynamic = "force-dynamic";

export default function SettingsPage() {
  const s = getSettings();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
      <div className="rounded-lg border border-border p-4">
        <dl className="grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">
              Default currency
            </dt>
            <dd className="mt-1 font-medium">{s.defaultCurrency}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">Locale</dt>
            <dd className="mt-1 font-medium">{s.locale}</dd>
          </div>
        </dl>
        <p className="mt-4 text-xs text-muted-foreground">
          Editable settings UI lands in Phase 7.
        </p>
      </div>
    </div>
  );
}
