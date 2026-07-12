# Jacaré for VS Code

Official language support for [Jacaré](https://github.com/jacarejs/core) `.jcr` files — syntax highlighting, file icons, and editor ergonomics for the Jacaré reactive UI framework.

**Publisher:** [heberalmeida](https://marketplace.visualstudio.com/publishers/heberalmeida)  
**Extension ID:** `heberalmeida.jacare`  
**Author:** Heber Almeida

---

## Features

| Feature | Description |
|---------|-------------|
| **Syntax highlighting** | JavaScript module body, `view` templates, `style` blocks, directives, HTML, and bindings |
| **Template directives** | `#if`, `#elif`, `#else`, `#end`, `#for` (and `@if` / `@each` aliases) |
| **Component tags** | PascalCase components such as `<Field />` and `<Card>` |
| **Bindings** | `bind-value`, `on-click`, `@click`, `:prop`, `class-active`, and `${expr}` interpolations |
| **Scoped CSS** | `style` tagged templates highlighted as CSS |
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
code --install-extension jacare-0.0.4.vsix --force
```

### Development mode

1. Open the `packages/vscode-jacare` folder in VS Code
2. Run **Run Extension** from the Debug panel (F5)
3. A new Extension Development Host window opens with the extension loaded

---

## Language support

### File extension

| Extension | Language ID | Aliases |
|-----------|-------------|---------|
| `.jcr` | `jacare` | Jacaré, jacare, jcr |

Jacaré files are plain JavaScript modules. The extension highlights both the script and embedded templates.

### Highlighted syntax

**JavaScript module**

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
style`
.card { padding: 1rem; }
.title { font-weight: bold; }
`
```

### Scope names (for theme authors)

| Scope | Used for |
|-------|----------|
| `source.jacare` | Root language scope |
| `keyword.control.jacare` | `#if`, `#for`, `#end`, `@each`, etc. |
| `keyword.tag.jacare` | `view`, `style` tagged templates |
| `entity.name.type.tag.jacare` | PascalCase components |
| `entity.name.tag` | HTML elements (`div`, `slot`, `button`, …) |
| `entity.other.attribute-name` | `bind-*`, `on-*`, `class-*`, `:prop` |
| `meta.embedded.expression.jacare` | `${expression}` inside templates |
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
| IntelliSense / autocomplete | Use TypeScript with `jacare.d.ts` in your project |
| Go to definition in templates | Planned for a future release |
| Formatting | Format the JavaScript parts with your Prettier/ESLint setup |
| Linting | Use `jacare check` from `@jacare/cli` |

---

## Related documentation

- [Jacaré repository](https://github.com/jacarejs/core)
- [Syntax guide](https://github.com/jacarejs/core/blob/main/docs/syntax.md)
- [Live demo](https://jacarejs.github.io/core/)
- [Compiler docs](https://github.com/jacarejs/core/blob/main/docs/phases/02-compiler.md)

---

## Publishing (maintainers)

### Prerequisites

1. [Personal Access Token](https://code.visualstudio.com/api/working-with-extensions/publishing-extension#get-a-personal-access-token) with **Marketplace → Manage**
2. Publisher **heberalmeida** registered at [marketplace.visualstudio.com/manage](https://marketplace.visualstudio.com/manage)
3. GitHub repository secret `VSCE_PAT`

### Automated release (recommended)

1. Go to **Actions → Publish VS Code Extension**
2. Choose version bump: `patch`, `minor`, or `major`
3. Run workflow

The workflow will:

- Bump `packages/vscode-jacare/package.json` version
- Build and publish to the Visual Studio Marketplace
- Commit the version bump and create tag `vscode-vX.Y.Z`

### Manual release

```bash
node scripts/sync-versions.mjs vscode bump patch
cd packages/vscode-jacare
yarn build
yarn publish
```

---

## License

MIT © Heber Almeida
