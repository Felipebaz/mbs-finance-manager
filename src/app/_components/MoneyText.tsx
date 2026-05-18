import { formatMoneyMinor } from "@/lib/money";

type Props = Readonly<{
  amountMinor: number;
  currency: string;
  locale: string;
  signed?: boolean;
  className?: string;
}>;

function toneFor(amountMinor: number, signed: boolean): string {
  if (!signed) return "";
  if (amountMinor < 0) return "text-negative";
  if (amountMinor > 0) return "text-positive";
  return "";
}

export function MoneyText({ amountMinor, currency, locale, signed = false, className }: Props) {
  const display = formatMoneyMinor(amountMinor, currency, locale);
  const tone = toneFor(amountMinor, signed);
  return (
    <span className={["tabular-nums", tone, className ?? ""].filter(Boolean).join(" ")}>
      {display}
    </span>
  );
}
