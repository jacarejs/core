# Jacaré Todo suite

A focused demo app with three surfaces sharing Jacaré’s fine-grained reactivity:

| Route | Page |
|-------|------|
| `/` | **Todo** — search, add, toggle, remove |
| `/board` | **Kanban** — same tasks, drag across columns |
| `/match` | **Tic-tac-toe** — quick two-player match |

Todo and Board share one store (`src/store.js`), so moving a card updates the list and vice versa.

## Run

```bash
yarn --cwd examples/jacare-todo dev
```

Opens on the port from `jacare.config.js` (default 3001).

## Build

```bash
yarn --cwd examples/jacare-todo build
```
