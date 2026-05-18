"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatMoneyMinor } from "@/lib/money";

type Point = { date: string; totalMinor: number };

type Props = Readonly<{
  data: Point[];
  currency: string;
  locale: string;
}>;

export function NetWorthChart({ data, currency, locale }: Props) {
  const fmtMoney = (v: number) => formatMoneyMinor(v, currency, locale);
  const fmtDate = (v: string) =>
    new Intl.DateTimeFormat(locale, { month: "short", day: "2-digit" }).format(
      new Date(`${v}T00:00:00`),
    );

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis
            dataKey="date"
            tickFormatter={fmtDate}
            stroke="var(--muted-foreground)"
            fontSize={12}
          />
          <YAxis
            tickFormatter={fmtMoney}
            stroke="var(--muted-foreground)"
            fontSize={12}
            width={90}
          />
          <Tooltip
            contentStyle={{
              background: "var(--background)",
              border: "1px solid var(--border)",
              borderRadius: 6,
            }}
            labelFormatter={(label) => fmtDate(String(label))}
            formatter={(value: number) => [fmtMoney(value), "Net worth"]}
          />
          <Line
            type="monotone"
            dataKey="totalMinor"
            stroke="var(--accent)"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
