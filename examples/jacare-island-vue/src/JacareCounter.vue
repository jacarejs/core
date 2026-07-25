<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { mountIsland } from '@jacare/core/island'
import CounterIsland from './islands/CounterIsland.jcr'

const props = defineProps({
  start: { type: Number, default: 0 },
  label: { type: String, default: 'Clicks' },
})

const host = ref(null)
let dispose

function remount() {
  dispose?.()
  dispose = undefined
  if (!host.value) return
  dispose = mountIsland(host.value, CounterIsland, {
    props: { start: props.start, label: props.label },
  })
}

onMounted(remount)
watch(() => [props.start, props.label], remount)
onBeforeUnmount(() => {
  dispose?.()
  dispose = undefined
})
</script>

<template>
  <div ref="host" class="island-host" />
</template>
