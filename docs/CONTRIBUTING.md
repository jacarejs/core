# Contributing to Jacaré

[![CI](https://github.com/jacarejs/core/actions/workflows/ci.yml/badge.svg)](https://github.com/jacarejs/core/actions/workflows/ci.yml)
[![Pages](https://github.com/jacarejs/core/actions/workflows/pages.yml/badge.svg)](https://github.com/jacarejs/core/actions/workflows/pages.yml)
[![npm](https://img.shields.io/npm/v/@jacare/core.svg?label=%40jacare%2Fcore&color=189030)](https://www.npmjs.com/package/@jacare/core)
[![license](https://img.shields.io/github/license/jacarejs/core.svg?color=189030)](https://github.com/jacarejs/core/blob/main/LICENSE)

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
npm install -g @jacare/cli
jacare new my-app
cd my-app && npm install && jacare dev
```

Add packages to an existing Vite project:

```bash
npm install @jacare/core
npm install -D @jacare/cli @jacare/vite-plugin vite
```

Or scaffold with:

```bash
npm create jacare@latest my-app
```

npm packages: [@jacare/core](https://www.npmjs.com/package/@jacare/core) · [@jacare/compiler](https://www.npmjs.com/package/@jacare/compiler) · [@jacare/vite-plugin](https://www.npmjs.com/package/@jacare/vite-plugin) · [@jacare/cli](https://www.npmjs.com/package/@jacare/cli) · [@jacare/devtools](https://www.npmjs.com/package/@jacare/devtools) · [@jacare/meta](https://www.npmjs.com/package/@jacare/meta)

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
yarn test           # run tests (132 tests)
yarn bench          # CPW vs runtime microbenchmarks
yarn typecheck      # TypeScript check
yarn example:build  # build jacare-todo example
yarn showcase:build # build jacare-showcase example
yarn lab:dev        # interactive API tutorial (jacare-lab)
yarn lab:build      # build jacare-lab
jacare check        # compile all .jcr files (from app root)
```

## Testing

See [testing.md](testing.md) for Vitest + happy-dom patterns:

- Runtime unit tests (`signal`, `bindText`, `createNav`, …)
- Compile `.jcr` then `mount()` integration tests
- Compiler output assertions (`bindText`, CPW `peek` + `subscribe`, `bindStyleVar`)
- Planned `@jacare/testing` package

See [benchmarks/README.md](../benchmarks/README.md) for the local performance suite (`yarn bench`).

## CI and publish

- **CI** — `.github/workflows/ci.yml` runs on every push/PR to `main`
- **npm** — `.github/workflows/publish.yml` (`workflow_dispatch`) bumps versions, publishes packages, tags the release
- GitHub Pages — `.github/workflows/pages.yml` deploys todo / showcase / BMI / **Lab** demos

### Why Pages used to break after npm publish

The release commit is pushed with `GITHUB_TOKEN`. GitHub **does not** start new workflows from that push (avoids recursion), so Pages stayed stale or mid-cancel until someone re-ran it by hand.

`publish.yml` now ends with an explicit `gh workflow run pages.yml --ref main` so demos redeploy after every npm release.

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
