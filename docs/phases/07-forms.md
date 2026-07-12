# Phase 7 — Forms

## Problem

Controlled inputs need manual `on-input` handlers paired with `bind-value`. Validation logic scatters across screens. There is no shared pattern for labels, errors, and submit flow.

**Core question:** How do forms stay fine-grained and JavaScript-first without a heavy form library?

## Analysis

### Requirements

1. **Two-way bindings** — `bind-value` / `bind-checked` update signals from DOM events
2. **Validation** — field-level validators with error messages
3. **Field components** — reusable label + input + error markup
4. **Submit flow** — validate all fields, prevent default, call handler with values

### Two-way bindings

`bind-value=${draft}` compiles to `bindModel(node, 'value', draft)`:

- Signal → DOM via `bindProperty`
- DOM → signal via `input` / `change` listeners
- Cleanup on dispose (HMR, unmount)

Checkbox and select use `change`; text inputs use `input`.

### Validation API

`createForm()` returns field handles that are callable signals with metadata:

```javascript
import { createForm, view } from '@jacare/core'

const form = createForm({
  email: {
    value: '',
    validate: (value) => (value.includes('@') ? undefined : 'Invalid email'),
  },
})

form.fields.email()        // read value
form.fields.email.set('a') // write value
form.fields.email.error()  // validation message
form.fields.email.blur()   // mark touched + validate
form.validate()            // validate all fields
form.handleSubmit(onValid) // event handler for <form on-submit>
```

Validators return `undefined` when valid, or a string error message.

### Field components

Components are plain `.jcr` modules. `Field.jcr` accepts `label`, `field`, `type`, and `placeholder` props:

```javascript
import Field from '../components/Field.jcr'

view`
  <form on-submit=${form.handleSubmit(save)}>
    <Field :label=${'Email'} :field=${form.fields.email} type="email" />
    <button type="submit">Send</button>
  </form>
`
```

## Alternatives

### A. Manual `on-input` everywhere
- **Pros:** Explicit
- **Cons:** Repetitive, easy to forget pairing with `bind-value`
- **Verdict:** Rejected as default — kept as escape hatch via `bindProperty`

### B. Full schema library (Zod/Yup integration)
- **Pros:** Ecosystem
- **Cons:** Heavy dependency, against Jacaré's minimal runtime
- **Verdict:** Deferred — validators are plain functions for now

### C. `bindModel` + `createForm` (chosen)
- **Pros:** Small runtime, compiler support, matches signal model
- **Cons:** No nested object paths yet (`user.email`)
- **Verdict:** Selected

## API

| Export | Role |
|--------|------|
| `bindModel(node, prop, signal)` | Two-way property binding |
| `createForm(schema)` | Form state + validators |
| `form.fields.name` | Field signal with `.error`, `.touched`, `.dirty`, `.blur()` |
| `form.values` | Computed snapshot of all field values |
| `form.valid` | Computed — no field errors |
| `form.validate()` | Run validators, return boolean |
| `form.reset()` | Restore initial values |
| `form.handleSubmit(fn)` | `on-submit` handler |

## Compiler

When `bind-value` or `bind-checked` receives a direct signal reference (`text` or `text()`), codegen emits `bindModel` instead of `bindProperty`.

Complex expressions still use one-way `bindProperty` or `effect`.

## Tests

- `bindModel` syncs text input and checkbox both ways
- `createForm` validates on blur, tracks dirty state, submits when valid
- Compiler emits `bindModel` for `bind-value` / `bind-checked` signals

## Example

See `examples/jacare-todo`:

- `src/pages/tasks.jcr` — `bind-value` on search and draft inputs
- `src/pages/about.jcr` — feedback form with `createForm`
- `src/components/Field.jcr` — reusable field component

## Not yet implemented

| Area | Detail |
|------|--------|
| Nested fields | `form.field('user.email')` or path-based schema |
| Async validators | Debounced server-side checks |
| SSR forms | Hydrate field state from server |
| Zod adapter | Optional bridge without bundling Zod in core |

---

**Next:** Publish `@jacare/*` to npm and expand real-world examples.
