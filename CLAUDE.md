@AGENTS.md

# Claude-specific addendum

Project-wide conventions live in `AGENTS.md` (imported above). This file adds Claude-only plumbing — skill registry, authoring entrypoint, and roadmap.

## Skills available in this repo

Skills are installed via [`npx skills`](https://github.com/anthropics/skills) under `.agents/skills/<name>/SKILL.md`. They are picked up automatically by Claude Code (and by Codex / Cursor / Copilot / Amp / Antigravity, since `.agents/skills/` is the universal location).

Two ways to invoke:

- **Automatic** — Claude triggers a skill when the user's request matches its `description` field.
- **Explicit** — type `/<skill-name>` in Claude Code.

| Skill | When it triggers | Location |
|---|---|---|
| `nextjs16-docs-first` | Editing anything under `src/app/`, `next.config.ts`, `middleware.ts`, `proxy.ts`, or importing from `next/*`. Forces a read of bundled Next 16 docs first. | [`.agents/skills/nextjs16-docs-first/SKILL.md`](.agents/skills/nextjs16-docs-first/SKILL.md) |
| `rsc-vs-client` | Creating / editing any React component; deciding whether `"use client"` is needed; composing Server + Client boundaries; auditing client bundles. | [`.agents/skills/rsc-vs-client/SKILL.md`](.agents/skills/rsc-vs-client/SKILL.md) |
| `tailwind-v4` | Editing `*.tsx` with Tailwind classes, `src/app/globals.css`, `postcss.config.mjs`, theme tokens, dark-mode setup, plugins. Catches v3-pattern usage. | [`.agents/skills/tailwind-v4/SKILL.md`](.agents/skills/tailwind-v4/SKILL.md) |
| `moneta-money` | Reading / writing / computing / formatting / parsing any monetary value (balance, amount, total, price, fee, budget, goal, FX). Domain core. | [`.agents/skills/moneta-money/SKILL.md`](.agents/skills/moneta-money/SKILL.md) |
| `skill-creator` | Creating, editing, or evaluating skills. | [`.agents/skills/skill-creator/SKILL.md`](.agents/skills/skill-creator/SKILL.md) |

## Authoring new skills

Use `skill-creator` — it walks through drafting, evals, and description tuning:

    /skill-creator

Or scaffold manually with the `skills` CLI:

    npx skills add <github-source> --skill <skill-name>

New project skills go under `.agents/skills/<kebab-name>/SKILL.md` (committed). After adding one:

1. Add an entry to the table above.
2. Add a matching entry to the `## Skills` section of `AGENTS.md` so non-Claude agents see it too.
3. The `skills-lock.json` at the repo root pins skill sources + hashes — commit it.

## Skill roadmap (not yet implemented)

Candidates for this project, in rough priority order. Pick one up when the corresponding code area gets real work.

- **`moneta-feature-scaffold`** — scaffold a new feature (Accounts / Transactions / Budgets / Goals) consistently: route segment + Server Component page + form actions + types + tests.
- **`server-actions`** — when mutations start landing. `"use server"`, Zod validation at boundary, `revalidatePath` / `revalidateTag`, error handling, no secrets in returned values.
- **`moneta-schema`** — domain model conventions once a persistence layer is chosen.
- **`csv-import`** — when CSV / Open Banking import work begins (column inference, locale-aware decimal parsing, date formats, dedup).
- **`a11y-finance`** — accessibility patterns for money-heavy UIs (screen-reader-friendly amounts, never color-alone for red/green deltas, tabular-nums).
- **`zod-validation`** — when forms / route handlers land. Schema-first, parse at boundary, infer types from schema.
- **`testing-rsc`** — when test suite is chosen (Vitest / Playwright). Unit for pure logic (money math), Playwright for routes, fixtures over mocks for money domain.
- **`security-finance`** — when auth lands. PII redaction in logs, rate-limit on mutations, CSRF posture for Server Actions, session storage rules.
- **`deprecation-radar`** — scan for deprecated Next / React / Tailwind APIs on every relevant edit. Pairs with `nextjs16-docs-first`.

## Notes for Claude specifically

- Before writing any Next.js code, the `nextjs16-docs-first` skill should auto-trigger. Honor it — your training data on Next.js is stale.
- The project is in very early development. README's roadmap is the canonical task list; don't invent features outside it without asking.
- The user's local environment date / role / locale are surfaced via Claude Code context, not this file. Don't hard-code them here.
