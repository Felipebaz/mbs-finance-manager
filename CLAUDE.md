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

- **`tailwind-v4`** — Tailwind v4 CSS-first config rules: `@theme inline`, `@import "tailwindcss"`, no `tailwind.config.js`. Trigger on edits to `globals.css` or any `*.tsx` using Tailwind classes that look like v3 idioms.
- **`moneta-money`** — money handling: integer minor units, decimal library use, `Intl.NumberFormat` only at the UI boundary, ISO 4217 currency codes. Trigger on any code that reads/writes a monetary amount.
- **`moneta-feature-scaffold`** — scaffold a new feature (Accounts / Transactions / Budgets / Goals) consistently: route segment + Server Component page + form actions + types + tests.
- **`moneta-schema`** — domain model conventions once a persistence layer is chosen.
- **`csv-import`** — when CSV / Open Banking import work begins (column inference, locale-aware decimal parsing, date formats, dedup).
- **`a11y-finance`** — accessibility patterns for money-heavy UIs (screen-reader-friendly amounts, never color-alone for red/green deltas).

## Notes for Claude specifically

- Before writing any Next.js code, the `nextjs16-docs-first` skill should auto-trigger. Honor it — your training data on Next.js is stale.
- The project is in very early development. README's roadmap is the canonical task list; don't invent features outside it without asking.
- The user's local environment date / role / locale are surfaced via Claude Code context, not this file. Don't hard-code them here.
