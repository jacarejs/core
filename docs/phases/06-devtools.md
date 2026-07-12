# Phase 6 — DevTools

## Problem

Fine-grained reactivity is fast but opaque. When a view does not update, developers need to see:

- Which pulses exist
- Current values
- Who depends on whom
- When effects re-run

**Core question:** How do you debug a Pulse Graph without adding overhead to production?

## Analysis

### Requirements

1. **Graph snapshot** — nodes (pulse, derive, watch) and dependency edges
2. **Live updates** — reflect writes and effect runs
3. **Zero cost when off** — guarded by `enableDevtools()`
4. **Inspectable UI** — in-app panel for local development
5. **Composable API** — runtime exports graph data; devtools package renders UI

### Instrumentation points

| Hook | Event |
|------|-------|
| `signal()` | Register pulse node |
| `signal.set` / `update` | Record value |
| `computed()` | Register derive node |
| `computed` stale | Mark stale before refresh |
| `effect()` | Register watch node |
| `trackDependency` | Add edge source → consumer |
| `effect.dispose` | Mark node disposed |

## Alternatives

### A. Chrome extension only
- **Pros:** Familiar DevTools placement
- **Cons:** Heavy setup, harder for early framework
- **Verdict:** Deferred

### B. Always-on global registry
- **Pros:** Simple
- **Cons:** Production overhead
- **Verdict:** Rejected

### C. Opt-in registry + overlay panel (chosen)
- **Pros:** No cost until enabled; works in any browser
- **Cons:** In-app panel, not native DevTools tab
- **Verdict:** Selected

## API

### Runtime

```javascript
import { enableDevtools, getPulseGraph, subscribePulseGraph } from '@jacare/core'

enableDevtools()

const graph = getPulseGraph()
// { nodes, edges, updatedAt }

const stop = subscribePulseGraph(() => {
  console.log(getPulseGraph())
})
```

### Panel

```javascript
import { connectJacareDevtools } from '@jacare/devtools'

const dispose = connectJacareDevtools()
```

Call before mounting the app so all pulses are tracked:

```javascript
if (import.meta.env.DEV) {
  const { connectJacareDevtools } = await import('@jacare/devtools')
  connectJacareDevtools()
}
```

### Node shape

| Field | Meaning |
|-------|---------|
| `id` | Stable numeric id |
| `kind` | `signal` · `computed` · `effect` |
| `value` | Last known value (JSON-serializable) |
| `stale` | Derive marked dirty |
| `subscribers` | Downstream subscription count |
| `disposed` | Watch cleaned up |

Edges run **from source → consumer** (pulse feeds derive, derive feeds watch).

## UI

Fixed panel (bottom-right):

- Node list grouped by kind
- Selected node value + metadata
- Upstream / downstream dependency lists

## Tests

- Registry inactive until `enableDevtools()`
- Signal → computed → effect chain and edges
- Value updates after `set`
- Stale flag on derived nodes

## Future Work

1. **Source names** — map nodes to `.jcr` bindings via compiler metadata
2. **Time travel** — snapshot log with scrubber
3. **Chrome extension** — native DevTools panel via `postMessage`
4. **Highlight flashes** — pulse animation on updated nodes
5. **SSR graph** — inspect server-side pulses during hydration

---

**Next:** Publish `@jacare/*` to npm — see [Phase 7 — Forms](07-forms.md).
