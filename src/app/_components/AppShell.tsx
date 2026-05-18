import Link from "next/link";

import { NavLink } from "./NavLink";

const NAV = [
  { href: "/", label: "Dashboard", exact: true },
  { href: "/accounts", label: "Accounts" },
  { href: "/transactions", label: "Transactions" },
  { href: "/categories", label: "Categories" },
  { href: "/settings", label: "Settings" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="border-b border-border bg-muted/30 px-4 py-4 md:w-60 md:border-b-0 md:border-r md:py-6">
        <Link href="/" className="mb-6 hidden text-lg font-semibold tracking-tight md:block">
          Moneta
        </Link>
        <nav className="flex gap-1 overflow-x-auto md:flex-col">
          {NAV.map((item) => (
            <NavLink key={item.href} href={item.href} label={item.label} exact={item.exact} />
          ))}
        </nav>
      </aside>
      <main className="flex-1 px-4 py-6 md:px-8 md:py-10">{children}</main>
    </div>
  );
}
