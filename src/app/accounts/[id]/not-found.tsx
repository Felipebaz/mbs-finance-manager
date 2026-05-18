import Link from "next/link";

export default function AccountNotFound() {
  return (
    <div className="rounded-lg border border-border bg-muted/30 p-8 text-center">
      <h2 className="text-lg font-semibold">Account not found</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        The account you were looking for does not exist or was archived.
      </p>
      <Link
        href="/accounts"
        className="mt-4 inline-flex items-center rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background hover:opacity-90"
      >
        Back to accounts
      </Link>
    </div>
  );
}
