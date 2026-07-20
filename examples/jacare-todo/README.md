# Jacaré Todo suite

A focused demo app with creative surfaces showing Jacaré’s fine-grained reactivity:

| Route | Page |
|-------|------|
| `/` | **Tasks** — search, add, toggle, remove |
| `/board` | **Kanban** — same tasks, pointer drag on desktop and mobile |
| `/match` | **Tic-tac-toe** — vs CPU or human |
| `/focus` | **Focus** — Pomodoro with `effect` + `#case` + `style---pct` |
| `/invite` | **Invite** — multi-step RSVP with `createForm` |
| `/split` | **Split** — tip calculator driven by `derive` |
| `/votes` | **Votes** — live tallies and percentage bars |
| `/habits` | **Habits** — 7-day grid with streak derives |
| `/seats` | **Seats** — venue map selection |
| `/league` | **League** — football simulator with crests and standings |

Tasks and Kanban share one store (`src/store.js`), so moving a card updates the list and vice versa.

## Run

```bash
yarn --cwd examples/jacare-todo dev
```

Opens on the port from `jacare.config.js` (default 3001).

## Build

```bash
yarn --cwd examples/jacare-todo build
```
