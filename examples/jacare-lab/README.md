# Jacaré Lab

[![demo](https://img.shields.io/badge/tutorial-featured-78c018.svg)](https://jacarejs.github.io/core/lab/)
[![Pages](https://github.com/jacarejs/core/actions/workflows/pages.yml/badge.svg)](https://github.com/jacarejs/core/actions/workflows/pages.yml)
[![CI](https://github.com/jacarejs/core/actions/workflows/ci.yml/badge.svg)](https://github.com/jacarejs/core/actions/workflows/ci.yml)
[![core](https://img.shields.io/npm/v/@jacare/core.svg?label=%40jacare%2Fcore&color=189030)](https://www.npmjs.com/package/@jacare/core)
[![license](https://img.shields.io/github/license/jacarejs/core.svg?color=189030)](https://github.com/jacarejs/core/blob/main/LICENSE)

**Featured interactive tutorial** for the Jacaré API ([`docs/api.md`](../../docs/api.md)) — live demos, reusable components, template contracts, and a **View code** modal on every example.

Live: [jacarejs.github.io/core/lab](https://jacarejs.github.io/core/lab/)

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
# from examples/jacare-lab
yarn jacare-check
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
- GitHub Pages base: `/core/lab/`

## Snippets

Demo “View code” sources live in `src/snippets/` (one module per lesson), built with `viewSnippet` / `moduleSnippet` from `src/utils/snippet.js`.

| File | Lesson |
|------|--------|
| `start.js` | `/` |
| `reactivity.js` | `/reactivity` |
| `templates.js` | `/templates` |
| `bindings.js` | `/bindings` |
| `events.js` | `/events` |
| `conditionals.js` | `/if` |
| `lists.js` | `/for` |
| `components.js` | `/components` |
| `css.js` | `/css` |
| `navigation.js` | `/nav` |
| `forms.js` | `/forms` |
| `lifecycle.js` | `/lifecycle` |
| `cookbook.js` | `/cookbook` |
| `ssr.js` | `/ssr` |
| `tooling.js` | `/tooling` |
| `index.js` | barrel + `SNIPPET_CATALOG` |

---

<p align="center">Made in Brazil 🇧🇷</p>
