import { describe, expect, it } from "vitest";

import { isLikelyIsoCurrency, minorUnits } from "./currency";

describe("minorUnits", () => {
  it("returns 2 for common currencies", () => {
    expect(minorUnits("UYU")).toBe(2);
    expect(minorUnits("EUR")).toBe(2);
    expect(minorUnits("USD")).toBe(2);
    expect(minorUnits("GBP")).toBe(2);
    expect(minorUnits("ARS")).toBe(2);
    expect(minorUnits("BRL")).toBe(2);
  });

  it("returns 0 for zero-decimal currencies", () => {
    expect(minorUnits("JPY")).toBe(0);
    expect(minorUnits("KRW")).toBe(0);
    expect(minorUnits("CLP")).toBe(0);
  });

  it("returns 3 for three-decimal currencies", () => {
    expect(minorUnits("BHD")).toBe(3);
    expect(minorUnits("KWD")).toBe(3);
    expect(minorUnits("TND")).toBe(3);
  });

  it("is case-insensitive", () => {
    expect(minorUnits("uyu")).toBe(2);
    expect(minorUnits("jpy")).toBe(0);
  });

  it("falls back via Intl for unlisted codes", () => {
    expect(minorUnits("CAD")).toBe(2);
  });

  it("falls back to 2 for unknown codes", () => {
    expect(minorUnits("ZZZ")).toBe(2);
  });
});

describe("isLikelyIsoCurrency", () => {
  it("accepts well-known codes", () => {
    expect(isLikelyIsoCurrency("UYU")).toBe(true);
    expect(isLikelyIsoCurrency("USD")).toBe(true);
    expect(isLikelyIsoCurrency("EUR")).toBe(true);
    expect(isLikelyIsoCurrency("JPY")).toBe(true);
  });

  it("rejects lowercase (caller must uppercase first)", () => {
    expect(isLikelyIsoCurrency("usd")).toBe(false);
  });

  it("rejects wrong length", () => {
    expect(isLikelyIsoCurrency("US")).toBe(false);
    expect(isLikelyIsoCurrency("USDX")).toBe(false);
  });

  it("rejects digits", () => {
    expect(isLikelyIsoCurrency("US1")).toBe(false);
  });

  it("rejects empty / whitespace", () => {
    expect(isLikelyIsoCurrency("")).toBe(false);
    expect(isLikelyIsoCurrency("   ")).toBe(false);
  });
});
