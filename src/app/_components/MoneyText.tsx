import { formatMoneyMinor } from "@/lib/money";

type Props = {
  amountMinor: number;
  currency: string;
  locale: string;
  signed?: boolean;
  className?: string;
};

export function MoneyText({ amountMinor, currency, locale, signed = false, className }: Props) {
  const negative = amountMinor < 0;
  const display = formatMoneyMinor(amountMinor, currency, locale);
  const tone = signed
    ? negative
      ? "text-negative"
      : amountMinor > 0
        ? "text-positive"
        : ""
    : "";
  return (
    <span className={["tabular-nums", tone, className ?? ""].filter(Boolean).join(" ")}>
      {display}
    </span>
  );
}
