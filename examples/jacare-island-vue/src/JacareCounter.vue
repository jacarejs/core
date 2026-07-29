<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { mountIsland } from '@jacare/core/island'
import CounterIsland from './islands/CounterIsland.jcr'

const props = defineProps({
  start: { type: Number, default: 0 },
  label: { type: String, default: 'Clicks' },
})

const host = ref(null)
let island

onMounted(() => {
  if (!host.value) return
  island = mountIsland(host.value, CounterIsland, {
    props: { start: props.start, label: props.label },
  })
})

watch(
  () => [props.start, props.label],
  ([start, label]) => {
    island?.update({ start, label })
  },
)

onBeforeUnmount(() => {
  island?.()
  island = undefined
})
</script>

<template>
  <div ref="host" class="island-host" />
</template>
