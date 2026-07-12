# Jacaré Vite Templates

Starter templates for Jacaré apps using the **Vite CLI** (`vite dev`, `vite build`, `vite preview`).

## Quick start

### npm create jacare

```bash
npm create jacare@latest my-app
npm create jacare@latest my-app -- --template vite-nav
npm create jacare@latest my-app -- --template vite-todo
```

### jacare new

```bash
jacare new my-app --template=vite-minimal
jacare new my-app --template=vite-nav
jacare new my-app --template=vite-todo
```

### degit (GitHub)

```bash
npx degit jacarejs/core/templates/vite-minimal my-app
npx degit jacarejs/core/templates/vite-nav my-app
npx degit jacarejs/core/templates/vite-todo my-app
cd my-app
npm install
npm run dev
```

## Templates

| Template | Description |
|----------|-------------|
| `vite-minimal` | Single-page counter app |
| `vite-nav` | Multi-page app with routing and lazy loading |
| `vite-todo` | Todo app with forms, lists, and devtools |

## What's included

Each template includes:

- `vite.config.js` with `@jacare/vite-plugin`
- `jacare.config.js` for title and port
- `jacare.d.ts` for TypeScript module types
- `.jcr` components and `boot.js` entry
- HMR via `import.meta.hot`

## Scripts

```bash
npm run dev       # vite
npm run build     # vite build
npm run preview   # vite preview
npm run check     # jacare check — validate all .jcr files
```

## vs jacare CLI templates

| | Vite templates (`vite-*`) | Jacaré CLI templates (`minimal`, `nav`, `todo`) |
|--|---------------------------|--------------------------------------------------|
| Dev server | `vite` | `jacare dev` |
| Build | `vite build` | `jacare build` |
| Config | `vite.config.js` | `jacare.config.js` only |

Both approaches use the same Jacaré compiler and runtime. Pick Vite templates if you prefer standard Vite tooling.
