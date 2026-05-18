import Link from "next/link";

export const dynamic = "force-dynamic";

import { EmptyState } from "../_components/EmptyState";
import { listCategories } from "@/db/queries/categories";

export default function CategoriesPage() {
  const cats = listCategories();
  const income = cats.filter((c) => c.kind === "income");
  const expense = cats.filter((c) => c.kind === "expense");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Categories</h1>
        <Link
          href="/categories/new"
          className="rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background hover:opacity-90"
        >
          New category
        </Link>
      </div>

      {cats.length === 0 ? (
        <EmptyState
          title="No categories"
          description="Categories help you slice spending and income."
          cta={{ href: "/categories/new", label: "Add category" }}
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <CategoryColumn title="Income" items={income} />
          <CategoryColumn title="Expense" items={expense} />
        </div>
      )}
    </div>
  );
}

type ColumnProps = Readonly<{
  title: string;
  items: { id: number; name: string; color: string }[];
}>;

function CategoryColumn({ title, items }: ColumnProps) {
  return (
    <section className="rounded-lg border border-border">
      <h2 className="border-b border-border px-4 py-2 text-sm font-medium text-muted-foreground">
        {title}
      </h2>
      {items.length === 0 ? (
        <p className="px-4 py-3 text-sm text-muted-foreground">None.</p>
      ) : (
        <ul className="divide-y divide-border">
          {items.map((c) => (
            <li key={c.id} className="flex items-center gap-3 px-4 py-2 text-sm">
              <span
                className="h-3 w-3 rounded-full"
                style={{ background: c.color }}
                aria-hidden
              />
              <span>{c.name}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
