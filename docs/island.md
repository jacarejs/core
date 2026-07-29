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
| `options.props` | `object` | Passed to `mount(root, props)` — plain values become **live pulses** by default |
| `options.live` | `boolean` | Wrap plain props as pulses (default `true`). `false` = one-shot plain object |
| `options.shadow` | `boolean \| 'open' \| 'closed'` | Mount inside a shadow root (isolates CSS from the host) |
| `options.clear` | `boolean` | Clear host children before mount (default `true`) |
| `options.mark` | `string \| false` | Attribute set on the host after mount (default `data-jacare-island`) |

Returns an **`IslandDispose`**: call it to tear down; call **`dispose.update(nextProps)`** to push new values into the live prop pulses **without remounting** (keeps focus / internal island state).

```js
const island = mountIsland('#widget', App, {
  props: { start: 0, label: 'Clicks' },
  shadow: true,
})

island.update({ start: 2, label: 'Score' }) // same mount, new prop values
island() // dispose
```

Callback props and values that are already pulses are passed through unchanged.

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

Mount once; push prop changes with `update` (no remount → focus/state kept):

```jsx
const islandRef = useRef(null)
useEffect(() => {
  if (!hostRef.current) return
  const island = mountIsland(hostRef.current, CounterIsland, {
    props: { start, label },
  })
  islandRef.current = island
  return () => island()
}, [])
useEffect(() => {
  islandRef.current?.update({ start, label })
}, [start, label])
```

### Vue wrapper

```js
onMounted(() => {
  island = mountIsland(host.value, CounterIsland, {
    props: { start: props.start, label: props.label },
  })
})
watch(() => [props.start, props.label], ([start, label]) => {
  island?.update({ start, label })
})
onBeforeUnmount(() => island?.())
```

### Angular wrapper

```ts
ngAfterViewInit() {
  this.island = mountIsland(this.host.nativeElement, CounterIsland, {
    props: { start: this.start, label: this.label },
  })
}
ngOnChanges() {
  this.island?.update({ start: this.start, label: this.label })
}
ngOnDestroy() {
  this.island?.()
}
```

## Notes

- Do not `eval` host HTML into the island (security).
- Prefer `shadow: true` when the host page has aggressive global CSS.
  Shadow mounts create an inner wrapper element (compiled `mount` needs an `Element`, not a bare `ShadowRoot`) and inject scoped `<style>` into that shadow root.
- For a full SPA, keep using `mount` / `createNav` — islands are for **incremental** embeds.
