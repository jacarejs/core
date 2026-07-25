# Island mount kit

Embed a Jacaré `.jcr` component into an existing page (static HTML, WordPress, Rails, etc.) without making Jacaré the app shell.

**Import from the thin subpath** — not from `@jacare/core` — so navigation, forms, and DevTools stay out of the island bundle:

```js
import { mountIsland } from '@jacare/core/island'
```

## Quick start

Host page:

```html
<div id="bmi-island">
  <p>Loading…</p>
</div>
<script type="module">
  import { mountIsland } from '@jacare/core/island'
  import App from './Widget.jcr'

  const dispose = mountIsland('#bmi-island', App, {
    props: { unit: 'metric' },
  })
</script>
```

Widget (normal `.jcr`):

```js
export <contract>
  props: { unit: { type: 'string', default: 'metric' } }
</contract>

export <view>
  <section data-jacare-island>
    <p>Unit: ${unit}</p>
  </section>
</view>
```

## API

### `mountIsland(target, app, options?)`

| Argument | Type | Description |
|----------|------|-------------|
| `target` | `string \| Element` | CSS selector or host element |
| `app` | mount fn \| `{ mount }` \| `{ default }` | Compiled `.jcr` module (default export is `mount`) |
| `options.props` | `object` | Passed to `mount(root, props)` |
| `options.shadow` | `boolean \| 'open' \| 'closed'` | Mount inside a shadow root (isolates CSS from the host) |
| `options.clear` | `boolean` | Clear host children before mount (default `true`) |
| `options.mark` | `string \| false` | Attribute set on the host after mount (default `data-jacare-island`) |

Returns a **dispose** function (same contract as `mount`): removes bindings, clears the mark, and clears the root when `clear` was used.

```js
const dispose = mountIsland('#widget', App, { shadow: true })
// later
dispose()
```

## Why a subpath?

`@jacare/core` also exports nav, forms, SSR, and DevTools hooks. Islands should stay small: `mountIsland` lives in `@jacare/core/island` and does **not** re-export the rest of the runtime. Your `.jcr` still imports `pulse` / `derive` from `@jacare/core` as usual — Vite tree-shakes unused symbols.

## Working demos

| Demo | Path | Run |
|------|------|-----|
| Static HTML host | [`examples/jacare-island`](../examples/jacare-island) | `yarn island:dev` → :3006 |
| React host | [`examples/jacare-island-react`](../examples/jacare-island-react) | `yarn island-react:dev` → :3007 |
| Vue 3 host | [`examples/jacare-island-vue`](../examples/jacare-island-vue) | `yarn island-vue:dev` → :3008 |
| Angular host | [`examples/jacare-island-angular`](../examples/jacare-island-angular) | `yarn island-angular:dev` → :3009 |

All four mount the same counter + tip `.jcr` islands. Host frameworks wrap `mountIsland` and call `dispose` on unmount.

### React wrapper

```jsx
useEffect(() => {
  if (!hostRef.current) return
  return mountIsland(hostRef.current, CounterIsland, { props: { start, label } })
}, [start, label])
```

### Vue wrapper

```js
onMounted(remount)
watch(() => [props.start, props.label], remount)
onBeforeUnmount(() => dispose?.())
```

### Angular wrapper

```ts
ngAfterViewInit() {
  this.dispose = mountIsland(this.host.nativeElement, CounterIsland, {
    props: { start: this.start, label: this.label },
  })
}
ngOnDestroy() {
  this.dispose?.()
}
```

## Notes

- Do not `eval` host HTML into the island (security).
- Prefer `shadow: true` when the host page has aggressive global CSS.
  Shadow mounts create an inner wrapper element (compiled `mount` needs an `Element`, not a bare `ShadowRoot`) and inject scoped `<style>` into that shadow root.
- For a full SPA, keep using `mount` / `createNav` — islands are for **incremental** embeds.
