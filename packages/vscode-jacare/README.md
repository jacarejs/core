# Jacaré for VS Code

[![Visual Studio Marketplace Version](https://vsmarketplacebadges.dev/version-short/heberalmeida.jacare.svg)](https://marketplace.visualstudio.com/items?itemName=heberalmeida.jacare)
[![Visual Studio Marketplace Downloads](https://vsmarketplacebadges.dev/downloads-short/heberalmeida.jacare.svg)](https://marketplace.visualstudio.com/items?itemName=heberalmeida.jacare)
[![Visual Studio Marketplace Installs](https://vsmarketplacebadges.dev/installs-short/heberalmeida.jacare.svg)](https://marketplace.visualstudio.com/items?itemName=heberalmeida.jacare)
[![CI](https://github.com/jacarejs/core/actions/workflows/publish-vscode.yml/badge.svg)](https://github.com/jacarejs/core/actions/workflows/publish-vscode.yml)
[![license](https://img.shields.io/github/license/jacarejs/core.svg?color=189030)](https://github.com/jacarejs/core/blob/main/LICENSE)
[![demo Lab](https://img.shields.io/badge/demo-Lab-78c018.svg)](https://jacarejs.github.io/core/lab/)

<p align="center">
  <a href="https://marketplace.visualstudio.com/items?itemName=heberalmeida.jacare">
    <img
      src="https://raw.githubusercontent.com/jacarejs/core/main/examples/jacare-bmi/public/jacare-logo.png"
      width="180"
      alt="Jacaré logo"
    />
  </a>
</p>

Official language support for [Jacaré](https://github.com/jacarejs/core) `.jcr` files — syntax highlighting, snippets, file icons, and editor ergonomics for the Jacaré reactive UI framework.

**Publisher:** [heberalmeida](https://marketplace.visualstudio.com/publishers/heberalmeida)  
**Extension ID:** [`heberalmeida.jacare`](https://marketplace.visualstudio.com/items?itemName=heberalmeida.jacare)  
**Author:** Heber Almeida  
**Marketplace:** [https://marketplace.visualstudio.com/items?itemName=heberalmeida.jacare](https://marketplace.visualstudio.com/items?itemName=heberalmeida.jacare)  
**Live Lab:** [https://jacarejs.github.io/core/lab/](https://jacarejs.github.io/core/lab/)

---

## Features

| Feature | Description |
|---------|-------------|
| **Syntax highlighting** | JavaScript module body, `view` / `style` / `contract` blocks, directives, HTML, and bindings |
| **Template directives** | `#if`, `#elif`, `#else`, `#end`, `#for` (and `@if` / `@each` aliases) |
| **Template contracts** | Colored `export <contract>` tags plus `props` / `pulses` / `slots` / `emits` / `forwards` fields |
| **Snippets** | Prefixes for component scaffold, contract, view, style, signals, and template control flow |
| **Component tags** | PascalCase components such as `<Field />` and `<Card>` |
| **Bindings** | `bind-value`, `on-click`, `@click`, `:prop`, `on-inc` (contract emits), `class-active`, `${expr}` |
| **Scoped CSS** | `style` tagged templates and `export <style>` highlighted as CSS |
| **File icons** | Jacaré logo for `.jcr` files in the Explorer |
| **Editor helpers** | Auto-closing brackets, quotes, and template literals |

---

## Installation

### Visual Studio Marketplace

1. Open the **Extensions** panel (`Cmd+Shift+X` / `Ctrl+Shift+X`)
2. Search for **Jacaré**
3. Install **Jacaré** by **heberalmeida**

Or install from the command line:

```bash
code --install-extension heberalmeida.jacare
```

### From source (monorepo)

```bash
cd packages/vscode-jacare
yarn install
yarn build
yarn package
code --install-extension jacare-0.0.10.vsix --force
```

### Development mode

1. Open the `packages/vscode-jacare` folder in VS Code
2. Run **Run Extension** from the Debug panel (F5)
3. A new Extension Development Host window opens with the extension loaded

---

## Snippets

In a `.jcr` file, type a prefix and accept the suggestion (`Tab` / `Enter`). Snippets use the `jacare` language id.

| Prefix | Aliases | Inserts |
|--------|---------|---------|
| `jcr-component` | `jacare-component` | Full scaffold: `export <contract>` + `<view>` + `<style>` |
| `jcr-contract` | `export-contract` | Contract with `props`, `pulses`, `slots`, and `emits` |
| `jcr-props` | `contract-props` | Minimal contract (`required` + `model` props) |
| `jcr-view` | `export-view` | `export <view>…</view>` |
| `jcr-style` | `export-style` | `export <style>…</style>` |
| `jcr-signal` | `signal` | `const name = signal(…)` |
| `jcr-computed` | `computed` | `const name = computed(() => …)` |
| `jcr-if` | `#if` | `#if` / `#end` |
| `jcr-ifelse` | `#ifelse` | `#if` / `#else` / `#end` |
| `jcr-for` | `#for` | `#for items() as item (item.id)` / `#end` |
| `jcr-bind` | `bind-value` | `bind-value=${signal}` |
| `jcr-click` | `on-click` | `on-click=${handler}` |
| `jcr-emit` | `emit` | `emit('change')` |
| `jcr-slot` | `slot` | `<slot name="…" />` |
| `jcr-use` | `component-tag` | `<Component :prop=${value}>…</Component>` |

### Snippet examples

**Component scaffold** (`jcr-component`):

```javascript
export <contract>
  props: {
    label: { type: 'string', required: true }
  }
  emits: ['change']
</contract>

export <view>
  <div class="component">
    
  </div>
</view>

export <style>
.component {
  
}
</style>
```

**Contract** (`jcr-contract`):

```javascript
export <contract>
  props: {
    label: { type: 'string', required: true }
  }
  pulses: {
    count: 'number'
  }
  slots: ['default', 'actions']
  emits: ['change']
</contract>
```

**Control flow** (`jcr-if`, `jcr-for`):

```javascript
#if show()
  <p>Visible</p>
#else
  <p>Hidden</p>
#end

#for items() as item (item.id)
  <li>${item.label}</li>
#end
```

Tab through placeholders to fill names, types, and handlers.

## Language support

### File extension

| Extension | Language ID | Aliases |
|-----------|-------------|---------|
| `.jcr` | `jacare` | Jacaré, jacare, jcr |

Jacaré files are plain JavaScript modules. The extension highlights both the script and embedded templates.

### Highlighted syntax

**JavaScript module**

**Tagged template**

```javascript
import { signal, view } from '@jacare/core'

const count = signal(0)

function increment() {
  count.update((n) => n + 1)
}

export default view`
  <div class="counter">
    <p>${count}</p>
    <button on-click=${increment}>+1</button>
  </div>
`
```

**View block** (HTML-style alternative)

```javascript
import { signal } from '@jacare/core'

const count = signal(0)

function increment() {
  count.update((n) => n + 1)
}

export <view>
  <div class="counter">
    <p>${count}</p>
    <button on-click=${increment}>+1</button>
  </div>
</view>
```

**Template contracts**

Declare the component surface with `export <contract>`. The compiler checks parents with `jacare check` (and Vite transform) — no runtime PropTypes. Use `bind-value` for `model: true` props; `:value` is rejected.

```javascript
export <contract>
  props: { label: 'string' }
  pulses: { count: 'number' }
  slots: ['default', 'actions']
  emits: ['inc']
</contract>

export <view>
  <p>${label}: ${count}</p>
  <slot name="actions" />
  <button on-click=${() => emit('inc')}>+</button>
</view>
```

Parent usage (validated at check time):

```javascript
<Counter :label=${'Score'} :count=${score} on-inc=${() => score.update((n) => n + 1)}>
  <button slot="actions">Reset</button>
</Counter>
```

| Contract field | Meaning |
|----------------|---------|
| `props` | Accepted props (`'string'` or `{ type, required, default, model }`) |
| `pulses` | Props expected to be pulses/signals |
| `slots` | Slot names (`default` → `children`) |
| `emits` | Events via `emit('name')` — parent listens with `on-name` |

See the [API — Template contracts](https://github.com/jacarejs/core/blob/main/docs/api.md#template-contracts-export-contract) section for the full reference.

**Template directives**

```javascript
view`
#if show()
  <p>Visible</p>
#else
  <p>Hidden</p>
#end

#for items() as item (item.id)
  <li>{item.label}</li>
#end
`
```

**Components and slots**

```javascript
view`
<Card :title=${title}>
  <p>Slot content</p>
</Card>
`
```

**Scoped styles**

```javascript
export <style>
.card { padding: 1rem; }
.title { font-weight: bold; }
</style>
```

### Scope names (for theme authors)

| Scope | Used for |
|-------|----------|
| `source.jacare` | Root language scope |
| `keyword.control.jacare` | `#if`, `#for`, `#end`, `@each`, etc. |
| `entity.name.tag.jacare` | `view`, `style`, and `contract` block tags |
| `entity.name.tag.jacare.contract` | `<contract>` / `</contract>` specifically |
| `keyword.other.contract.jacare` | Contract fields: `props`, `pulses`, `slots`, `emits`, `forwards` |
| `entity.name.type.tag.jacare` | PascalCase components |
| `entity.name.tag` | HTML elements (`div`, `slot`, `button`, `view`, `style`, …) |
| `entity.other.attribute-name` | `bind-*`, `on-*`, `class-*`, `:prop` |
| `meta.embedded.expression.jacare` | `${expression}` inside templates |
| `meta.contract.jacare` | Entire `export <contract>…</contract>` block |
| `source.css` | Content inside `style` blocks |

---

## File icons

The extension contributes the **Jacaré Icons** file icon theme and sets it as the default when installed.

| File type | Icon |
|-----------|------|
| `.jcr` | Jacaré logo |
| Other files | Minimal generic file/folder icons |

If icons do not appear:

1. Open Command Palette (`Cmd+Shift+P` / `Ctrl+Shift+P`)
2. Run **Preferences: File Icon Theme**
3. Select **Jacaré Icons**
4. Run **Developer: Reload Window**

---

## Configuration

The extension works out of the box. No settings are required.

To use another file icon theme while keeping syntax highlighting, pick any theme in **Preferences: File Icon Theme**. Language highlighting for `.jcr` files remains active.

### Recommended workspace settings

Optional `settings.json` for Jacaré projects:

```json
{
  "files.associations": {
    "*.jcr": "jacare"
  },
  "editor.quickSuggestions": {
    "strings": true
  }
}
```

---

## What this extension does not include

| Not included | Alternative |
|--------------|-------------|
| IntelliSense / autocomplete | Use snippets (`jcr-*`) plus TypeScript with `jacare.d.ts` in your project |
| Go to definition in templates | Planned for a future release |
| Formatting | Format the JavaScript parts with your Prettier/ESLint setup |
| Contract / template diagnostics | Use `jacare check` from `@jacare/cli` (validates `export <contract>` against parents) |

---

## Related documentation

- [Jacaré repository](https://github.com/jacarejs/core)
- [API reference](https://github.com/jacarejs/core/blob/main/docs/api.md) — including [template contracts](https://github.com/jacarejs/core/blob/main/docs/api.md#template-contracts-export-contract)
- [Syntax guide](https://github.com/jacarejs/core/blob/main/docs/syntax.md)
- [Live demos](https://jacarejs.github.io/core/) — [Todo](https://jacarejs.github.io/core/todo/) · [Showcase](https://jacarejs.github.io/core/showcase/) · [Scale BMI](https://jacarejs.github.io/core/bmi/) · [Lab](https://jacarejs.github.io/core/lab/)
- [Compiler docs](https://github.com/jacarejs/core/blob/main/docs/phases/02-compiler.md)

---

## License

MIT © Heber Almeida
