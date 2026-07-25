# Jacaré Island × Vue

Embed Jacaré `.jcr` widgets inside a **Vue 3** host via `mountIsland`.

## Run

```bash
yarn island-vue:dev
# http://localhost:3008
```

```bash
yarn island-vue:build
```

## Pattern

```vue
<script setup>
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import { mountIsland } from '@jacare/core/island'
import CounterIsland from './islands/CounterIsland.jcr'

const props = defineProps({ start: Number, label: String })
const host = ref(null)
let dispose

function remount() {
  dispose?.()
  if (!host.value) return
  dispose = mountIsland(host.value, CounterIsland, {
    props: { start: props.start, label: props.label },
  })
}

onMounted(remount)
watch(() => [props.start, props.label], remount)
onBeforeUnmount(() => dispose?.())
</script>

<template>
  <div ref="host" />
</template>
```

Vite config combines `@vitejs/plugin-vue` + `jacare()` from `@jacare/vite-plugin`.

Docs: [docs/island.md](../../docs/island.md)
