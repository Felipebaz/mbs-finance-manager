---
name: rsc-vs-client
description: >
  React Server Components vs Client Components discipline for Next.js 16 App
  Router. Use when creating, editing, or composing any React component in
  src/app/ or src/components/ — deciding whether a component needs
  "use client", composing Server + Client boundaries, passing props across
  the boundary, importing server-only modules, handling state / effects /
  events, or auditing for unnecessary client bundles. Triggers on
  "use client" directive edits, useState/useEffect/useRef/useContext usage,
  onClick/onChange handlers, and Server Component composition.
---

# Server vs Client Components — discipline

The App Router defaults to **Server Components**. Every `"use client"` is a deliberate cost: ships JS to the browser, blocks SSR streaming, locks out server-only APIs. Default Server; add `"use client"` only when forced.

## Rule 1 — Server by default

Any `.tsx` under `src/app/` (page, layout, nested component) is a Server Component unless it has `"use client"` at the very top of the file. The current `src/app/layout.tsx` and `src/app/page.tsx` are Server Components — keep them that way.

## Rule 2 — when `"use client"` is required

Add `"use client"` ONLY when the component uses any of:

- React hooks for state/effects: `useState`, `useReducer`, `useEffect`, `useLayoutEffect`, `useRef`, `useImperativeHandle`, `useTransition`, `useDeferredValue`, `useOptimistic`.
- Context: `useContext`, `createContext` consumer.
- DOM event handlers: `onClick`, `onChange`, `onSubmit`, `onInput`, etc. (handlers are functions — not serializable across the RSC boundary).
- Browser-only APIs: `window`, `document`, `localStorage`, `sessionStorage`, `navigator`, `IntersectionObserver`, `ResizeObserver`, etc.
- Third-party libraries that themselves require client (charts, maps, animations using DOM refs, drag-and-drop).

If none of the above, do NOT add `"use client"`.

## Rule 3 — `"use client"` is a boundary, not a virus

A Client Component can import other Client Components freely. A Server Component can import Client Components — that's the boundary. But:

- A Client Component cannot import a Server Component.
- A Client Component can RECEIVE a Server Component as a `children` prop or any prop typed `ReactNode`. This is the "pass server tree into client shell" pattern — use it to keep server data fetching outside the client bundle.

```tsx
// GOOD — client shell, server children
// LikeButton.tsx — "use client"
"use client";
export function LikeButton({ children }: { children: React.ReactNode }) {
  const [liked, setLiked] = useState(false);
  return <div>{children}<button onClick={() => setLiked(!liked)}>♥</button></div>;
}

// page.tsx — Server Component
import { LikeButton } from "./LikeButton";
import { ExpensiveServerStuff } from "./ExpensiveServerStuff";
export default function Page() {
  return <LikeButton><ExpensiveServerStuff /></LikeButton>;
}
```

## Rule 4 — props crossing the boundary MUST be serializable

A Server Component rendering a Client Component can only pass props that survive serialization (the framework actually serializes them). Allowed:

- Primitives: `string`, `number`, `boolean`, `null`, `undefined`, `bigint`.
- Plain objects + arrays of allowed values.
- `Date`, `Map`, `Set`, `URL`, `RegExp`, typed arrays, `FormData`, `Promise`.
- React elements (`ReactNode`) — including a Server Component subtree passed as `children`.
- Server Action functions (only those — they get a special handshake).

Not allowed:

- Plain functions, class instances, Symbol (other than primitives like `Symbol.iterator`-keyed values).
- Closures over server-only data.

If you need to pass a regular event handler, the parent itself must be a Client Component.

## Rule 5 — never import server-only modules into a Client Component

If a module reads env, hits the DB, calls an external API with secrets, reads from filesystem, or uses `next/headers` / `next/cache` server primitives — it must never end up in a client bundle.

Defensive imports:

```ts
// db.ts
import "server-only";  // throws at build if imported into a client bundle
// … connection setup
```

Use `import "server-only"` at the top of server-only modules. For client-only modules, use `import "client-only"`. These are zero-runtime guards.

## Rule 6 — data fetching belongs in Server Components

In the App Router, you fetch with `async` Server Components:

```tsx
// Server Component
export default async function AccountsPage() {
  const accounts = await getAccounts();  // server-side
  return <AccountList accounts={accounts} />;
}
```

Do NOT use `useEffect(fetch())` for initial data in a Client Component when a Server Component can do it. Reach for client fetching only for:

- Genuinely interactive / live data (polling, websockets, after-user-action loads where Server Actions don't fit).
- Data that depends on client state that isn't a URL search param.

## Rule 7 — mutations use Server Actions, not client fetch

For form submissions and writes, prefer Server Actions (`"use server"` functions) over a Client Component that calls `fetch("/api/...")`. Server Actions:

- Skip the round-trip to a hand-written route handler.
- Integrate with `revalidatePath` / `revalidateTag`.
- Work with progressive enhancement (form works without JS).

A Client Component (e.g. one using `useFormStatus` or optimistic UI) can invoke a Server Action imported from a `"use server"` module — that's the allowed handshake.

## Rule 8 — push `"use client"` as far down the tree as possible

If only the submit button needs interactivity, only the submit button is a Client Component. Wrapping an entire page in `"use client"` to make one input controlled is wasteful — it ships the whole tree to the browser.

```tsx
// BAD
"use client";
export default function Page() {  // entire page now client
  const [q, setQ] = useState("");
  return <div><Header/><SearchBox value={q} onChange={setQ}/><Results/></div>;
}

// GOOD
// page.tsx (Server)
export default function Page() {
  return <div><Header/><SearchBox/><Results/></div>;
}
// SearchBox.tsx ("use client")
```

## Rule 9 — async Server Components, not async Client Components

Server Components can be `async`. Client Components **cannot** be top-level `async` functions. If you need async data in a Client Component, fetch with a library (SWR, React Query, `use(promise)` with a promise prop from a Server parent) — not by making the function `async`.

## Quick decision tree

```
Does the component need:
  state / refs / effects / context / event handlers / browser APIs / client-only lib?
       └─ yes → "use client" at top of file
       └─ no  → leave as Server Component (default)

Then:
  Can I push the client boundary DOWN to a smaller leaf?
       └─ yes → do that
       └─ no  → fine
```

## Audit checklist before committing a component

1. [ ] If `"use client"` is present, at least one trigger from Rule 2 is actually used.
2. [ ] No server-only module imported into a client tree (DB clients, env-reading modules, `next/headers`).
3. [ ] Props crossing the boundary are serializable (no plain functions, no class instances).
4. [ ] Initial data fetching is in a Server Component, not a `useEffect`.
5. [ ] Mutations go through Server Actions when feasible.
6. [ ] `"use client"` is at the smallest leaf, not the page root.
