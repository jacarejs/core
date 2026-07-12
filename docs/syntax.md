# Jacaré Syntax

Jacaré files are plain JavaScript modules. Markup lives in a `view` tagged template.

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
import { pulse, derive, watch, view } from '@jacare/core'

const name = pulse('world')
const greeting = derive(() => `Hello, ${name()}`)

watch(() => {
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
| `#for items() as item (id)` / `#end` | `@each items() as item (id)` / `@end` |
| `on-click=${fn}` | `@click=${fn}` |
| `bind-href=${url}` | `:href=${url}` |
| `class-active=${on}` | `class:active=${on}` |

Prefer the canonical form in new code.

## Template bindings

### Text

```javascript
view`<p>${greeting}</p>`
```

### Events

```javascript
view`<button on-click=${save}>Save</button>`
```

### Attributes

```javascript
view`<a bind-href=${url}>Link</a>`
```

### Form controls

`bind-value` and `bind-checked` on a signal compile to two-way `bindModel` — the DOM and signal stay in sync automatically:

```javascript
const text = signal('')
view`<input bind-value=${text} />`
```

For one-way binding or non-signal expressions, the compiler falls back to `bindProperty`.

### Form validation

```javascript
import { createForm, view } from '@jacare/core'

const form = createForm({
  email: {
    value: '',
    validate: (value) => (value.includes('@') ? undefined : 'Invalid email'),
  },
})

view`
  <form on-submit=${form.handleSubmit(save)}>
    <input bind-value=${form.fields.email} on-blur=${() => form.fields.email.blur()} />
    #if form.fields.email.error()
      <span>${form.fields.email.error}</span>
    #end
  </form>
`
```

Field components are regular `.jcr` modules — see `examples/jacare-todo/src/components/Field.jcr`.

### Classes

```javascript
view`<li class-done=${item.done}>${item.label}</li>`
```

## Control flow

### Conditionals

```javascript
view`
#if loading
  <p>Loading…</p>
#elif error
  <p>${error}</p>
#else
  <Content />
#end
`
```

### Lists

```javascript
view`
<ul>
  #for items() as item (item.id)
    <li>${item.label}</li>
  #end
</ul>
`
```

The expression in parentheses is the key used for DOM reconciliation.

When an item keeps the same key but changes identity (immutable updates with spread), Jacaré re-renders that row automatically.

## Components

Import another `.jcr` or `.js` module and use it as a self-closing tag:

```javascript
import TodoItem from './TodoItem.jcr'

view`<TodoItem :item=${item} />`
```

Props are inferred from attribute expressions.

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
| `where()` | Reactive current place |

`createNav({ base: '/app' })` sets the URL prefix for all screens.

Layout shells expose a frame slot:

```html
<a jacare-go="/" href="/">Home</a>
<main jacare-frame></main>
```

Props are inferred from `:name=${expr}` attributes.

## Compiler

Every `.jcr` file compiles to `mount()`, `render()`, and `resume()`. The compiler imports only the runtime helpers each file uses (`bindText`, `bindModel`, `branch`, etc.).

### Prop and signal detection

- **Mount props** — identifiers used in the template but not declared in the module script (all `import` blocks are scanned)
- **Signals** — names assigned with `signal`, `pulse`, `computed`, or `derive` in the module script
- **Module imports** — values imported from other files (e.g. `topics` from `./topics.js`) are never treated as mount props
- **String literals** — signal-like text inside `` `...` `` strings in the script is ignored during signal detection

### Bindings

| Pattern | Compiled as |
|---------|-------------|
| `${count}` when `count` is a signal | `bindText` |
| `` `Total: ${total}` `` with signal `total` | `effect` with `` `Total: ${total()}` `` |
| `bind-value=${draft}` on a signal | `bindModel` (two-way) |
| `href=${() => href(id)}` | `effect` that invokes the expression |
| `on-click=${handler}` | `addEventListener` + cleanup |

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
