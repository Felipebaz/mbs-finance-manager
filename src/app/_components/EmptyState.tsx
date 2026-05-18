import Link from "next/link";

type Props = {
  title: string;
  description?: string;
  cta?: { href: string; label: string };
};

export function EmptyState({ title, description, cta }: Props) {
  return (
    <div className="rounded-lg border border-border bg-muted/40 p-8 text-center">
      <h3 className="text-base font-semibold">{title}</h3>
      {description ? (
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      ) : null}
      {cta ? (
        <Link
          href={cta.href}
          className="mt-4 inline-flex items-center rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background hover:opacity-90"
        >
          {cta.label}
        </Link>
      ) : null}
    </div>
  );
}
