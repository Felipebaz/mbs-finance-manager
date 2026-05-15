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

- **Never** store or compute money as JavaScript `number` (floats). Use integer minor units (e.g. cents) or a decimal library when one lands.
- Format with `Intl.NumberFormat` at the UI boundary — not in the data layer.
- Multi-currency is on the roadmap: every monetary value should carry an ISO 4217 currency code alongside its amount.

(This section will be tightened once a persistence layer and decimal library are chosen — see the roadmap in `README.md`.)

## Scripts

| Script          | Purpose                          |
| --------------- | -------------------------------- |
| `npm run dev`   | Start dev server (Turbopack)     |
| `npm run build` | Production build + type-check    |
| `npm run start` | Run built production server      |
| `npm run lint`  | Run ESLint                       |

## How to verify changes

1. `npm run lint` — ESLint passes.
2. `npm run build` — type-check + production build succeed.
3. `npm run dev` → http://localhost:3000 — exercise the changed feature in a browser. Type-check and lint don't verify UI correctness.

## Project layout

```
src/
└── app/
    ├── layout.tsx     # Root layout + metadata + fonts
    ├── page.tsx       # Home
    └── globals.css    # Tailwind import + theme tokens
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
