---
name: moneta-money
description: >
  Money handling rules for Moneta — the personal finance domain core. Use when
  reading, writing, computing, comparing, formatting, parsing, storing, or
  transmitting any monetary value. Triggers on code touching account balances,
  transaction amounts, budget limits, goal targets, prices, fees, totals,
  currency conversion, or anything named amount/balance/total/sum/price/cost/fee
  /value with a currency dimension. Enforces integer minor units, no floats,
  ISO 4217 currency codes, Intl.NumberFormat at the UI boundary only.
---

# Money handling — Moneta domain rules

Money is the domain. Get it wrong once and every report downstream lies. These rules are non-negotiable.

## Rule 1 — never use `number` for money

JavaScript `number` is IEEE-754 double. `0.1 + 0.2 !== 0.3`. Banking math compounds error. Forbidden:

```ts
// BAD
const balance: number = 12.34;
const total = a + b;                 // float add — silently wrong
JSON.parse(`{"amount": 12.34}`);     // float on the wire
```

Use one of:

1. **Integer minor units** (preferred for storage + arithmetic). Store cents (or the currency's actual minor unit) as `number` (safe up to 2^53 ≈ 9 quadrillion minor units) or `bigint` if amounts can exceed that.
2. **A decimal library** (`decimal.js`, `dinero.js`, `big.js`) when fractional units beyond the currency's minor unit are needed (interest accrual, FX intermediate). Not yet in this project — confirm choice with user before pulling one in.

```ts
// GOOD
type Money = { amount: number; currency: string };  // amount in minor units
const balance: Money = { amount: 1234, currency: "EUR" };  // €12.34
```

## Rule 2 — always pair amount with currency

Every monetary value carries an ISO 4217 currency code. No bare amounts in:

- Database columns (always a sibling `currency` column or composite type).
- API payloads.
- Function signatures.
- React props.

```ts
// BAD
function transfer(from: Account, to: Account, amount: number) {}

// GOOD
function transfer(from: Account, to: Account, money: Money) {}
```

Validate currency codes against ISO 4217 (3 uppercase letters). When in doubt, use `Intl.supportedValuesOf("currency")` for the allowlist.

## Rule 3 — never mix currencies without explicit conversion

Adding EUR to USD is meaningless without a rate + timestamp.

```ts
// BAD
const total = eurAmount.amount + usdAmount.amount;

// GOOD
function add(a: Money, b: Money): Money {
  if (a.currency !== b.currency) {
    throw new Error(`Currency mismatch: ${a.currency} vs ${b.currency}`);
  }
  return { amount: a.amount + b.amount, currency: a.currency };
}
```

Conversion is a separate, explicit operation — takes a rate, records the rate + timestamp on the resulting record.

## Rule 4 — format at the UI boundary only

`Intl.NumberFormat` is for display. Never store formatted strings. Never parse formatted strings inside the data layer.

```ts
// GOOD — UI boundary
function formatMoney({ amount, currency }: Money, locale: string) {
  const minor = minorUnits(currency);  // 2 for EUR/USD, 0 for JPY, 3 for BHD
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(amount / 10 ** minor);
}
```

Minor-unit counts vary by currency. Hard-coding `/ 100` works for EUR/USD/GBP and breaks for JPY (0), BHD/KWD (3). Centralize the lookup.

## Rule 5 — round explicitly, document the mode

When a result has fractional minor units (interest, FX, split bills), round explicitly. Default to **banker's rounding** (half-to-even) for financial math unless the user specifies otherwise. Document the choice next to the math.

```ts
function bankerRound(n: number): number {
  const floor = Math.floor(n);
  const diff = n - floor;
  if (diff < 0.5) return floor;
  if (diff > 0.5) return floor + 1;
  return floor % 2 === 0 ? floor : floor + 1;
}
```

## Rule 6 — parse input defensively

User input comes in many shapes: `"1.234,56"`, `"1,234.56"`, `"$12.34"`, `"€1.234,56"`. Parsing is locale-dependent.

- At the UI / import boundary: detect or be told the locale, then parse.
- Reject ambiguous input rather than guess. `"1,234"` is 1.234 in `de-DE` and 1234 in `en-US`.
- Store the parsed `Money` (minor units + currency), never the raw string.

## Rule 7 — DB / wire format

- DB column: store minor units as `BIGINT` (or `INTEGER` if scale is small) plus a `currency CHAR(3)` column. Never `FLOAT` / `DOUBLE` / `REAL`.
- API payload: `{ "amount": 1234, "currency": "EUR" }` — integer minor units + ISO code. Never a decimal string unless using a decimal library on both ends.
- TypeScript: `type Money = { amount: number; currency: string }` until a richer type lands.

## Rule 8 — logging + redaction

Treat amounts as moderately sensitive. In logs:

- Account balances and transaction amounts can be logged at DEBUG, not INFO.
- Never log full account numbers alongside amounts.
- For audit logs, log explicitly and store the minor-units integer + currency, not a formatted string.

## Quick checklist before approving money-touching code

1. [ ] No `number` arithmetic on user-facing decimal money values.
2. [ ] Every monetary value paired with a currency code.
3. [ ] No cross-currency arithmetic without an explicit conversion step.
4. [ ] No `Intl.NumberFormat` outside UI / serialization boundary.
5. [ ] Rounding mode documented when applicable.
6. [ ] Input parsing rejects ambiguous formats.
7. [ ] DB columns are integer + currency, not float.

## When persistence lands

This skill will be tightened with concrete table shapes and a chosen decimal library. Until then, prefer integer minor units + the `Money` type above.
