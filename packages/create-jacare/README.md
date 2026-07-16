# create-jacare

[![npm](https://img.shields.io/npm/v/create-jacare.svg?color=189030)](https://www.npmjs.com/package/create-jacare)
[![downloads](https://img.shields.io/npm/dm/create-jacare.svg)](https://www.npmjs.com/package/create-jacare)
[![license](https://img.shields.io/npm/l/create-jacare.svg)](https://github.com/jacarejs/core/blob/main/LICENSE)
[![CI](https://github.com/jacarejs/core/actions/workflows/ci.yml/badge.svg)](https://github.com/jacarejs/core/actions/workflows/ci.yml)

Scaffold Jacaré apps with Vite.

## Usage

```bash
npm create jacare@latest my-app
npm create jacare@latest my-app -- --template vite-nav
npm create jacare@latest my-app -- --template vite-todo
```

Or with the global CLI:

```bash
npm install -g @jacare/cli
jacare new my-app --template=vite-minimal
```

With yarn:

```bash
yarn create jacare my-app
yarn create jacare my-app --template vite-nav
```

With pnpm:

```bash
pnpm create jacare my-app
pnpm create jacare my-app --template vite-todo
```

## Templates

| Template | Description |
|----------|-------------|
| `vite-minimal` | Single-page counter (default) |
| `vite-nav` | Multi-page app with routing |
| `vite-todo` | Todo app with devtools |

Aliases: `minimal`, `nav`, `todo`

## What you get

- `vite.config.js` with `@jacare/vite-plugin`
- `.jcr` components and JavaScript entry
- `jacare check` script for CI
- HMR out of the box

## After scaffolding

```bash
cd my-app
npm install
npm run dev
npm run build
npm run preview
```

## Links

- [npm — create-jacare](https://www.npmjs.com/package/create-jacare)
- [npm — @jacare/cli](https://www.npmjs.com/package/@jacare/cli)
- [Repository](https://github.com/jacarejs/core)
- [API reference](https://github.com/jacarejs/core/blob/main/docs/api.md)
- [Jacaré Lab](https://jacarejs.github.io/core/lab/)
- [Syntax guide](https://github.com/jacarejs/core/blob/main/docs/syntax.md)
- [Templates](https://github.com/jacarejs/core/tree/main/templates)
- Related: [@jacare/core](https://www.npmjs.com/package/@jacare/core) · [@jacare/vite-plugin](https://www.npmjs.com/package/@jacare/vite-plugin)

## License

MIT
