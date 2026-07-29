# Jacaré Lab

[![demo](https://img.shields.io/badge/tutorial-featured-78c018.svg)](https://jacarejs.github.io/core/lab/)
[![Pages](https://github.com/jacarejs/core/actions/workflows/pages.yml/badge.svg)](https://github.com/jacarejs/core/actions/workflows/pages.yml)
[![CI](https://github.com/jacarejs/core/actions/workflows/ci.yml/badge.svg)](https://github.com/jacarejs/core/actions/workflows/ci.yml)
[![core](https://img.shields.io/npm/v/@jacare/core.svg?label=%40jacare%2Fcore&color=189030)](https://www.npmjs.com/package/@jacare/core)
[![license](https://img.shields.io/github/license/jacarejs/core.svg?color=189030)](https://github.com/jacarejs/core/blob/main/LICENSE)

**Featured interactive tutorial** for the Jacaré API ([`docs/api.md`](../../docs/api.md)) — live demos, reusable components, template contracts, and a **View code** modal on every example.

**Language reference (complete):** [`docs/language-reference.md`](../../docs/language-reference.md) · Lab lesson [`/language`](https://jacarejs.github.io/core/lab/#/language) — reserved words, all binds, `<view>` / `<style>` / `<contract>`, CLI create/dev/build.

**Import catalog:** [`docs/api.md` §20](../../docs/api.md#20-import-catalog--everything-you-can-import) · Lab [`/helpers`](https://jacarejs.github.io/core/lab/#/helpers) — every symbol you can import, with a detailed English explanation, import line, and example (`@jacare/core`, compiler, vite-plugin, meta, CLI, and `.jcr` exports).

Live: [jacarejs.github.io/core/lab](https://jacarejs.github.io/core/lab/) · Studio: [jacarejs.github.io/core/studio](https://jacarejs.github.io/core/studio/)

**Playground note:** Lab `/playground` and Studio compile and run editor source with `new Function` in the browser. Treat that as a local sandbox — only paste code you trust.

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
# or: jacare check --bindings
```

## Create · run · build (apps)

```bash
# Scaffold
npm create jacare@latest my-app
# or: jacare new my-app --template=todo

cd my-app && npm install

# Develop
jacare dev                 # or: npm run dev
jacare dev --port=4000

# Ship
jacare build               # → dist/

# Validate
jacare check
jacare check --bindings
```

Full CLI tables: [language-reference.md §9](../../docs/language-reference.md#9-create-run-and-build) · [api.md §17](../../docs/api.md#17-cli).

## Reserved words (summary)

| Kind | Tokens |
|------|--------|
| **Blocks** | `export <view>` · `export <style>` · `export <contract>` |
| **Directives** | `#if` `#elif` `#else` `#end` · `#case` `#when` · `#for` / `@each` |
| **Prefixes** | `on-*` / `@*` · `bind-*` · `:*` · `class-*` · `style---*` · `${@bag/key}` · `${@route/key}` |
| **Special** | `<slot>` · `<debug>` · `jacare-frame` · `jacare-go` · `jacare-here` · `jacare-when` · `data-jacare-focus` |
| **Contract keys** | `props` · `pulses` · `slots` · `emits` · `forwards` · `links` |

Live tables + demos: **Lab → Language reference** (`/language`).

## Bindings (summary)

| Goal | Syntax |
|------|--------|
| Text | `${signal}` · `${@cart/count}` |
| Attr | `bind-href=${url}` · `:disabled=${busy}` |
| Two-way | `bind-value=${draft}` · `bind-checked=${on}` |
| Class | `class-active=${flag}` |
| CSS var | `style---pct=${pct}` |
| Component | `:title=${t}` · `bind-value=${email}` (model) |

Complete catalog: [language-reference.md §3](../../docs/language-reference.md#3-all-bindings-complete-catalog) · Lab `/bindings` + `/language`.

## What’s inside

| Route | Covers |
|-------|--------|
| `/` | Lab overview, install notes, lesson index |
| `/quick-start` | API §1 — scaffold, `app.jcr`, `boot.js`, HTML shell |
| `/module` | API §2 — `.jcr` layout, view/style syntax, compiled exports |
| `/language` | Reserved words, `@route`, `jacare-when`, runtime map, CLI |
| `/binding-ir` | Binding IR · MountPlan · `check --bindings` · CPW |
| `/reactivity` | `signal` / `pulse`, `computed` / `derive`, `effect`, `batch`, Patience, `untrack` |
| `/bag` | `createBag`, `ripple`, shared cart across views |
| `/templates` | Text, attrs, `style---` |
| `/bindings` | `bind-value`, `bind-checked`, `class-*`, Binding IR + CPW |
| `/events` | `on-*`, `@*`, keyboard, pointer, stopPropagation |
| `/debug` | `<debug>` inspector |
| `/why` | `$why`, Why card, cycle errors, `jacare why file:line` |
| `/if` | Branches, `jacare-when`, nested conditions, empty states |
| `/case` | `#case` / `#when` |
| `/for` | Keyed lists, reorder, stable parents |
| `/components` | Props, slots, contracts, `emit`, model `bind-*` |
| `/css` | Scoped styles + isolation |
| `/nav` | `createNav`, `createRoute`, `@route`, focus grip, guards, `routeHref` |
| `/forms` | `createForm`, Field, validate, submit, reset |
| `/lifecycle` | `createLifecycle`, `registerScope` |
| `/cookbook` | Tasks screen combining the pieces |
| `/playground` | Live `.jcr` editor |
| `/ssr` | `render` / `resume` via shared MountPlan |
| `/island` | `mountIsland`, shadow, React/Vue/Angular hosts |
| `/tooling` | CLI (`check --bindings` / `--routes`), Vite, Binding IR, DevTools, VS Code |
| `/helpers` | Import catalog — detailed English explanation per symbol |

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
| `quick-start.js` | `/quick-start` |
| `module.js` | `/module` |
| `language.js` | `/language` |
| `reactivity.js` | `/reactivity` |
| `bag.js` | `/bag` |
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
| `island.js` | `/island` |
| `tooling.js` | `/tooling` |
| `index.js` | barrel + `SNIPPET_CATALOG` |

---

<p align="center">Made in Brazil 🇧🇷</p>
