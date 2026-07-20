# Jacaré Syntax

<p align="center">
  <img src="../packages/cli/assets/jacare-logo.png" width="120" alt="Jacaré logo" />
</p>

Jacaré files are plain JavaScript modules. Markup lives in an `export <view>` block (recommended) or a `view` tagged template.

**Full API walkthrough:** [api.md](api.md) · [testing.md](testing.md)

## File layout

```
src/
  app.jcr       UI + state
  boot.js        entry — calls mount()
index.html       page shell
public/          static assets
jacare.config.js   optional config
jacare.d.ts        TypeScript module types
```

**Recommended module structure:**

```javascript
import { signal } from '@jacare/core'

const count = signal(0)

export <view>
  <p>${count}</p>
</view>

export <style>
.counter { padding: 1rem; }
</style>
```

**With nav:**

```
src/
  shell.jcr     layout + jacare-frame
  pages/         screens
  nav.js         screen map
  boot.js        nav.attach()
index.html
public/
```

## View syntax

### Block (recommended)

```javascript
import { signal } from '@jacare/core'

const count = signal(0)

export <view>
  <button on-click=${() => count.update((n) => n + 1)}>${count}</button>
</view>
```

Also supported: `export default <view>`, `return <view>`, and `export default view\`...\``.

## Reactivity

Canonical names (preferred in new code):

```javascript
import { signal, computed, effect, view } from '@jacare/core'
```

| Canonical | Alias |
|-----------|-------|
| `signal` | `pulse` |
| `computed` | `derive` |
| `effect` | `watch` |

```javascript
import { signal, computed, effect } from '@jacare/core'

const name = signal('world')
const greeting = computed(() => `Hello, ${name()}`)

effect(() => {
  console.log(greeting())
})
```

| API | Description |
|-----|-------------|
| `pulse(value)` | Read with `name()`, write with `name.set()` / `name.update()` |
| `derive(() => …)` | Value derived from other pulses |
| `watch(fn)` | Runs when tracked pulses change |

`signal`, `computed`, and `effect` are also available as aliases.

## Syntax aliases

The compiler accepts two equivalent forms:

| Canonical | Alias |
|-----------|-------|
| `#if` / `#elif` / `#else` / `#end` | `@if` / `@elseif` / `@else` / `@end` |
| `#case` / `#when` / `#else` / `#end` | — |
| `#for items() as item (id)` / `#end` | `@each items() as item (id)` / `@end` |
| `on-click=${fn}` | `@click=${fn}` |
| `bind-href=${url}` | `:href=${url}` |
| `class-active=${on}` | `class:active=${on}` |

Prefer the canonical form in new code.

## Template bindings

### Text

```javascript
export <view>
  <p>${greeting}</p>
</view>
```

Component props use `bindPropText` at runtime — signals and plain strings both work.

### Events

Full API: [Events (`on-*` / `@*`)](api.md#6-events-on---)

```javascript
export <view>
  <button on-click=${save}>Save</button>
</view>
```

### Attributes

```javascript
export <view>
  <a bind-href=${url}>Link</a>
</view>
```

### Form controls

`bind-value` and `bind-checked` on a signal compile to two-way `bindModel`:

```javascript
const text = signal('')
export <view>
  <input bind-value=${text} />
</view>
```

For one-way binding or non-signal expressions, the compiler falls back to `bindProperty`.

### Form validation

```javascript
import { createForm } from '@jacare/core'

const form = createForm({
  email: {
    value: '',
    validate: (value) => (value.includes('@') ? undefined : 'Invalid email'),
  },
})

export <view>
  <form on-submit=${form.handleSubmit(save)}>
    <input bind-value=${form.fields.email} on-blur=${() => form.fields.email.blur()} />
    #if form.fields.email.error()
      <span>${form.fields.email.error()}</span>
    #end
  </form>
</view>
```

Field components are regular `.jcr` modules — see `examples/jacare-todo/src/components/Field.jcr`.

### Classes

```javascript
view`<li class-done=${item.done}>${item.label}</li>`
```

`class-active=${on}` toggles the `active` class when `on` is truthy. Compiles to `bindClass` in dev and CPW in production.

### Reactive CSS variables

Bind a signal to a CSS custom property with `style---name` or `style:name`:

```javascript
import { computed, signal } from '@jacare/core'

const progress = signal(40)
const pct = computed(() => progress() + '%')

export <view>
  <div class="bar" style---pct=${pct} />
</view>

export <style>
.bar { width: var(--pct); transition: width 0.2s ease; }
</style>
```

The compiler maps `style---pct` → `--pct` and emits `bindStyleVar` (dev) or inline `setProperty` (production CPW).

Use `computed` when the value needs a unit (`50%`, `12rem`). Plain numbers stringify as-is.

## Control flow

Full API: [`#if`](api.md#7-control-flow--if) · [`#case`](api.md#7b-control-flow--case) · [`#for`](api.md#8-control-flow--for) · [`<debug>`](api.md#7c-dev-debug-debug) · [Events](api.md#6-events-on---)

### Conditionals

```javascript
export <view>
#if loading
  <p>Loading…</p>
#elif error
  <p>${error}</p>
#else
  <Content />
#end
</view>
```

Siblings inside the active branch keep source order at runtime (`branch` insertion cursor).

### Match (`#case`)

When every branch compares the **same** expression to a value, use `#case` instead of a long `#elif` chain:

```javascript
export <view>
#case role()
  #when 'admin'
    <AdminPanel />
  #when 'guest'
    <GuestHome />
  #else
    <MemberArea />
#end
</view>
```

The compiler evaluates the scrutinee once per update and picks the arm with `Object.is`. Inactive arms are not in the DOM.

### Lists

```javascript
export <view>
<ul>
  #for items() as item (item.id)
    <li>${item.label}</li>
  #end
</ul>
</view>
```

The expression in parentheses is the key used for DOM reconciliation.

When an item keeps the same key but changes identity (immutable updates with spread), Jacaré re-renders that row automatically.

### Dev debug (`<debug>`)

Use `<debug>` instead of `<pre>${obj}</pre>` when you want **pretty JSON** without HTML escaping (`&quot;` in attribute strings).

```javascript
export <view>
  <debug copy label="cart">${cart}</debug>
  <debug>${{ score, mood, removed }}</debug>
</view>
```

| Attribute | Effect |
|-----------|--------|
| *(body)* | Single `${expr}` — object, array, pulse, or inline literal |
| `label="…"` | Optional heading above the JSON |
| `copy` | Adds a **Copy JSON** button |

Stripped from **production** builds (`debug: false` via the Vite plugin). No SSR output.

Full API: [§7c](api.md#7c-dev-debug-debug)

## Components

Import another `.jcr` or `.js` module and use it as a tag:

```javascript
import TodoItem from './TodoItem.jcr'

export <view>
  <TodoItem :item=${item} />
</view>
```

With children (default slot):

```javascript
import Card from './Card.jcr'

export <view>
<Card :title=${title}>
  <p>${body}</p>
</Card>
</view>
```

Inside the child component, project children with `<slot />`:

```javascript
export <view>
<div class="card">
  <h2>${title}</h2>
  <slot />
</div>
</view>
```

Props are inferred from attribute expressions. `children` is passed automatically when the parent has inner content.

## Scoped CSS

Add an `export <style>` block after the view (recommended):

```javascript
export <view>
<div class="card">
  <p class="title">${title}</p>
</div>
</view>

export <style>
.card { padding: 1rem; border: 1px solid #ccc; }
.title { font-weight: bold; }
</style>
```

Preprocessor attribute (parsed; compilation deferred):

```javascript
export <style lang="scss">
.title { color: $primary; }
</style>
```

Legacy tagged template still supported:

```javascript
style`
.card { padding: 1rem; }
`
```

The compiler scopes selectors with `[data-jacare-s]` on the mount target and injects styles at runtime.

Use `:global(.shared)` inside `style` to opt out of scoping for a selector.

### Reactive style directives

`#if`, `#elif`, `#else`, `#case`, `#when`, `#for`, and `${expr}` work inside `export <style>`. Directives must start on their own line (optional indent).

```javascript
const theme = signal('day')
const accents = signal([
  { id: 'leaf', color: '#8fd12a' },
])

export <style>
.card {
  #if theme() === 'night'
    background: #0b1a14;
  #else
    background: #f8fffb;
  #end
}

#for accents() as accent (accent.id)
.chip-${accent.id} {
  border-color: ${accent.color};
}
#end
</style>
```

Static style sheets still use a shared scoped inject. Reactive sheets use a per-mount stylesheet so instances do not clash.

## Meta-framework

`@jacare/meta` adds file-based routing via a Vite plugin:

```javascript
// vite.config.js
import { jacare } from '@jacare/vite-plugin'
import { jacareMeta } from '@jacare/meta'

export default {
  plugins: [jacareMeta(), jacare()],
}
```

```javascript
// src/nav.js
import { createJacareAppFromRoutes } from '@jacare/meta'
import { routeLoaders } from 'virtual:jacare-routes'
import Shell from './shell.jcr'
import NotFound from './pages/not-found.jcr'

export const nav = createJacareAppFromRoutes({
  layout: Shell,
  missing: NotFound,
  routeLoaders,
})
```

| File | Route |
|------|-------|
| `src/pages/index.jcr` | `/` |
| `src/pages/about.jcr` | `/about` |
| `src/pages/tutorial/[slug].jcr` | `/tutorial/:slug` |

## Nav

```javascript
import { createNav, lazy } from '@jacare/core'

export const nav = createNav({
  layout: Shell,
  screens: {
    '/': Home,
    '/about': lazy(() => import('./pages/about.jcr')),
  },
  missing: lazy(() => import('./pages/not-found.jcr')),
  beforeGo: (to, from) => {
    if (to.path === '/admin') return '/login'
  },
})

nav.attach(document.getElementById('app'))
nav.go('/about')
nav.swap('/settings')
nav.undo()
nav.warm('/about')
```

| Method | Role |
|--------|------|
| `attach(target)` | Mount layout + active screen |
| `go(path)` | Navigate forward (queued if another navigation is in progress) |
| `swap(path)` | Replace current history entry |
| `undo()` | `history.back()` |
| `warm(path)` | Preload lazy screen modules |
| `missing` | 404 screen when no URL matches |
| `where` | `Signal<NavPlace>` — reactive current place (`.peek` for untracked read) |

`createNav({ base: '/app' })` sets the URL prefix for all screens.

### Screen title

```javascript
export const nav = createNav({
  layout: Shell,
  screens: {
    '/about': {
      use: lazy(() => import('./pages/about.jcr')),
      title: 'Jacaré · About',
    },
    '/topic/:slug': {
      use: lazy(() => import('./pages/topic.jcr')),
      title: (ctx) => `Topic · ${ctx.params.slug}`,
    },
  },
})
```

Configure `title` on each route in `createNav` (string or `(ctx) => string`). Optional page-level `export const title` still works as a fallback; nav titles win.

For **live** titles (countdown, totals), use `setNavTitle` inside an `effect` from `onActivate`:

```javascript
import { effect, setNavTitle } from '@jacare/core'

export const lifecycle = createLifecycle({
  onActivate() {
    const titleFx = effect(() => setNavTitle(`Focus · ${clock()}`))
    return () => titleFx.dispose()
  },
})
```

Layout shells expose a frame slot:

```html
<a jacare-go="/" href="/">Home</a>
<main jacare-frame></main>
```

Props are inferred from `:name=${expr}` attributes.

## Compiler

Every `.jcr` file compiles to `mount()`, `render()`, and `resume()`. The compiler imports only the runtime helpers each file uses (`bindText`, `bindModel`, `branch`, etc.).

### Compile-Time Pulse Wiring (CPW)

In **production** client builds, the Vite plugin sets `cpw: true` by default. Static signal bindings compile to inline `peek` + `subscribe` instead of `bindText` / `bindAttribute` / `bindClass` / `bindStyleVar`.

| Mode | `${count}` on a signal | `style---pct=${pct}` |
|------|------------------------|----------------------|
| Dev (`vite dev`) | `bindText(node, count)` | `bindStyleVar(el, '--pct', pct)` |
| Prod (`vite build`) | inline `count.peek` + `subscribe` | inline `setProperty('--pct', …)` |

Override: `jacare({ cpw: false })` or `compile(source, { cpw: true })`.

Inspect compiled output: `jacare({ inspect: true })` writes to `.jacare/compiled/`.

### Prop and signal detection

- **Mount props** — identifiers used in the template but not declared in the module script (all `import` blocks are scanned)
- **Signals** — names assigned with `signal`, `pulse`, `computed`, or `derive` in the module script
- **Module imports** — values imported from other files (e.g. `topics` from `./topics.js`) are never treated as mount props
- **String literals** — signal-like text inside `` `...` `` strings in the script is ignored during signal detection

### Bindings

| Pattern | Compiled as (dev) | Compiled as (prod CPW) |
|---------|-------------------|------------------------|
| `${count}` when `count` is a signal | `bindText` | inline `peek` + `subscribe` |
| `${title}` when `title` is a component prop | `bindPropText` | `bindPropText` |
| `` `Total: ${total}` `` with signal `total` | `effect` with `` `Total: ${total()}` `` | `effect` |
| `bind-value=${draft}` on a signal | `bindModel` (two-way) | `bindModel` |
| `bind-href=${url}` on a signal | `bindAttribute` | inline attribute wiring |
| `class-active=${on}` on a signal | `bindClass` | inline `classList.toggle` |
| `style---pct=${pct}` on a signal | `bindStyleVar` | inline `setProperty` |
| `href=${() => href(id)}` | `effect` that invokes the expression | `effect` |
| `on-click=${handler}` | `addEventListener` + cleanup | same |

Compile errors report `filename:line:column` with a source snippet. Source maps map generated JS back to `.jcr` lines.

```bash
jacare compile src/app.jcr
jacare compile src/app.jcr --watch
jacare check
```

See [Phase 2 — Compiler](phases/02-compiler.md).

## SSR

Every `.jcr` file exports three functions:

| Export | Purpose |
|--------|---------|
| `mount(target)` | Client render |
| `render()` | Server HTML + binding state |
| `resume(target, state)` | Hydrate on the client |

```javascript
import { render, resume } from './app.jcr'

const { html, state } = render()
document.getElementById('app').innerHTML = html
resume(document.getElementById('app'), state)
```

### Binding types

| Kind | SSR `render()` | `resume()` |
|------|----------------|------------|
| `signal` | `{ id, kind: 'signal', read: count }` | `bindText` via signal |
| `expr` | `{ id, kind: 'expr', read: () => expr }` | `bindText` via lambda |

Dynamic text in `render()` is escaped with `escapeHtml()` to prevent XSS.

Event handlers (`on-click`, etc.) compile with `removeEventListener` in the `mount()` dispose function.

Helpers from `@jacare/core`:

```javascript
import { renderToString, renderToStream } from '@jacare/core'

const html = renderToString(render)
for await (const chunk of renderToStream(render)) {
  res.write(chunk)
}
```
