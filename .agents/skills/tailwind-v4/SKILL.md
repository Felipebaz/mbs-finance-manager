---
name: tailwind-v4
description: >
  Tailwind CSS v4 conventions for this project. Use when editing any *.tsx with
  Tailwind utility classes, src/app/globals.css, postcss.config.mjs, or when
  adding design tokens / theme variables / dark-mode styles / custom colors /
  fonts. v4 is CSS-first and has breaking changes vs. v3 — there is NO
  tailwind.config.js / tailwind.config.ts. Triggers on Tailwind class edits,
  theme token work, dark mode setup, plugin questions, or v3-pattern usage.
---

# Tailwind v4 — project rules

This project uses Tailwind CSS v4. v4 is **CSS-first**: configuration lives in CSS, not in a JS config file. Most v3 muscle memory will produce wrong code.

## Rule 1 — there is no `tailwind.config.{js,ts}`

Do not create one. v4 reads config from CSS via `@theme`, `@plugin`, `@source`, `@variant`, `@utility`, `@custom-variant` directives. If you find yourself reaching for `tailwind.config.js`, stop — the equivalent is a CSS directive.

## Rule 2 — entry point

`src/app/globals.css` is the entry. It must contain:

```css
@import "tailwindcss";
```

That single import pulls in `@tailwind base; @tailwind components; @tailwind utilities;` (which **no longer exist as separate directives in v4**). Do not add the old three directives — they're gone.

## Rule 3 — design tokens live in `@theme`

Add custom colors, fonts, spacing, breakpoints, etc. inside `@theme { … }` or `@theme inline { … }` blocks in `globals.css`. The current setup uses `@theme inline`:

```css
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}
```

Each `--color-*`, `--font-*`, `--spacing-*`, `--breakpoint-*`, `--radius-*`, `--shadow-*` CSS variable inside `@theme` automatically generates matching utilities (`bg-background`, `text-foreground`, `font-sans`, etc.). No JS config required.

`@theme inline` vs `@theme`:
- `@theme inline { … }` — values are inlined wherever the utility is used (resolves `var(...)` at build).
- `@theme { … }` — values stay as CSS variables in the output.

Current project uses `inline` because tokens reference `:root` variables that change with `prefers-color-scheme`.

## Rule 4 — dark mode

Dark mode in this project is media-query driven, set in CSS:

```css
:root {
  --background: #ffffff;
  --foreground: #171717;
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
  }
}
```

Tailwind's `dark:` variant defaults to `prefers-color-scheme` in v4 — works out of the box. If a class-based toggle is needed later, use `@custom-variant dark (&:where(.dark, .dark *));` in `globals.css` — **not** a `darkMode: "class"` JS config (that's v3).

## Rule 5 — PostCSS plugin

`postcss.config.mjs` uses `@tailwindcss/postcss`:

```js
const config = {
  plugins: ["@tailwindcss/postcss"],
};
export default config;
```

Do not switch to the v3 `tailwindcss` PostCSS plugin. That's a different package and will not work with v4 config directives.

## Rule 6 — content / source detection

v4 auto-detects sources via heuristics. You usually do NOT need to configure content paths. If a class is being purged unexpectedly, add an explicit `@source` directive in `globals.css`:

```css
@source "../components/**/*.tsx";
```

Avoid this until you actually see a purging bug.

## Rule 7 — arbitrary values + the new `@utility`

- Arbitrary values still work: `bg-[#1a1a1a]`, `w-[7.5rem]`.
- For repeated arbitrary patterns, define a utility once with `@utility`:

```css
@utility scrollbar-thin {
  scrollbar-width: thin;
}
```

Then `scrollbar-thin` works as a utility class.

## Rule 8 — plugins

v3's JS plugins (`tailwindcss-forms`, `tailwindcss-typography`) may or may not be v4-compatible. Check before installing. Use `@plugin "plugin-name";` in `globals.css` to register a v4-native plugin.

## v3 → v4 quick map

| v3 thing | v4 equivalent |
|---|---|
| `tailwind.config.js` `theme.extend.colors` | `@theme { --color-x: …; }` in CSS |
| `tailwind.config.js` `darkMode: "class"` | `@custom-variant dark (&:where(.dark, .dark *));` |
| `tailwind.config.js` `content: [...]` | usually auto-detected; `@source "..."` if needed |
| `@tailwind base; @tailwind components; @tailwind utilities;` | `@import "tailwindcss";` |
| `plugins: [require("…")]` | `@plugin "…";` in CSS |
| JS plugin API (`addUtilities`, `addComponents`) | `@utility name { … }` in CSS |
| `theme()` function in CSS | direct `var(--color-x)` |

## Quick checklist

1. [ ] No `tailwind.config.js` / `tailwind.config.ts` created.
2. [ ] `globals.css` has `@import "tailwindcss";` and not the old three `@tailwind` directives.
3. [ ] Custom tokens go in `@theme` / `@theme inline`, not JS.
4. [ ] Dark mode via `prefers-color-scheme` CSS or `@custom-variant`, not JS config.
5. [ ] PostCSS plugin is `@tailwindcss/postcss`.
6. [ ] No v3-only plugin APIs (`addUtilities` JS callback, etc.).

## If unsure

Tailwind v4 docs ship outside this repo. If a v3-vs-v4 ambiguity remains after this skill, ask the user before guessing — getting v3 syntax into a v4 project breaks the build in subtle ways (classes silently missing, theme tokens not exposed as utilities).
