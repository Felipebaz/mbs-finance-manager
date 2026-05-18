const MINOR_UNITS_OVERRIDE: Record<string, number> = {
  UYU: 2,
  ARS: 2,
  BRL: 2,
  CLP: 0,
  EUR: 2,
  USD: 2,
  GBP: 2,
  CHF: 2,
  JPY: 0,
  KRW: 0,
  BHD: 3,
  KWD: 3,
  TND: 3,
};

export function minorUnits(currency: string): number {
  const code = currency.toUpperCase();
  if (code in MINOR_UNITS_OVERRIDE) return MINOR_UNITS_OVERRIDE[code];
  try {
    const opts = new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: code,
    }).resolvedOptions();
    return opts.maximumFractionDigits ?? 2;
  } catch {
    return 2;
  }
}

const ISO_CODE = /^[A-Z]{3}$/;

export function isLikelyIsoCurrency(code: string): boolean {
  if (!ISO_CODE.test(code)) return false;
  try {
    new Intl.NumberFormat(undefined, { style: "currency", currency: code });
    return true;
  } catch {
    return false;
  }
}
