import { describe, expect, it } from "vitest";

import {
  addMoney,
  bankerRound,
  formatMoney,
  formatMoneyMinor,
  money,
  moneyIsNegative,
  moneyIsZero,
  negateMoney,
  parseMoneyInput,
  subMoney,
  sumMoney,
} from "./money";

describe("bankerRound (half-to-even)", () => {
  it("rounds non-halves to the nearest integer", () => {
    expect(bankerRound(1.4)).toBe(1);
    expect(bankerRound(1.6)).toBe(2);
    expect(bankerRound(-1.4)).toBe(-1); // Math.floor(-1.4) = -2, diff = 0.6 → -1
    expect(bankerRound(-1.6)).toBe(-2); // Math.floor(-1.6) = -2, diff = 0.4 → -2
  });

  it("rounds exact halves to the nearest even integer", () => {
    expect(bankerRound(0.5)).toBe(0);
    expect(bankerRound(1.5)).toBe(2);
    expect(bankerRound(2.5)).toBe(2);
    expect(bankerRound(3.5)).toBe(4);
    expect(bankerRound(4.5)).toBe(4);
  });

  it("handles integers as-is", () => {
    expect(bankerRound(0)).toBe(0);
    expect(bankerRound(7)).toBe(7);
    expect(bankerRound(-7)).toBe(-7);
  });
});

describe("parseMoneyInput", () => {
  describe("es-UY (group=., decimal=,)", () => {
    it("parses thousands + decimals", () => {
      expect(parseMoneyInput("10.000,50", "UYU", "es-UY")).toEqual({
        amount: 1_000_050,
        currency: "UYU",
      });
    });

    it("parses plain decimal", () => {
      expect(parseMoneyInput("1,5", "UYU", "es-UY")).toEqual({
        amount: 150,
        currency: "UYU",
      });
    });

    it("parses thousands without decimals", () => {
      expect(parseMoneyInput("1.500", "UYU", "es-UY")).toEqual({
        amount: 150_000,
        currency: "UYU",
      });
    });

    it("rejects ambiguous '1.5' (single dot, non-3-digit tail)", () => {
      expect(() => parseMoneyInput("1.5", "UYU", "es-UY")).toThrow(/Ambiguous/i);
    });

    it("handles negative values (credit card opening balance)", () => {
      expect(parseMoneyInput("-1.000,00", "UYU", "es-UY")).toEqual({
        amount: -100_000,
        currency: "UYU",
      });
    });

    it("strips currency symbol and whitespace", () => {
      expect(parseMoneyInput("$ 100,00", "UYU", "es-UY")).toEqual({
        amount: 10_000,
        currency: "UYU",
      });
    });
  });

  describe("en-US (group=,, decimal=.)", () => {
    it("parses thousands + decimals", () => {
      expect(parseMoneyInput("1,234.56", "USD", "en-US")).toEqual({
        amount: 123_456,
        currency: "USD",
      });
    });

    it("parses plain decimal", () => {
      expect(parseMoneyInput("12.34", "USD", "en-US")).toEqual({
        amount: 1234,
        currency: "USD",
      });
    });

    it("parses thousands without decimals", () => {
      expect(parseMoneyInput("1,234", "USD", "en-US")).toEqual({
        amount: 123_400,
        currency: "USD",
      });
    });

    it("rejects ambiguous '1,23' (single comma, non-3-digit tail)", () => {
      expect(() => parseMoneyInput("1,23", "USD", "en-US")).toThrow(/Ambiguous/i);
    });

    it("strips currency symbol", () => {
      expect(parseMoneyInput("$12.34", "USD", "en-US")).toEqual({
        amount: 1234,
        currency: "USD",
      });
    });
  });

  describe("zero-decimal currencies", () => {
    it("treats JPY as integer minor units (no decimals)", () => {
      expect(parseMoneyInput("1500", "JPY", "ja-JP")).toEqual({
        amount: 1500,
        currency: "JPY",
      });
    });
  });

  describe("three-decimal currencies", () => {
    it("scales BHD by 1000", () => {
      expect(parseMoneyInput("1.234", "BHD", "en-US")).toEqual({
        amount: 1234,
        currency: "BHD",
      });
    });
  });

  describe("invalid input", () => {
    it("rejects empty string", () => {
      expect(() => parseMoneyInput("", "UYU", "es-UY")).toThrow(/Empty/i);
    });

    it("rejects bare minus", () => {
      expect(() => parseMoneyInput("-", "UYU", "es-UY")).toThrow(/Empty/i);
    });

    it("rejects garbage", () => {
      expect(() => parseMoneyInput("abc", "UYU", "es-UY")).toThrow();
    });
  });

  it("uppercases currency code", () => {
    expect(parseMoneyInput("1", "uyu", "es-UY").currency).toBe("UYU");
  });

  it("avoids float drift on common inputs", () => {
    const a = parseMoneyInput("0.10", "USD", "en-US");
    const b = parseMoneyInput("0.20", "USD", "en-US");
    expect(addMoney(a, b)).toEqual({ amount: 30, currency: "USD" });
  });
});

describe("formatMoney", () => {
  it("formats EUR in en-IE", () => {
    expect(formatMoney({ amount: 123_456, currency: "EUR" }, "en-IE")).toContain("1,234.56");
  });

  it("formats UYU in es-UY (decimal comma, dot thousands)", () => {
    const out = formatMoney({ amount: 100_050, currency: "UYU" }, "es-UY");
    expect(out).toContain("1.000,50");
  });

  it("formats JPY without decimals", () => {
    expect(formatMoney({ amount: 1500, currency: "JPY" }, "ja-JP")).toContain("1,500");
    expect(formatMoney({ amount: 1500, currency: "JPY" }, "ja-JP")).not.toContain(".");
  });

  it("formats BHD with three decimals", () => {
    expect(formatMoney({ amount: 1234, currency: "BHD" }, "en-US")).toContain("1.234");
  });

  it("formatMoneyMinor matches formatMoney", () => {
    expect(formatMoneyMinor(1234, "USD", "en-US")).toBe(
      formatMoney({ amount: 1234, currency: "USD" }, "en-US"),
    );
  });
});

describe("addMoney / subMoney / negateMoney", () => {
  it("adds same currency", () => {
    expect(addMoney(money(100, "UYU"), money(50, "UYU"))).toEqual(money(150, "UYU"));
  });

  it("subtracts same currency", () => {
    expect(subMoney(money(100, "UYU"), money(30, "UYU"))).toEqual(money(70, "UYU"));
  });

  it("negates", () => {
    expect(negateMoney(money(100, "UYU"))).toEqual(money(-100, "UYU"));
    expect(negateMoney(money(-100, "UYU"))).toEqual(money(100, "UYU"));
  });

  it("throws on currency mismatch in add", () => {
    expect(() => addMoney(money(100, "UYU"), money(50, "USD"))).toThrow(/Currency mismatch/);
  });

  it("throws on currency mismatch in sub", () => {
    expect(() => subMoney(money(100, "UYU"), money(50, "USD"))).toThrow(/Currency mismatch/);
  });
});

describe("sumMoney", () => {
  it("sums an empty array as 0", () => {
    expect(sumMoney([], "UYU")).toEqual(money(0, "UYU"));
  });

  it("sums same currency", () => {
    expect(sumMoney([money(100, "UYU"), money(50, "UYU"), money(-25, "UYU")], "UYU")).toEqual(
      money(125, "UYU"),
    );
  });

  it("throws when any item differs from target currency", () => {
    expect(() => sumMoney([money(100, "UYU"), money(50, "USD")], "UYU")).toThrow(
      /Currency mismatch/,
    );
  });
});

describe("predicates", () => {
  it("moneyIsNegative", () => {
    expect(moneyIsNegative(money(-1, "UYU"))).toBe(true);
    expect(moneyIsNegative(money(0, "UYU"))).toBe(false);
    expect(moneyIsNegative(money(1, "UYU"))).toBe(false);
  });

  it("moneyIsZero", () => {
    expect(moneyIsZero(money(0, "UYU"))).toBe(true);
    expect(moneyIsZero(money(1, "UYU"))).toBe(false);
    expect(moneyIsZero(money(-1, "UYU"))).toBe(false);
  });
});
