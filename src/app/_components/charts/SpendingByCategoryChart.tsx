"use client";

import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import { formatMoneyMinor } from "@/lib/money";

type Slice = {
  categoryId: number | null;
  name: string;
  color: string;
  amountMinor: number;
};

type Props = Readonly<{
  slices: Slice[];
  currency: string;
  locale: string;
}>;

export function SpendingByCategoryChart({ slices, currency, locale }: Props) {
  const fmt = (v: number) => formatMoneyMinor(v, currency, locale);

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={slices}
            dataKey="amountMinor"
            nameKey="name"
            innerRadius={50}
            outerRadius={90}
            paddingAngle={2}
          >
            {slices.map((s) => (
              <Cell key={s.categoryId ?? s.name} fill={s.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: "var(--background)",
              border: "1px solid var(--border)",
              borderRadius: 6,
            }}
            formatter={(value, name) => [fmt(Number(value)), String(name)]}
          />
          <Legend
            verticalAlign="bottom"
            wrapperStyle={{ fontSize: 12 }}
            formatter={(value: string) => value}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
