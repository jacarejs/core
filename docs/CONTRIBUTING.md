# Contributing to Jacaré

## Monorepo setup

```bash
git clone https://github.com/jacarejs/core.git
cd core
yarn install
yarn build
yarn test
```

## Run the example app

```bash
yarn example:dev
```

## Use Jacaré in another project

### From npm

```bash
npm install @jacare/core
npm install -D @jacare/cli @jacare/vite-plugin vite
```

Or scaffold with:

```bash
npm create jacare@latest my-app
```

### Local development (yarn link)

```bash
cd /path/to/core
yarn build

cd packages/runtime && yarn link
cd ../compiler && yarn link
cd ../vite-plugin && yarn link
cd ../cli && yarn link

cd /path/to/my-app
yarn link @jacare/core @jacare/cli
```

Or use `file:` dependencies in `package.json`:

```json
{
  "dependencies": {
    "@jacare/core": "file:../core/packages/runtime"
  },
  "devDependencies": {
    "@jacare/cli": "file:../core/packages/cli",
    "@jacare/vite-plugin": "file:../core/packages/vite-plugin"
  }
}
```

## API naming

Use these names in new code and docs:

| Canonical | Alias (legacy) |
|-----------|----------------|
| `signal` | `pulse` |
| `computed` | `derive` |
| `effect` | `watch` |

## Project layout

```
src/
  boot.js
  app.jcr
index.html
vite.config.js       # when using Vite templates
jacare.config.js
public/
```

## Commands

```bash
yarn build          # build all packages
yarn test           # run tests (102 tests)
yarn typecheck      # TypeScript check
yarn example:build  # build jacare-todo example
jacare check        # compile all .jcr files (from app root)
```

## CI and publish

- **CI** — `.github/workflows/ci.yml` runs on every push/PR to `main`
- **npm** — `.github/workflows/publish.yml` publishes all packages on tag `v*`

Published packages:

| Package | npm |
|---------|-----|
| `@jacare/core` | Runtime |
| `@jacare/compiler` | Compiler |
| `@jacare/vite-plugin` | Vite plugin |
| `@jacare/cli` | CLI |
| `@jacare/devtools` | DevTools |
| `create-jacare` | `npm create jacare` scaffolds |

## Templates

| Command | Templates |
|---------|-----------|
| `jacare new` | `minimal`, `nav`, `todo`, `vite-minimal`, `vite-nav`, `vite-todo` |
| `npm create jacare` | `vite-minimal`, `vite-nav`, `vite-todo` |
| `npx degit jacarejs/core/templates/vite-minimal` | Vite template from GitHub |

Vite templates use `vite dev` / `vite build`. Jacaré CLI templates use `jacare dev` / `jacare build`.
