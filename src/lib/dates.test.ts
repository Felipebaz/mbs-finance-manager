import { describe, expect, it } from "vitest";

import {
  formatIsoDate,
  parseIsoDate,
  startOfMonth,
  startOfNextMonth,
} from "./dates";

describe("parseIsoDate", () => {
  it("parses valid YYYY-MM-DD", () => {
    const d = parseIsoDate("2026-05-18");
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(4);
    expect(d.getDate()).toBe(18);
  });

  it("rejects bad format", () => {
    expect(() => parseIsoDate("18-05-2026")).toThrow(/Invalid ISO date/);
    expect(() => parseIsoDate("2026/05/18")).toThrow(/Invalid ISO date/);
    expect(() => parseIsoDate("")).toThrow();
  });

  it("rejects invalid calendar dates (Feb 30)", () => {
    expect(() => parseIsoDate("2026-02-30")).toThrow(/Invalid calendar date/);
  });

  it("rejects month 13", () => {
    expect(() => parseIsoDate("2026-13-01")).toThrow();
  });
});

describe("formatIsoDate (local components, not UTC)", () => {
  it("round-trips with parseIsoDate", () => {
    const input = "2026-05-18";
    expect(formatIsoDate(parseIsoDate(input))).toBe(input);
  });

  it("round-trips for year-end edge", () => {
    expect(formatIsoDate(parseIsoDate("2026-12-31"))).toBe("2026-12-31");
  });

  it("round-trips for year-start edge", () => {
    expect(formatIsoDate(parseIsoDate("2026-01-01"))).toBe("2026-01-01");
  });

  it("pads single-digit month / day", () => {
    expect(formatIsoDate(parseIsoDate("2026-01-05"))).toBe("2026-01-05");
  });
});

describe("startOfMonth / startOfNextMonth", () => {
  it("startOfMonth returns first day at local midnight", () => {
    const d = startOfMonth(new Date(2026, 4, 18, 14, 30));
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(4);
    expect(d.getDate()).toBe(1);
    expect(d.getHours()).toBe(0);
    expect(d.getMinutes()).toBe(0);
  });

  it("startOfNextMonth rolls year on December", () => {
    const d = startOfNextMonth(new Date(2026, 11, 18));
    expect(d.getFullYear()).toBe(2027);
    expect(d.getMonth()).toBe(0);
    expect(d.getDate()).toBe(1);
  });

  it("startOfNextMonth bridges normal month", () => {
    const d = startOfNextMonth(new Date(2026, 4, 18));
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(5);
    expect(d.getDate()).toBe(1);
  });
});
