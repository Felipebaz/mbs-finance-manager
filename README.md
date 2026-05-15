# Moneta

Personal finance manager. Track accounts, transactions, budgets, and goals — all in one focused dashboard.

> Named after Moneta, the Roman goddess of money and guardian of coinage.

## Status

Early development. Home placeholder only — features coming.

## Tech stack

- **Framework:** [Next.js 16](https://nextjs.org) (App Router)
- **Language:** TypeScript
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com)
- **Linting:** ESLint (`eslint-config-next`)
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

Open [http://localhost:3000](http://localhost:3000).

### Production build

```bash
npm run build
npm run start
```

## Scripts

| Script          | Purpose                          |
| --------------- | -------------------------------- |
| `npm run dev`   | Start dev server (Turbopack)     |
| `npm run build` | Production build + type-check    |
| `npm run start` | Run built production server      |
| `npm run lint`  | Run ESLint                       |

## Project structure

```
moneta/
├── public/              # Static assets
├── src/
│   └── app/             # App Router routes
│       ├── layout.tsx   # Root layout + metadata
│       ├── page.tsx     # Home page
│       └── globals.css  # Tailwind + theme tokens
├── eslint.config.mjs
├── next.config.ts
├── postcss.config.mjs
├── tsconfig.json
└── package.json
```

Path alias `@/*` maps to `src/*`.

## Roadmap

- [ ] Accounts (checking, savings, credit, investment)
- [ ] Transactions (manual entry, categorization)
- [ ] Budgets (monthly limits per category)
- [ ] Goals (savings targets with progress)
- [ ] Reports (cash flow, net worth, spending trends)
- [ ] Import (CSV / Open Banking)
- [ ] Multi-currency support
- [ ] Authentication
- [ ] Persistence layer (DB to be chosen)

## Conventions

- App Router only — no `pages/` directory
- Server Components by default; `"use client"` only when needed
- Tailwind utility-first; theme tokens in `src/app/globals.css`
- Strict TypeScript

## License

TBD.
