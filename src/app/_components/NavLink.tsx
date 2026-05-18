"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Props = {
  href: string;
  label: string;
  exact?: boolean;
};

export function NavLink({ href, label, exact = false }: Props) {
  const pathname = usePathname();
  const active = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={[
        "block rounded-md px-3 py-2 text-sm transition-colors",
        active
          ? "bg-foreground text-background"
          : "text-foreground/80 hover:bg-muted hover:text-foreground",
      ].join(" ")}
    >
      {label}
    </Link>
  );
}
