# @jacare/vite-plugin

Vite plugin that compiles `.jcr` files during dev and production builds.

## Install

```bash
npm install @jacare/vite-plugin @jacare/compiler
```

Peer dependency: `vite` ^5 or ^6.

## Usage

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import jacare from '@jacare/vite-plugin'

export default defineConfig({
  plugins: [jacare()],
})
```

Or use the helper:

```javascript
import { createJacareViteConfig } from '@jacare/vite-plugin'

export default createJacareViteConfig({
  title: 'My App',
  port: 3000,
  base: '/',
})
```

## App config

`jacare.config.js` in the project root:

```javascript
export default {
  title: 'My App',
  port: 3000,
  base: '/',
}
```

## Options

```javascript
jacare({
  emit: 'client',   // client | server | full | auto
  inspect: true,    // write compiled output to .jacare/compiled/
  runtimeImport: '@jacare/core',
})
```

## Links

- [Repository](https://github.com/jacarejs/core)
- [Example app](https://github.com/jacarejs/core/tree/main/examples/jacare-todo)

## License

MIT
