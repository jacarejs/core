# Jacaré Showcase

A polished demo app showcasing the full potential of [Jacaré](https://github.com/jacarejs/core) — fine-grained reactivity, scoped CSS, slots, forms, file-based routing, and incremental DOM updates.

Live demo: [jacarejs.github.io/core/showcase](https://jacarejs.github.io/core/showcase/)

**Designed as a standalone repository:** [github.com/jacarejs/showcase](https://github.com/jacarejs/showcase)

![Jacaré brand colors](public/jacare-logo.png)

---

## Features demonstrated

| Page | What it shows |
|------|----------------|
| **Home** | Hero, live stats, feature cards with slots |
| **Reactivity** | `signal`, `computed`, `#if`, two-way bindings |
| **Components** | `<Card>` with `<slot />`, `export <style>` blocks |
| **Forms** | `createForm()`, validation, `Field` component |
| **Playground** | Keyed `#for` lists, immutable updates |

### Framework capabilities on display

- **Zero VDOM** — direct DOM bindings via compiler
- **Scoped CSS** — `export <style>` blocks per component
- **Slots / children** — composable component APIs
- **Lazy screens** — code-split page modules
- **Brand theme** — palette extracted from the Jacaré logo

### Color palette

| Token | Hex | Usage |
|-------|-----|-------|
| Deep | `#001818` | Text, code blocks |
| Forest | `#003030` | Headings, dark surfaces |
| Primary | `#189030` | Accents, values |
| Lime | `#78c018` | Highlights, gradients |
| Mint | `#d8f3dc` | Soft backgrounds |

---

## Quick start (standalone repo)

```bash
git clone https://github.com/jacarejs/showcase.git
cd showcase
yarn install
yarn dev
```

Open [http://localhost:3001](http://localhost:3001).

### From npm packages

```bash
yarn add @jacare/core
yarn add -D @jacare/cli @jacare/vite-plugin @jacare/meta @jacare/devtools
```

---

## Development (monorepo)

Inside the [jacarejs/core](https://github.com/jacarejs/core) monorepo:

```bash
yarn showcase:dev
yarn showcase:build
```

For GitHub Pages (subpath `/core/showcase/`):

```bash
JACARE_BASE=/core/showcase/ yarn build
```

---

## Project structure

```
jacare-showcase/
  public/jacare-logo.png
  src/
    shell.jcr              Layout + navigation
    nav.js                 Screen map + lazy loading
    boot.js                Entry point
    components/
      Card.jcr             Slots + scoped CSS
      Stat.jcr             Scoped stat tile
      Badge.jcr            Pill badge
      Field.jcr            Form field
    pages/
      index.jcr            Home
      reactivity.jcr       Signals demo
      components.jcr       Slots demo
      forms.jcr            Form validation
      playground.jcr       Keyed list
      not-found.jcr        404 screen
  vite.config.js           @jacare/vite-plugin
  jacare.config.js
```

---

## Extract as new repository

1. Copy `examples/jacare-showcase/` to a new folder
2. Update `package.json` `repository.url`
3. Replace monorepo scripts with npm packages:

```json
{
  "scripts": {
    "dev": "jacare dev",
    "build": "jacare build",
    "check": "jacare check"
  },
  "dependencies": {
    "@jacare/core": "^0.1.0"
  },
  "devDependencies": {
    "@jacare/cli": "^0.1.0",
    "@jacare/vite-plugin": "^0.1.0",
    "@jacare/devtools": "^0.1.0"
  }
}
```

4. `git init && git remote add origin git@github.com:jacarejs/showcase.git`

---

## Author

**Heber Almeida** — MIT License
