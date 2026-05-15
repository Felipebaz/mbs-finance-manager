---
name: nextjs16-docs-first
description: >
  Read bundled Next.js 16 docs in node_modules/next/dist/docs/ before writing or
  modifying any Next.js route, layout, server/client component, route handler,
  middleware, or Next config. Next 16 has breaking changes vs. older training
  data. Use when editing files under src/app/, next.config.ts, middleware.ts,
  proxy.ts, or anything importing from next/* (App Router, RSC, route handlers,
  metadata, fonts, images, caching, revalidation).
---

# Read the bundled Next 16 docs first

Your training data predates Next.js 16. APIs, defaults, file conventions, and
caching semantics have shifted. Before writing or modifying:

- Anything under `src/app/` — routes, layouts, pages, route handlers, error
  boundaries, loading states.
- `next.config.ts`.
- `middleware.ts` / `proxy.ts`.
- Anything importing from `next/*` (`next/font`, `next/image`, `next/link`,
  `next/navigation`, `next/headers`, `next/cache`, etc.).

…open the relevant doc in `node_modules/next/dist/docs/` and confirm the API
shape and any deprecation notices before producing code.

## Where to look

- `01-app/01-getting-started/` — installation, project structure, layouts &
  pages, linking & navigating, server vs. client components, fetching &
  mutating data, caching, revalidating, error handling, CSS, images, fonts,
  metadata, route handlers, proxy/middleware, deploying, upgrading.
- `01-app/02-guides/` — topical guides (authentication, caching nuance,
  forms, ISR, instrumentation, MCP, MDX, environment variables, etc.).
- `01-app/03-api-reference/` — exact API shapes for files, functions, config,
  CLI, components, directives.
- `01-app/04-glossary.md` — terminology.

## Required behavior

1. Identify which file(s) the user wants to edit.
2. Map them to the matching doc(s) in `node_modules/next/dist/docs/` (e.g.
   editing `src/app/layout.tsx` → `01-app/01-getting-started/03-layouts-and-pages.md`;
   editing a route handler → `01-app/01-getting-started/15-route-handlers.md`).
3. `Read` those doc(s) before writing code.
4. Honor any `Deprecated` / `Breaking change` / `Removed` notes you find.
5. If a doc contradicts something you "remember" about Next.js, the doc wins.

## Quick file → doc map

| Editing | Read |
|---|---|
| `src/app/layout.tsx`, `src/app/**/page.tsx` | `01-app/01-getting-started/03-layouts-and-pages.md` |
| `src/app/**/route.ts` (route handlers) | `01-app/01-getting-started/15-route-handlers.md` |
| `"use client"` / RSC questions | `01-app/01-getting-started/05-server-and-client-components.md` |
| Data fetching | `01-app/01-getting-started/06-fetching-data.md` |
| Mutations / Server Actions | `01-app/01-getting-started/07-mutating-data.md` |
| Caching | `01-app/01-getting-started/08-caching.md` + `02-guides/caching-without-cache-components.md` |
| Revalidation | `01-app/01-getting-started/09-revalidating.md` + `02-guides/how-revalidation-works.md` |
| `error.tsx` / `not-found.tsx` | `01-app/01-getting-started/10-error-handling.md` |
| Tailwind / CSS-in-JS / globals | `01-app/01-getting-started/11-css.md` |
| `next/image` | `01-app/01-getting-started/12-images.md` |
| `next/font` | `01-app/01-getting-started/13-fonts.md` |
| `metadata` / OG | `01-app/01-getting-started/14-metadata-and-og-images.md` |
| `middleware.ts` / `proxy.ts` | `01-app/01-getting-started/16-proxy.md` |
| `next.config.ts` | `01-app/01-getting-started/18-upgrading.md` + `03-api-reference/` config pages |
| Auth | `01-app/02-guides/authentication.md` |
| Env vars | `01-app/02-guides/environment-variables.md` |
