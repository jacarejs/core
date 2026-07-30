# Jacaré Island demo

Embed a Jacaré `.jcr` widget inside a **static host page** — no SPA shell, no `createNav`.

Live pattern from idea **I-I** (`mountIsland` via `@jacare/core/island`).

## Run

```bash
yarn island:dev
# http://localhost:3006
```

```bash
yarn island:build
```

## What this shows

| Piece | Role |
|-------|------|
| `index.html` + `public/host.css` | Ordinary host site (blog-like markup) |
| Mount target | What it shows |
|--------------|---------------|
| `#counter-island` | Light island — mounts into the host document · marked as `CounterIsland.jcr` |
| `#tip-island` | Same kit with `shadow: true` — CSS stays in the shadow root · marked as `TipIsland.jcr` |
| `src/boot.js` | `mountIsland(selector, App, options)` |

On the live page, each island sits inside a **Jacaré · .jcr** frame with the source filename so you can tell host HTML apart from the compiled widget.

```js
import { mountIsland } from '@jacare/core/island'
import CounterIsland from './CounterIsland.jcr'

mountIsland('#counter-island', CounterIsland, {
  props: { start: 2, label: 'Live clicks' },
})
```

Docs: [docs/island.md](../../docs/island.md) · API: [docs/api.md § Island kit](../../docs/api.md)

Also see:
- [`jacare-island-react`](../jacare-island-react) — same widgets inside React
- [`jacare-island-vue`](../jacare-island-vue) — same widgets inside Vue 3
- [`jacare-island-angular`](../jacare-island-angular) — same widgets inside Angular
