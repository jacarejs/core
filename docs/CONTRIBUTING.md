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

## Use Jacaré packages locally in another project

Until `@jacare/*` is published to npm, link from the monorepo:

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
    "@jacare/cli": "file:../core/packages/cli"
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
jacare.config.js
public/
```

## Commands

```bash
yarn build          # build all packages
yarn test           # run tests
yarn typecheck      # TypeScript check
yarn example:build  # build jacare-todo example
jacare check          # compile all .jcr files (from app root)
```

CI (`.github/workflows/ci.yml`) runs the same checks on every push/PR to `main`.
