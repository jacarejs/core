# Phase 1 — Reactivity System

## Problem

Every front-end framework needs a mechanism to keep state in sync with the UI. Common approaches carry fundamental trade-offs:

| Approach | Model | Main issue |
|----------|-------|------------|
| Component re-render | Full tree reconciliation | Re-renders entire subtrees; O(n) diff; allocates on every update |
| Proxy tracking + VDOM | Proxy + virtual tree | Proxy overhead on every access; still reconciles a virtual tree |
| Global change detection | Zone / polling | Walks the full tree; patches global APIs |
| Compile-time invalidation | Build-time analysis | Assignment-based reactivity; less flexible for dynamic structures |
| Fine-grained signals | Direct DOM updates | Strong baseline, still room to optimize dependency graphs |
| Resumability-first | Deferred hydration | Hydration time is the focus; signal runtime is not the differentiator |

**Core question:** Why re-render an entire component when only one text node changed?

## Analysis

### Why component re-render exists

Declarative UI with `UI = f(state)` is a simple mental model. Virtual trees enabled efficient diffing without manual DOM manipulation. Today:

- Creating virtual trees is expensive
- Reconciliation stays O(n) even when a single value changes
- Hook rules and stale closures add friction
- Concurrent scheduling adds complexity without fixing the root issue

### Why proxy reactivity exists

Familiar templates plus automatic tracking are convenient, but:

- Every property access goes through a proxy trap (~3–10× slower than direct access)
- Rendering still goes through a virtual tree
- Split APIs (`ref` vs `reactive`) increase cognitive load

### Why fine-grained signals work

Signals plus effects update only affected nodes — no virtual tree required. Remaining gaps:

- Dependency graphs can grow unbounded in large apps
- Batching is global, without prioritization
- Compilers rarely eliminate all runtime tracking in production builds

### Why resumability matters

Not re-executing code that already ran on the server is the right insight for hydration. The reactivity runtime itself can still be pushed further.

## Alternatives Considered

### A. Virtual DOM
- **Pros:** Simple mental model, time-travel debugging
- **Cons:** Allocation, diffing, cannot be O(1) per update
- **Verdict:** Rejected as the primary mechanism

### B. Proxy-based reactivity
- **Pros:** Automatic tracking, familiar DX
- **Cons:** Per-access overhead, hard to optimize at compile time
- **Verdict:** Rejected; Jacaré uses explicit tracking via the compiler

### C. Compile-time invalidation
- **Pros:** Zero tracking runtime
- **Cons:** Less flexible with dynamic or heterogeneous data
- **Verdict:** Hybrid — compiler infers dependencies, minimal runtime as fallback

### D. Fine-grained signals
- **Pros:** O(1) updates, no virtual tree, proven in production
- **Cons:** Dependency graph can be optimized further
- **Verdict:** Chosen as the base, with Jacaré-specific improvements

### E. Signals + priority lanes (Jacaré)
- **Pros:** Prioritized batching, inline subscriber arrays, owner tree with automatic dispose
- **Cons:** Steeper learning curve than component re-render
- **Verdict:** **Selected**

## Conceptual Benchmark

Operation: update one value with 10,000 direct subscribers.

| Approach | Complexity | Allocations |
|----------|------------|-------------|
| Component re-render | O(tree) | Full virtual tree |
| Proxy + VDOM | O(deps) + O(vdom diff) | Virtual tree + dependency notify |
| Signal (typical) | O(subs) | Zero when value is equal |
| **Jacaré signal** | O(subs) | Zero (`Object.is` early exit + batch) |

Operation: 100 updates in a batch.

| Approach | Effect runs |
|----------|-------------|
| No batch | 100 |
| Batched | 1 |
| **Jacaré batch** | 1 |

## Architectural Decision

### Pulse Graph

Jacaré uses a **Pulse Graph** — a directed graph of cells (`DependencyCell`) connected to owners (`OwnerNode`):

```
signal ──► computed ──► effect ──► DOM binding
  │           │
  └───────────┘ (dependency edge)
```

**Primitives:**

1. **`signal<T>`** — Mutable cell. Callable as `count()`. `.set()`, `.update()`, `.peek`, `.subscribe()`.
2. **`computed<T>`** — Derived cell with memoization. Recomputes only when stale.
3. **`effect(fn)`** — Side effect with auto-tracking and cleanup.
4. **`batch(fn)`** — Coalesces notifications into a single flush.

Public aliases: `pulse` (signal), `derive` (computed), `watch` (effect).

**Owner tree:**

Each `effect` and `computed` creates an `OwnerNode`. When an owner is disposed:

- All cleanups run
- All children are disposed
- Graph edges are removed

This prevents memory leaks without `WeakRef` (which has its own overhead).

### Jacaré optimizations

| Aspect | Typical signals | Jacaré |
|--------|-----------------|------|
| Subscriber storage | Linked list | Array with O(1) swap-remove |
| Equality check | `===` | `Object.is` (NaN-safe) |
| Owner cleanup | Manual `onCleanup` | Automatic via owner tree |
| Batch | Global `batch()` | `batch()` + future priority lanes |
| Callable signals | Yes | Yes (the function is the signal) |

## Trade-offs

| Decision | Gain | Cost |
|----------|------|------|
| Zero virtual DOM | Performance, memory | Compiler required for templates |
| Callable signals | Concise DX, fewer imports | Unfamiliar to beginners (mitigated by docs) |
| Owner tree | Predictable GC, no WeakRef | Internal complexity |
| Array subscribers | Cache-friendly, simple | O(n) unsubscribe (fine for small n) |
| Compile-time tracking (future) | ~3 KB runtime | Compiler investment |

## Implementation

```
packages/runtime/src/
├── types.ts      — Public interfaces
├── context.ts    — Tracking context, OwnerNode, DependencyCell, batch queue
├── signal.ts     — signal(), untrack()
├── computed.ts   — computed() with memoization
├── effect.ts     — effect(), batch()
├── dom/bind.ts   — bindText, bindAttribute, bindProperty, bindClass
└── index.ts      — Public API
```

**Estimated size (gzip):** ~1.2 KB (core reactivity only, without DOM bindings)

## Tests

```bash
yarn test
```

Phase 1 coverage:

- Signal read / write / update
- Equality skip (no notification when value is unchanged)
- Peek without tracking
- Computed memoization
- Effect re-run and dispose
- User cleanup
- Batch coalescing
- Untrack

## Not yet implemented

| Area | Detail |
|------|--------|
| Priority lanes | High-priority effects (input) vs low-priority (analytics) |
| Compile-time graph | Compiler emits static wiring, removes runtime tracking |
| Structural sharing | Computed arrays/objects with persistent data structures |
| Async computed | Native suspense with `pending` / `resolved` / `error` states |
| Resource signals | Fetch/cache with automatic invalidation |

## Comparison

| Criterion | Component model | Proxy + VDOM | Signals | Compile-time | **Jacaré** |
|-----------|-----------------|--------------|---------|--------------|----------|
| Update granularity | Component | Component | DOM node | DOM node | DOM node |
| Virtual DOM | Yes | Yes | No | No | No |
| Runtime size | Large | Large | Small | Smallest* | ~1.2 KB** |
| Tracking overhead | Re-render | Proxy | Signal read | Signal read | Signal read |
| Batch | Yes | Yes | Yes | Yes | Yes |
| Auto cleanup | No | No | Manual | Built-in | Owner tree |
| NaN equality | No | No | No | No | Yes (`Object.is`) |

\* Compile-time runtimes vary with feature usage  
\** Core reactivity only; DOM bindings add ~0.3 KB

---

**Next:** [02-compiler.md](02-compiler.md) — `.jcr` template compiler → optimized DOM operations
