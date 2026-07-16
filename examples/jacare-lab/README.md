# Jacaré Lab

Interactive tutorial covering the Jacaré API from [`docs/api.md`](../../docs/api.md) — live demos, reusable components, and a **View code** modal on every example.

## Run

```bash
yarn lab:dev
# → http://localhost:3003
```

```bash
yarn lab:build
yarn workspace jacare-lab preview
```

```bash
node packages/cli/dist/index.js check
# from examples/jacare-lab
```

## What’s inside

| Route | Covers |
|-------|--------|
| `/` | Quick start, boot pattern, lesson index |
| `/reactivity` | `signal` / `pulse`, `computed` / `derive`, `effect`, `batch`, `untrack` |
| `/templates` | Text, attrs, `style---` |
| `/bindings` | `bind-value`, `bind-checked`, `class-*`, CPW notes |
| `/events` | `on-*`, `@*`, keyboard, pointer, stopPropagation |
| `/if` | Branches, nested conditions, empty states |
| `/for` | Keyed lists, reorder, stable parents |
| `/components` | Props, slots, contracts, `emit`, model `bind-*` |
| `/css` | Scoped styles + isolation |
| `/nav` | `createNav`, params, search, guards, `routeHref` |
| `/forms` | `createForm`, Field, validate, submit, reset |
| `/lifecycle` | `createLifecycle`, `registerScope` |
| `/cookbook` | Tasks screen combining the pieces |
| `/ssr` | `render` / `resume` reference cards |
| `/tooling` | CLI, Vite plugin, compiler, DevTools, testing |
| `/helpers` | Runtime helpers index |

Each `Demo` card explains the idea, runs a live example, and opens the source in a modal.

## Stack

- `@jacare/core` + `@jacare/vite-plugin` + `@jacare/devtools` (DEV)
- Logo + green palette aligned with Scale BMI
- Fonts: Fraunces + Manrope + IBM Plex Mono
