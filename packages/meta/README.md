# @jacare/meta

File-based routing and app conventions for [Jacaré](https://github.com/jacarejs/core).

## Install

```bash
npm install @jacare/meta
```

npm: [https://www.npmjs.com/package/@jacare/meta](https://www.npmjs.com/package/@jacare/meta)

## Usage

```js
// vite.config.js
import { jacare } from '@jacare/vite-plugin'
import { jacareMeta } from '@jacare/meta'

export default {
  plugins: [jacareMeta(), jacare()],
}
```

```js
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

## File conventions

| File | Route |
|------|-------|
| `src/pages/index.jcr` | `/` |
| `src/pages/about.jcr` | `/about` |
| `src/pages/tutorial/[slug].jcr` | `/tutorial/:slug` |

## API

- `jacareMeta()` — Vite plugin, generates `virtual:jacare-routes`
- `createJacareAppFromRoutes()` — wraps `createNav` with discovered loaders
- `discoverRoutes()` — scan pages directory at build time
- `defineJacareConfig()` — typed config helper

## Links

- [npm — @jacare/meta](https://www.npmjs.com/package/@jacare/meta)
- [Repository](https://github.com/jacarejs/core)
- Related: [@jacare/core](https://www.npmjs.com/package/@jacare/core) · [@jacare/vite-plugin](https://www.npmjs.com/package/@jacare/vite-plugin) · [@jacare/cli](https://www.npmjs.com/package/@jacare/cli)
