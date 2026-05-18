# Moneta

Personal finance manager. Track accounts, transactions, budgets, and goals — all in one focused dashboard.

> Named after Moneta, the Roman goddess of money and guardian of coinage.

## Status

**v1 (local-only, single-user) — working.** Accounts, transactions (income/expense/transfer), categories, dashboard with net-worth total and charts. Data persists to a local SQLite file (`data/moneta.db`, git-ignored). No auth — single local user assumed.

## Tech stack

- **Framework:** [Next.js 16](https://nextjs.org) (App Router) · React 19
- **Language:** TypeScript (strict)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com) (CSS-first config, no `tailwind.config.js`)
- **DB:** [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) + [Drizzle ORM](https://orm.drizzle.team)
- **Validation:** [Zod](https://zod.dev)
- **Charts:** [Recharts](https://recharts.org)
- **Runtime:** Node.js 20+

## Getting started

### Prerequisites

- Node.js 20 or newer
- npm 10 or newer

### Install

```bash
npm install
```

### Develop

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The SQLite file is created automatically on first request (`data/moneta.db`); migrations and a default-category seed run on first DB access.

### Production build

```bash
npm run build
npm run start
```

## Scripts

| Script               | Purpose                                                |
| -------------------- | ------------------------------------------------------ |
| `npm run dev`        | Start dev server (Turbopack)                           |
| `npm run build`      | Production build + type-check                          |
| `npm run start`      | Run built production server                            |
| `npm run lint`       | Run ESLint                                             |
| `npm run db:generate`| Generate Drizzle migration from `src/db/schema.ts`     |
| `npm run db:migrate` | Apply pending migrations to `data/moneta.db`           |
| `npm run db:studio`  | Open Drizzle Studio                                    |
| `npm run db:seed`    | Run seed (idempotent — settings + default categories)  |

## Project structure

```
moneta/
├── data/                       # SQLite DB (git-ignored)
├── drizzle/                    # Generated SQL migrations
├── public/                     # Static assets
├── src/
│   ├── app/                    # App Router
│   │   ├── _actions/           # Server Actions (mutations)
│   │   ├── _components/        # Shared components (forms, charts, shell)
│   │   ├── accounts/           # /accounts, /accounts/[id], /accounts/new
│   │   ├── categories/         # /categories, /categories/new
│   │   ├── settings/           # /settings
│   │   ├── transactions/       # /transactions, /transactions/new
│   │   ├── layout.tsx          # Root layout (AppShell wrapper)
│   │   ├── loading.tsx         # Global loading skeleton
│   │   ├── error.tsx           # Global error boundary (client)
│   │   ├── not-found.tsx       # Global 404
│   │   ├── page.tsx            # Dashboard
│   │   └── globals.css         # Tailwind import + theme tokens
│   ├── db/                     # Drizzle schema, client, queries, seed
│   └── lib/                    # money, currency, dates, validation, types
├── drizzle.config.ts
├── eslint.config.mjs
├── next.config.ts
├── postcss.config.mjs
├── tsconfig.json
└── package.json
```

Path alias `@/*` maps to `src/*`.

## Roadmap

- [x] Accounts (checking, savings, credit card, cash)
- [x] Transactions (income / expense / transfer, manual entry, categorization)
- [x] Persistence layer (SQLite via better-sqlite3 + Drizzle)
- [x] Dashboard reports (net worth, balances, spending-by-category, net-worth over time)
- [ ] Investment accounts (positions / holdings)
- [ ] Budgets (monthly limits per category)
- [ ] Goals (savings targets with progress)
- [ ] Richer reports (cash flow, trends, custom ranges)
- [ ] Import (CSV / Open Banking)
- [ ] Multi-currency support (FX rates, mixed-currency totals)
- [ ] Authentication
- [ ] Archive / delete UI for accounts, categories, transactions

## Conventions

- App Router only — no `pages/` directory
- Server Components by default; `"use client"` only when needed (charts, forms with `useActionState`/`useFormStatus`)
- Mutations through Server Actions in `src/app/_actions/`, Zod-validated
- Money stored as signed integer minor units + ISO 4217 currency code; `Intl.NumberFormat` only inside `src/lib/money.ts`
- Tailwind v4 utility-first; theme tokens in `src/app/globals.css`
- Strict TypeScript

## License

TBD.
