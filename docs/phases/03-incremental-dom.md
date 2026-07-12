# Phase 3 — Incremental DOM

## Problem

Phase 2 compiles static template trees into direct DOM operations. Real UIs need dynamic structure:

- Show or hide regions based on state
- Render lists that grow, shrink, and reorder
- Compose UI from reusable components

**Core question:** How do you update dynamic DOM structure without a virtual tree?

## Analysis

### Conditionals

Re-creating DOM on every toggle wastes work and loses focus/state. The solution is a **stable anchor** plus conditional mount:

1. Insert a comment anchor in the parent
2. When the condition is true, render children after the anchor
3. When false, dispose bindings and remove nodes
4. Re-evaluate only when tracked dependencies change

### Keyed lists

Naïve list rendering (clear and rebuild) is O(n) DOM ops per update and destroys node state. **Keyed reconciliation**:

1. Assign a stable key per item (`item.id`)
2. Reuse DOM nodes when the key persists
3. Reorder existing nodes instead of recreating them
4. Create nodes only for new keys; remove only for dropped keys

### Components

A component is a `.jcr` file that exports `mount(target, props?)`. The compiler:

1. Detects capitalized tags (`<TodoItem />`)
2. Passes `:prop={value}` as props (signals or values)
3. Auto-detects props referenced in the template but not declared in `<script>`

## Alternatives

### A. Full rebuild on every change
- **Pros:** Simple
- **Cons:** O(n) DOM churn, lost focus/state
- **Verdict:** Rejected

### B. Virtual tree diff for lists
- **Pros:** Familiar algorithm
- **Cons:** Allocation + diff overhead
- **Verdict:** Rejected

### C. Keyed incremental reconciliation (chosen)
- **Pros:** O(1) per unchanged item, moves without recreate
- **Cons:** Requires stable keys
- **Verdict:** Selected

## Architectural Decision

### Runtime primitives

```typescript
branch(anchor, branches) → dispose
reconcileKeyedList({ parent, anchor, items, getKey, render }) → dispose
showIf(anchor, condition, render) → dispose
```

`branch` handles multi-branch `#if` / `#elif` / `#else`. `showIf` remains available for simple two-state toggles.

### Template syntax

```javascript
import { pulse, view } from '@jacare/core'

export default view`
  #if show()
    <p>Visible</p>
  #else
    <p>Hidden</p>
  #end

  #for items() as item (item.id)
    <li>${item.label}</li>
  #end

  <TodoItem :label=${label} />
`
```

| Syntax | Behavior |
|--------|----------|
| `#if` / `#elif` / `#else` / `#end` | Conditional regions via `branch` |
| `@if` / `@elseif` / `@else` / `@end` | Alias for conditionals |
| `#for` / `#end` | Keyed list via `reconcileKeyedList` |
| `@each` / `@end` | Alias for lists |
| `(key)` | Key expression for reconciliation |
| `<Component />` | Self-closing component (PascalCase) |
| `:prop=${expr}` | Component prop binding |
| `on-click=${fn}` / `@click=${fn}` | DOM event listener |
| `${pulse}` | Reactive text interpolation |

### Reconciliation algorithm

```
for each effect run:
  1. Compute next key set from items()
  2. Drop keys no longer present (dispose + remove nodes)
  3. Create entries for new keys
  4. Reuse entries when key exists and item reference is unchanged
  5. Walk list in reverse, insertBefore to establish order
6. When key exists but `entry.item !== item`, dispose and re-render the row
```

Immutable updates (e.g. `{ ...item, done: true }` with the same `id`) are supported — the runtime detects identity changes and refreshes row bindings.

## Trade-offs

| Decision | Gain | Cost |
|----------|------|------|
| Comment anchors | No wrapper elements | Slightly more complex codegen |
| Key required for optimal lists | O(1) reuse | Developer must supply keys |
| Index fallback key | Works without `(key)` | Reorder on any change |
| Children + default slot | Familiar `<Card>…</Card>` DX | Named slots not fully wired yet |
| Auto prop detection | Less boilerplate | Heuristic-based |

## Implementation

```
packages/runtime/src/dom/
├── if.ts       — showIf, branch
└── list.ts     — reconcileKeyedList

packages/compiler/src/
├── parse-template.ts  — #if, #for, components
└── codegen-client.ts  — incremental emit + prop detection
```

## Tests

```bash
yarn build && yarn test
```

- `showIf` and `branch` mount, toggle, dispose
- `reconcileKeyedList` create, remove, reorder without recreate
- Re-render when item identity changes at the same key
- Parse and codegen for `#if`, `#for`, components
- Prop auto-detection

## Not yet implemented

| Area | Detail |
|------|--------|
| Slots | `<Component>children</Component>` with `<slot />` in child |
| Keyed each fallback | Warn when key is missing |
| Fragment roots | Multiple roots without wrapper `div` |
| Dynamic components | `<{tag} />` |
| SSR list serialization | Markers for list resumability |

---

**Next:** SSR — streaming, resumability, lazy hydration
