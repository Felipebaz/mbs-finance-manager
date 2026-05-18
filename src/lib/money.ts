import { minorUnits } from "./currency";

export type Money = { amount: number; currency: string };

export function money(amount: number, currency: string): Money {
  return { amount, currency };
}

export function bankerRound(n: number): number {
  const floor = Math.floor(n);
  const diff = n - floor;
  if (diff < 0.5) return floor;
  if (diff > 0.5) return floor + 1;
  return floor % 2 === 0 ? floor : floor + 1;
}

function detectLocaleSeparators(locale: string): { group: string; decimal: string } {
  const parts = new Intl.NumberFormat(locale).formatToParts(12345.6);
  const group = parts.find((p) => p.type === "group")?.value ?? ",";
  const decimal = parts.find((p) => p.type === "decimal")?.value ?? ".";
  return { group, decimal };
}

export function parseMoneyInput(raw: string, currency: string, locale: string): Money {
  const cleaned = raw.replace(/\s/g, "").replace(/[^\d.,-]/g, "");
  if (cleaned === "" || cleaned === "-") {
    throw new Error("Empty amount.");
  }

  const negative = cleaned.startsWith("-");
  const body = negative ? cleaned.slice(1) : cleaned;

  const { group, decimal } = detectLocaleSeparators(locale);
  const hasGroup = body.includes(group);
  const hasDecimal = body.includes(decimal);

  let normalized: string;
  if (hasDecimal) {
    normalized = body.split(group).join("").replace(decimal, ".");
  } else if (hasGroup) {
    const segs = body.split(group);
    if (segs.length === 2 && segs[1].length !== 3) {
      throw new Error(`Ambiguous amount "${raw}" for locale ${locale}.`);
    }
    normalized = segs.join("");
  } else {
    normalized = body;
  }

  if (!/^\d+(\.\d+)?$/.test(normalized)) {
    throw new Error(`Cannot parse amount "${raw}".`);
  }

  const minor = minorUnits(currency);
  const asFloat = Number(normalized) * 10 ** minor;
  const amount = bankerRound(asFloat);
  return { amount: negative ? -amount : amount, currency: currency.toUpperCase() };
}

export function formatMoney(m: Money, locale: string): string {
  const minor = minorUnits(m.currency);
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: m.currency,
  }).format(m.amount / 10 ** minor);
}

export function formatMoneyMinor(amountMinor: number, currency: string, locale: string): string {
  return formatMoney({ amount: amountMinor, currency }, locale);
}

function assertSameCurrency(a: Money, b: Money): void {
  if (a.currency !== b.currency) {
    throw new Error(`Currency mismatch: ${a.currency} vs ${b.currency}.`);
  }
}

export function addMoney(a: Money, b: Money): Money {
  assertSameCurrency(a, b);
  return { amount: a.amount + b.amount, currency: a.currency };
}

export function subMoney(a: Money, b: Money): Money {
  assertSameCurrency(a, b);
  return { amount: a.amount - b.amount, currency: a.currency };
}

export function negateMoney(m: Money): Money {
  return { amount: -m.amount, currency: m.currency };
}

export function sumMoney(items: Money[], currency: string): Money {
  let total = 0;
  for (const m of items) {
    if (m.currency !== currency) {
      throw new Error(`Currency mismatch in sum: ${m.currency} vs ${currency}.`);
    }
    total += m.amount;
  }
  return { amount: total, currency };
}

export function moneyIsNegative(m: Money): boolean {
  return m.amount < 0;
}

export function moneyIsZero(m: Money): boolean {
  return m.amount === 0;
}
