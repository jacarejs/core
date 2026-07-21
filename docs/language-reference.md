# Jacaré Language Reference

<p align="center">
  <img src="../packages/cli/assets/jacare-logo.png" width="120" alt="Jacaré logo" />
</p>

Complete reference for **reserved words**, **bindings**, **`<view>` / `<style>` / `<contract>`**, **control flow**, and **CLI** commands (`create` / `dev` / `build` / `check`).

Companion docs: [api.md](api.md) (API walkthrough) · [syntax.md](syntax.md) (cheatsheet) · [Jacaré Lab](https://jacarejs.github.io/core/lab/) (live demos) · Lab lesson [`/language`](https://jacarejs.github.io/core/lab/#/language)

---

## Table of contents

1. [What Jacaré reserves](#1-what-jacaré-reserves)
2. [Module blocks — `<view>` · `<style>` · `<contract>`](#2-module-blocks--view--style--contract)
3. [All bindings (complete catalog)](#3-all-bindings-complete-catalog)
4. [Conditionals and lists](#4-conditionals-and-lists)
5. [Events](#5-events)
6. [Components, slots, and props](#6-components-slots-and-props)
7. [Special elements and attributes](#7-special-elements-and-attributes)
8. [Pulse Mesh addresses](#8-pulse-mesh-addresses)
9. [Create, run, and build](#9-create-run-and-build)
10. [Quick decision tables](#10-quick-decision-tables)

---

## 1. What Jacaré reserves

Jacaré files are **plain JavaScript**. Reserved names below are meaningful to the **compiler** or **runtime** when they appear in the positions described. They are not all JS keywords — some are template directives, attribute prefixes, or HTML-like tags inside `.jcr` blocks.

### 1.1 Exported module blocks

| Token | Role | Required? |
|-------|------|-----------|
| `export <view>…</view>` | Markup + bindings for the component / page | **Yes** (or a supported view form) |
| `export <style>…</style>` | Scoped CSS for this module | Optional |
| `export <contract>…</contract>` | Declared props / pulses / slots / emits / links | Optional |
| `export default <view>` | Same as view, also the default export | Optional form |
| `return <view>` | View returned from a factory module | Optional form |
| `view\`…\`` / `style\`…\`` | Legacy tagged-template forms | Supported |

**Power:** these blocks are stripped from the JS script region at compile time. Script above them is normal ESM. Order in source: imports → logic → `contract` (if any) → `view` → `style` last.

```javascript
import { signal } from '@jacare/core'

const open = signal(false)

export <contract>
  props: { title: 'string' }
</contract>

export <view>
  <h1>${title}</h1>
  #if open()
    <p>Open</p>
  #end
</view>

export <style>
h1 { font-weight: 700; }
</style>
```

### 1.2 Template control-flow directives

Must start on their **own line** (optional indent). Work inside `<view>` and inside `<style>`.

| Canonical | Alias | Meaning |
|-----------|-------|---------|
| `#if <expr>` | `@if <expr>` | Open conditional arm |
| `#elif <expr>` | `@elseif <expr>` | Else-if arm |
| `#else` | `@else` | Fallback arm |
| `#end` | `@end` | Close `#if` / `#case` / `#for` |
| `#case <expr>` | — | Match scrutinee once |
| `#when <value>` | — | Arm of `#case` (`Object.is`) |
| `#for <list> as <item> [(key)]` | `@each …` | Keyed list |
| `#for <list> as <item>, <index> [(key)]` | `@each …` | List with index |

**Power:** inactive arms are **not** in the DOM. Switching arms disposes bindings and remounts. Lists reconcile by **key**, not index.

```javascript
export <view>
#if loading()
  <p>Loading…</p>
#elif error()
  <p>${error}</p>
#else
  <Content />
#end

#case role()
  #when 'admin'
    <Admin />
  #when 'guest'
    <Guest />
  #else
    <Member />
#end

#for items() as item, i (item.id)
  <li>${i}: ${item.label}</li>
#end
</view>
```

### 1.3 Attribute prefixes (binding / event sugar)

| Prefix | Kind | Example | Compiles to |
|--------|------|---------|-------------|
| `on-<event>` | Event | `on-click=${fn}` | `addEventListener('click', …)` |
| `@<event>` | Event alias | `@click=${fn}` | Same |
| `bind-<name>` | One-way attr / two-way model | `bind-href=${url}`, `bind-value=${text}` | `bindAttribute` / `bindModel` / prop model |
| `:<name>` | One-way attr or component prop | `:src=${url}`, `:title=${t}` | attr bind or prop |
| `class-<name>` | Toggle class | `class-active=${on}` | `bindClass` |
| `class:<name>` | Class alias | `class:active=${on}` | Same |
| `style---<var>` | CSS custom property | `style---pct=${pct}` | `--pct` via `bindStyleVar` / CPW |
| `style:<var>` | Style-var alias | `style:pct=${pct}` | Same |

**Power:** prefixes are parsed before HTML attribute rules. On **components** (PascalCase tags), `:` means **prop** and `bind-` means **model prop**. On **DOM elements**, `:` / `bind-` mean **attribute / property** bindings.

### 1.4 Special tags and attributes

| Name | Context | Role |
|------|---------|------|
| `<slot />` / `<slot name="x" />` | Child view | Project parent children |
| `<debug>…</debug>` | View (dev) | Pretty JSON inspector; stripped in production |
| `slot="name"` | Parent → child | Named slot content |
| `jacare-frame` | Layout shell | Mount point for active nav screen |
| `jacare-go` | Links | Client navigation path |
| `jacare-here` | Class (runtime) | Active-route marker on `jacare-go` links |

### 1.5 Contract field names

Only these keys are valid inside `export <contract>`:

| Field | Value shape | Power |
|-------|-------------|-------|
| `props` | `{ name: 'type' \| { type, required?, default?, model? } }` | Public one-way / model props |
| `pulses` | `{ name: 'type' }` | Props that must be signals/pulses |
| `slots` | `['default', 'actions', …]` | Allowed slot names (`default` → `children`) |
| `emits` | `['inc']` or `{ change: { value: 'string' } }` | Child → parent events via `emit` / `on-*` |
| `forwards` | string array | Reserved for future emit bridging |
| `links` | `{ alias: 'bag.key' \| { from, mode } }` | Mesh ports without importing the bag |

Unknown contract fields fail compile / `jacare check`.

### 1.6 Mesh address sugar

| Form | Where | Meaning |
|------|-------|---------|
| `${@bag/key}` | Text / attrs / `#if` / `#for` / events | `getBag('bag')?.key` |
| `@bag/key` inside `${…}` | Same | Same Mesh Port as an imported `bag.key` |

Bag / key ids may include hyphens (`@lab-cart/count`).

### 1.7 Reactivity names (runtime API — not template keywords)

| Canonical | Alias | Role |
|-----------|-------|------|
| `signal` | `pulse` | Writable reactive cell |
| `computed` | `derive` | Derived cell |
| `effect` | `watch` | Side effect |
| `untrack` | `runUntracked` | Read without tracking |
| `batch` | `ripple` (bags) | Coalesce writes |

These are **imports**, not reserved identifiers in templates — but `${count}` vs `${count()}` is a style convention the checker understands.

### 1.8 Names you should not collide with

Avoid declaring script locals that clash with compiler-injected helpers when a feature is used:

| Injected / ambient | When |
|--------------------|------|
| `emit` | Contract `emits` present |
| Link aliases (`count`, `add`, …) | Contract `links` |
| `children` | Default slot / parent content |
| `props` merge keys | Mount props inferred from template |

---

## 2. Module blocks — `<view>` · `<style>` · `<contract>`

### 2.1 `<view>` — full power

**What it is:** the only place for HTML-like markup, interpolations, directives, components, and event/bind attributes.

**Supported forms:**

```javascript
export <view>…</view>
export default <view>…</view>
return <view>…</view>
export default view`…`
```

**What you can put inside:**

| Feature | Example |
|---------|---------|
| Static HTML | `<div class="card">…</div>` |
| Text | `${title}` / `${() => item.label}` |
| Mesh text | `${@cart/count}` |
| Events | `on-click=${save}` / `@keydown=${onKey}` |
| Attr binds | `bind-href=${url}` / `:disabled=${busy}` |
| Two-way | `bind-value=${draft}` / `bind-checked=${ok}` |
| Classes | `class-done=${item.done}` |
| CSS vars | `style---pct=${pct}` |
| Conditionals | `#if` / `#case` |
| Lists | `#for items() as item (item.id)` |
| Components | `<Card :title=${t}>…</Card>` |
| Slots | `<slot />` / `<slot name="actions" />` |
| Debug | `<debug copy label="state">${state}</debug>` |

**Compiled exports from every module with a view:**

| Export | Role |
|--------|------|
| `mount(target, props?)` | Client render → dispose |
| `render(props?)` | SSR HTML + binding state |
| `resume(target, state, props?)` | Hydrate |
| `default` | Alias for `mount` |

**Minimal working example:**

```javascript
import { signal } from '@jacare/core'

const count = signal(0)

export <view>
  <button type="button" on-click=${() => count.update((n) => n + 1)}>
    ${count}
  </button>
</view>
```

### 2.2 `<style>` — full power

**What it is:** CSS scoped to this module’s mount root via `data-jacare-s`.

```javascript
export <style>
.card { padding: 1rem; }
</style>

export <style lang="scss">
/* lang parsed as styleLang; body passed through until a preprocessor is wired */
</style>
```

**Capabilities:**

| Capability | How |
|------------|-----|
| Scoping | Selectors prefixed with `[data-jacare-s="…"]` |
| Escape hatch | `:global(.shared) { … }` |
| Reactive CSS | `#if` / `#elif` / `#else` / `#case` / `#when` / `#for` / `${expr}` **inside** the style block (directive on its own line) |
| Reactive vars from view | `style---name=${signal}` on elements + `var(--name)` in CSS |

```javascript
const theme = signal('day')
const accents = signal([{ id: 'leaf', color: '#8fd12a' }])

export <view>
  <div class="card" class-night=${() => theme() === 'night'}>Hello</div>
</view>

export <style>
.card {
  #if theme() === 'night'
    background: #0b1a14;
    color: #e8ffe8;
  #else
    background: #f8fffb;
    color: #0b1a14;
  #end
}

#for accents() as accent (accent.id)
.chip-${accent.id} {
  border-color: ${accent.color};
}
#end

:global(.toast) {
  position: fixed;
}
</style>
```

**Power:** static sheets share one scoped inject; reactive sheets use a **per-mount** stylesheet so instances do not clash.

### 2.3 `<contract>` — full power

**What it is:** a compile-time surface for reusable components. Validated by `jacare check` and the Vite transform — **no runtime PropTypes**.

```javascript
export <contract>
  props: {
    label: { type: 'string', required: true }
    open: { type: 'boolean', default: false }
    value: { type: 'string', model: true }
  }
  pulses: {
    count: 'number'
  }
  slots: ['default', 'actions']
  emits: {
    change: { value: 'string' }
  }
  links: {
    total: { from: 'cart.total', mode: 'read' }
    add: { from: 'cart.add', mode: 'write' }
  }
</contract>
```

| Feature | Parent syntax | Child syntax |
|---------|---------------|--------------|
| One-way prop | `:label=${'Hi'}` | `${label}` |
| Required | Must be present | — |
| Default | Omitted → injected | `open` may be undefined-safe via `??` |
| Model (two-way) | `bind-value=${email}` | `bind-value=${value}` → `bindModel` |
| Pulse prop | `:count=${score}` (must be signal) | `${count}` |
| Emit | `on-change=${handler}` | `emit('change', payload)` |
| Named slot | `<button slot="actions">` | `<slot name="actions" />` |
| Mesh link | Bag registered in app | `${total}` / `add(…)` without import |

**Link modes:**

| Mode | Meaning |
|------|---------|
| `read` | Bind / derive (default; `'cart.count'` shorthand) |
| `write` | Intent function |
| `mirror` | Two-way when the published key is a writable pulse |

**Validation failures (examples):** missing `required`, unknown prop, `:value` on a `model` prop, `bind-x` on a non-model prop, missing Mesh publish for `links`, emit name not declared.

---

## 3. All bindings (complete catalog)

Bindings connect reactive data to the DOM (or to component props). Prefer **bare** expressions when there is no loop local to capture: `${count}` / `${cart.count()}` over redundant `${() => count()}`.

### 3.1 Text interpolation `${…}`

| Expression shape | Runtime (concept) | Notes |
|------------------|-------------------|-------|
| Bare signal / pulse | `bindText` (dev) / CPW (prod) | Best for simple cells |
| Prop identifier | `bindPropText` | Signal **or** string |
| Mesh `${@bag/key}` | Same as imported port | Needs bag registered |
| Mixed template | `effect` updating `node.data` | e.g. `` `Hi ${name()}` `` |
| Arrow | Captures `#for` / handler locals | Use when needed |

```javascript
export <view>
  <p>${greeting}</p>
  <p>${@cart/count}</p>
  #for items() as item (item.id)
    <span>${() => label(item.id)}</span>
  #end
</view>
```

### 3.2 One-way attribute / property — `bind-*` and `:`

| Syntax | On DOM element | On component |
|--------|----------------|--------------|
| `bind-href=${url}` | Attribute `href` | Model prop named `href` (if `model: true`) |
| `:href=${url}` | Same as bind (alias) | One-way prop `href` |
| `:disabled=${busy}` | Boolean attr (removed when falsy) | Prop `disabled` |
| `:src=${avatar}` | Attribute `src` | Prop `src` |

```javascript
const url = signal('/about')
const busy = signal(false)

export <view>
  <a bind-href=${url}>About</a>
  <img :src=${avatar} alt="Avatar" />
  <button type="button" :disabled=${busy} on-click=${save}>Save</button>
</view>
```

**Power:** signal-backed attrs update when the cell changes. Production CPW inlines one-way `bind-*` when the source is a static signal reference.

### 3.3 Two-way form binding — `bind-value` / `bind-checked`

| Attribute | Typical element | Compiles to |
|-----------|-----------------|-------------|
| `bind-value=${draft}` | `input`, `textarea`, `select` | `bindModel(el, 'value', draft)` |
| `bind-checked=${on}` | `input[type=checkbox\|radio]` | `bindModel(el, 'checked', on)` |

Requires a **writable signal**. Complex expressions fall back to one-way property binding.

```javascript
const draft = signal('')
const agreed = signal(false)
const qty = signal(1)

export <view>
  <input bind-value=${draft} placeholder="Name" />
  <textarea bind-value=${draft}></textarea>
  <label><input type="checkbox" bind-checked=${agreed} /> Agree</label>
  <input type="number" min="1" bind-value=${qty} />
</view>
```

**With conditionals:**

```javascript
export <view>
#if showForm()
  <form on-submit=${onSubmit}>
    <input bind-value=${email} />
    #if emailError()
      <span class="err">${emailError}</span>
    #end
  </form>
#end
</view>
```

**With contract model prop:**

```javascript
// Field.jcr
export <contract>
  props: {
    label: { type: 'string', required: true }
    value: { type: 'string', model: true }
  }
</contract>

export <view>
  <label>${label}</label>
  <input bind-value=${value} />
</view>

// parent
<Field :label=${'Email'} bind-value=${email} />
```

### 3.4 Class toggles — `class-*` / `class:*`

| Syntax | Effect |
|--------|--------|
| `class-done=${item.done}` | Add/remove class `done` when truthy |
| `class-active=${() => tab() === id}` | Arrow when comparing loop locals |
| `class:active=${on}` | Alias |

Multiple `class-*` on one element are independent.

```javascript
export <view>
  <li class-done=${item.done} class-selected=${selected}>${item.label}</li>

  #for tabs as tab (tab)
    <button
      type="button"
      class-active=${() => current() === tab}
      on-click=${() => current.set(tab)}
    >${tab}</button>
  #end
</view>
```

### 3.5 CSS variable binding — `style---` / `style:`

| Syntax | Sets |
|--------|------|
| `style---pct=${pct}` | `el.style.setProperty('--pct', …)` |
| `style:angle=${angle}` | `--angle` |

Use `computed` / `derive` when you need units (`50%`, `12rem`).

```javascript
const width = signal(40)
const pct = computed(() => width() + '%')

export <view>
  <div class="bar" style---pct=${pct}></div>
  <input type="range" min="0" max="100" bind-value=${width} />
</view>

export <style>
.bar {
  width: var(--pct);
  height: 8px;
  background: #189030;
  transition: width 0.15s ease;
}
</style>
```

### 3.6 Component props (binding surface)

| Parent | Meaning |
|--------|---------|
| `title="Hello"` | Static string prop |
| `:title=${title}` | One-way (signal or expr) |
| `bind-value=${email}` | Two-way **model** (contract `model: true`) |
| `on-save=${fn}` | Emit listener (contract `emits`) or callback prop |
| Inner HTML | Default slot → `children` |
| `slot="actions"` | Named slot |

### 3.7 What CPW covers (production)

| Covered (inlined) | Still runtime helper |
|-------------------|----------------------|
| `${signal}`, one-way `bind-*`, `class-*`, `style---*` | `bindModel`, mixed text, arrows, component props, `#if` / `#for` / `#case` |

```javascript
// vite.config.js — CPW auto-on for production client builds
jacare({ cpw: 'auto', inspect: true })
```

### 3.8 Binding cheat sheet (one screen)

```
Text          ${x}  ${@bag/key}  ${() => f(item)}
Attr          bind-href=${u}  :disabled=${b}
Two-way       bind-value=${s}  bind-checked=${s}
Class         class-on=${flag}  class:on=${flag}
CSS var       style---pct=${p}  style:pct=${p}
Component     :prop=${x}  bind-modelProp=${s}  on-event=${fn}
```

---

## 4. Conditionals and lists

### 4.1 `#if` / `#elif` / `#else` / `#end`

```javascript
export <view>
#if loading()
  <p>Loading…</p>
#elif items().length === 0
  <p>Empty</p>
#else
  <ul>
    #for items() as item (item.id)
      <li class-done=${item.done}>${item.label}</li>
    #end
  </ul>
#end
</view>
```

**Rules:**

- Condition can be a signal, computed, or any JS expression.
- Nested `#if` is allowed.
- Sibling order inside a branch is preserved (`branch` insertion cursor).
- Prefer `#case` when every arm compares the **same** value.

### 4.2 `#case` / `#when` / `#else`

```javascript
export <view>
#case status()
  #when 'idle'
    <Idle />
  #when 'busy'
    <Spinner />
  #else
    <ErrorPanel />
#end
</view>
```

Scrutinee evaluated once per update; arms use `Object.is`.

### 4.3 `#for` keyed lists

```javascript
export <view>
#for items() as item, index (item.id)
  <li>
    ${index}. ${item.label}
    <button type="button" on-click=${() => remove(item.id)}>×</button>
  </li>
#end
</view>
```

| Piece | Role |
|-------|------|
| `items()` | Source (signal/array/expr) |
| `item` | Row local |
| `index` | Optional index local |
| `(item.id)` | **Key** for reconcile (required for stable DOM) |

**Immutable updates** keep the same key and refresh the row:

```javascript
items.update((list) =>
  list.map((row) => (row.id === id ? { ...row, done: !row.done } : row)),
)
```

### 4.4 Combining `#if` + `#for` + binds

```javascript
export <view>
#if !ready()
  <p>Booting…</p>
#else
  #for rows() as row (row.id)
    #if row.visible
      <article class-active=${() => selected() === row.id}>
        <h3>${row.title}</h3>
        <input bind-value=${() => /* prefer row-level signals */} />
      </article>
    #end
  #end
#end
</view>
```

For editable rows, store per-item signals in the list model (or bind to a bag field), not to a non-signal expression.

---

## 5. Events

| Canonical | Alias |
|-----------|-------|
| `on-click=${fn}` | `@click=${fn}` |
| `on-input=${fn}` | `@input=${fn}` |
| `on-submit=${fn}` | `@submit=${fn}` |
| `on-keydown=${fn}` | `@keydown=${fn}` |
| …any DOM event | `on-<name>` / `@<name>` |

```javascript
export <view>
  <button type="button" on-click=${save}>Save</button>
  <button type="button" @click=${() => cancel(item.id)}>Cancel</button>
  <input
    bind-value=${query}
    on-keydown=${(e) => { if (e.key === 'Enter') search() }}
  />
  <form on-submit=${(e) => { e.preventDefault(); submit() }}>…</form>
</view>
```

Prefer `bind-value` / `bind-checked` over manual `on-input` for two-way fields.

---

## 6. Components, slots, and props

```javascript
// Card.jcr
export <contract>
  props: { title: 'string' }
  slots: ['default', 'footer']
</contract>

export <view>
  <div class="card">
    <h2>${title}</h2>
    <slot />
    <footer><slot name="footer" /></footer>
  </div>
</view>
```

```javascript
// parent
<Card :title=${'Hello'}>
  <p>Body</p>
  <button slot="footer" type="button" on-click=${close}>Close</button>
</Card>
```

PascalCase tags resolve to imports. Unknown lowercase tags are HTML.

---

## 7. Special elements and attributes

### `<debug>`

```javascript
export <view>
  <debug copy label="cart">${cart}</debug>
  <debug>${{ score, mood }}</debug>
</view>
```

Dev-only; stripped when Vite `debug: false` (production).

### Navigation attributes

```javascript
export <view>
  <nav>
    <a jacare-go="/" href="/">Home</a>
    <a jacare-go="/about" href="/about">About</a>
  </nav>
  <main jacare-frame></main>
</view>
```

`createNav` mounts screens into `[jacare-frame]` and toggles `.jacare-here` on matching `jacare-go` links.

---

## 8. Pulse Mesh addresses

```javascript
// bags/cart.js
export const cart = createBag('cart', () => {
  const count = pulse(0)
  return { count, add: () => count.update((n) => n + 1) }
})

// any view — import
import { cart } from '../bags/cart.js'
<span>${cart.count()}</span>

// address sugar — no import in this file
<span>${@cart/count}</span>
<button type="button" on-click=${() => getBag('cart')?.add()}>+</button>

// contract links
export <contract>
  links: { count: { from: 'cart.count', mode: 'read' } }
</contract>
<span>${count}</span>
```

`jacare check` verifies `links` against published `createBag` keys.

---

## 9. Create, run, and build

### 9.1 Create a project

```bash
# Option A — create-jacare (recommended)
npm create jacare@latest my-app
cd my-app && npm install && npm run dev

# Option B — global CLI
npm install -g @jacare/cli
jacare new my-app
# templates: minimal | nav | todo | vite-minimal | vite-nav | vite-todo
jacare new my-shop --template=todo
cd my-shop && npm install && jacare dev

# Option C — monorepo helper
yarn jacare new demo
```

### 9.2 Develop (hot reload)

```bash
jacare dev
jacare dev --port=4000
jacare dev --open=false

# Vite-template projects
npm run dev          # → vite
```

Default port `3000` (or `jacare.config.js` → `port`).

### 9.3 Production build

```bash
jacare build
# → dist/index.html + hashed assets

# Vite templates
npm run build        # → vite build
npm run preview      # → vite preview
```

### 9.4 Compile & check

```bash
jacare compile src/app.jcr
jacare compile src/app.jcr dist/app.js --watch

jacare check
jacare check --bindings      # print IR binding sites
jacare check --no-style      # silence style hints
jacare check --strict-style  # fail CI on style warnings
```

`jacare check` compiles every `.jcr` and validates **contracts** + **Mesh links** vs published bags. Exit code `1` on failure — use in CI.

### 9.5 Lab (this repo)

```bash
yarn lab:dev          # http://localhost:3003
yarn lab:build
yarn workspace jacare-lab preview
```

### 9.6 `jacare.config.js`

```javascript
export default {
  title: 'My App',
  port: 3000,
  base: '/',          // e.g. '/my-repo/' for GitHub Pages
}
```

### 9.7 Typical `package.json` scripts

```json
{
  "scripts": {
    "dev": "jacare dev",
    "build": "jacare build",
    "check": "jacare check",
    "check:bindings": "jacare check --bindings"
  }
}
```

---

## 10. Quick decision tables

### Which binding?

| Goal | Use |
|------|-----|
| Show reactive text | `${signal}` |
| Link href / img src | `bind-href` / `:src` |
| Input that edits a signal | `bind-value` / `bind-checked` |
| Toggle CSS class | `class-name=${bool}` |
| Drive `var(--x)` | `style---x=${computed}` |
| Pass data into child | `:prop=${…}` |
| Two-way into child | `bind-prop=${signal}` + `model: true` |
| Child notifies parent | `emits` + `emit` + `on-name` |

### Which block?

| Goal | Block |
|------|-------|
| Markup | `<view>` |
| Look & feel | `<style>` |
| Public API of a reusable component | `<contract>` |

### Which directive?

| Goal | Directive |
|------|-----------|
| Show A or B | `#if` |
| Many equals checks on one value | `#case` |
| Repeat rows | `#for … (key)` |

### Which command?

| Goal | Command |
|------|---------|
| Scaffold | `jacare new` / `npm create jacare@latest` |
| Local server | `jacare dev` / `npm run dev` |
| Ship | `jacare build` |
| CI / contracts | `jacare check` |
| Inspect bindings | `jacare check --bindings` |

---

## See also

| Doc | Content |
|-----|---------|
| [api.md](api.md) | Full API with Lab cross-links |
| [syntax.md](syntax.md) | Short cheatsheet |
| [testing.md](testing.md) | Test patterns for signals & compiler |
| [CLI README](../packages/cli/README.md) | CLI flags and templates in depth |
| Lab `/language` | Live reserved-word + binding reference |
| Lab `/bindings` · `/if` · `/module` · `/components` · `/css` · `/tooling` | Interactive lessons |

<p align="center">Made in Brazil 🇧🇷</p>
