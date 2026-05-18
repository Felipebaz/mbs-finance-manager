import Link from "next/link";

import { CategoryForm } from "../../_components/forms/CategoryForm";

export default function NewCategoryPage() {
  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">New category</h1>
        <p className="text-sm text-muted-foreground">
          Categories tag income and expense transactions for breakdowns.
        </p>
      </div>
      <CategoryForm />
      <Link href="/categories" className="text-sm text-muted-foreground hover:underline">
        ← Back to categories
      </Link>
    </div>
  );
}
