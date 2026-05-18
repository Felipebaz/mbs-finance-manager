import { SettingsForm } from "../_components/forms/SettingsForm";
import { getSettings } from "@/db/queries/settings";

export const dynamic = "force-dynamic";

export default function SettingsPage() {
  const s = getSettings();

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Default currency drives the net-worth total. Locale drives formatting.
        </p>
      </div>
      <SettingsForm defaultCurrency={s.defaultCurrency} locale={s.locale} />
    </div>
  );
}
