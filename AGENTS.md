# Moneta — agent guide

Personal finance manager. Track accounts, transactions, budgets, and goals.

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript (strict) · Tailwind CSS v4 · Node 20+.

This file is portable across coding agents (Claude Code, Codex, Cursor, GitHub Copilot, Amp, etc.). Claude-specific plumbing (skills, slash commands) lives in `CLAUDE.md`.

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Tailwind v4 specifics

- CSS-first config. Theme tokens live in `src/app/globals.css` inside `@theme inline { … }`.
- Import via `@import "tailwindcss";` — there is no `tailwind.config.js`.
- PostCSS is wired through `@tailwindcss/postcss` (see `postcss.config.mjs`).
- Do **not** create `tailwind.config.js` / `tailwind.config.ts`. Add design tokens to `globals.css`.

## App Router conventions

- App Router only — no `pages/` directory.
- Server Components by default. Add `"use client"` only when a component truly needs it (state, effects, browser APIs, event handlers).
- Path alias `@/*` maps to `src/*` (see `tsconfig.json`).
- Routes live under `src/app/<segment>/`. Use `layout.tsx`, `page.tsx`, `loading.tsx`, `error.tsx`, `route.ts` per Next 16 conventions.

## TypeScript

- `strict: true` is on. Don't widen with `any` casually — if `any` is unavoidable, add a one-line comment explaining why.
- Prefer `type` for plain shapes; `interface` only when extension is genuinely needed.

## Money handling

Money is the domain. Get this wrong and everything downstream lies.

- **Never** store or compute money as JavaScript `number` for fractional values. Use signed integer minor units (e.g. UYU centésimos, EUR cents). The canonical helpers live in `src/lib/money.ts` (`Money`, `parseMoneyInput`, `formatMoney`, `addMoney`/`subMoney`/`sumMoney`, `bankerRound`).
- `Intl.NumberFormat` may only be used inside `src/lib/money.ts` and `src/lib/dates.ts`. Everywhere else, format through `MoneyText` or `formatMoneyMinor`.
- Every monetary row carries an ISO 4217 currency code. Currency mismatch in arithmetic throws.
- v1 sign convention: `amount_minor` is **signed at insert time**. Income +, expense −, transfer-out −, transfer-in +. Per-account balance = `opening_balance_minor + SUM(amount_minor)`. Cross-currency transfers are rejected.
- Locale-aware parsing rejects ambiguous strings (e.g. `"1.5"` in `es-UY` where `.` is the thousands separator).
- Full rules: see `.agents/skills/moneta-money/SKILL.md`.

## Persistence (v1)

- SQLite via `better-sqlite3` + Drizzle ORM. DB file at `data/moneta.db` (git-ignored, created on first request).
- Schema lives in `src/db/schema.ts`; migrations under `drizzle/`. Use `npm run db:generate` after schema edits, `npm run db:migrate` to apply manually (the dev server auto-applies on startup).
- DB client (`src/db/client.ts`) is `import "server-only"`, lazy via a Proxy, with `busy_timeout=5000` and WAL journaling. Every file that touches the DB must import `db` from `@/db/client`.
- **Gotcha:** `better-sqlite3` is a native module. `next.config.ts` declares `serverExternalPackages: ['better-sqlite3']` so Turbopack does not try to bundle the `.node`. Do not remove this.
- Pages that read the DB declare `export const dynamic = "force-dynamic"` to prevent prerender-time DB opens across build workers.
- Mutations go through Server Actions in `src/app/_actions/`. Each Zod-parses `FormData`, performs the write (wrapped in `db.transaction(...)` if multi-row, e.g. transfers), then `revalidatePath(...)` and `redirect(...)`.

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

## How to verify changes

1. `npm run lint` — ESLint passes.
2. `npm run build` — type-check + production build succeed.
3. `npm run dev` → http://localhost:3000 — exercise the changed feature in a browser. Type-check and lint don't verify UI correctness.

## Project layout

```
data/                           # SQLite DB (git-ignored)
drizzle/                        # Generated SQL migrations
src/
├── app/
│   ├── _actions/               # Server Actions (mutations, "use server")
│   ├── _components/            # Shared UI (AppShell, MoneyText, forms, charts)
│   ├── accounts/               # /accounts, /accounts/[id], /accounts/new
│   ├── categories/             # /categories, /categories/new
│   ├── settings/               # /settings
│   ├── transactions/           # /transactions, /transactions/new
│   ├── layout.tsx              # Root layout (AppShell wrapper)
│   ├── loading.tsx             # Global skeleton
│   ├── error.tsx               # Global error boundary (client)
│   ├── not-found.tsx           # Global 404
│   ├── page.tsx                # Dashboard
│   └── globals.css             # Tailwind import + theme tokens (incl. chart colors)
├── db/                         # Drizzle schema, lazy client, queries, seed
└── lib/                        # money, currency, dates, validation, types
```

`README.md` is the source of truth for the roadmap and external-facing project description.

## Skills

This repo ships agent skills under `.agents/skills/<name>/SKILL.md`. They are installed via [`npx skills`](https://github.com/anthropics/skills) and work across multiple coding agents.

- [`nextjs16-docs-first`](.agents/skills/nextjs16-docs-first/SKILL.md) — read bundled Next 16 docs before editing route / component / config code.
- [`rsc-vs-client`](.agents/skills/rsc-vs-client/SKILL.md) — Server vs Client Component discipline; when `"use client"` is required and when it's waste.
- [`tailwind-v4`](.agents/skills/tailwind-v4/SKILL.md) — Tailwind v4 CSS-first config rules; no `tailwind.config.js`.
- [`moneta-money`](.agents/skills/moneta-money/SKILL.md) — money handling: integer minor units, ISO 4217 currency, `Intl.NumberFormat` at UI boundary, no floats.
- [`skill-creator`](.agents/skills/skill-creator/SKILL.md) — scaffold and iterate on new skills.

To add another skill: `npx skills add <source>` or use `skill-creator` to author one. Any new skill **must** be listed here so other agents can discover it.
