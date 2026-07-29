<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { mountIsland } from '@jacare/core/island'
import TipIsland from './islands/TipIsland.jcr'

const props = defineProps({
  topic: { type: String, default: 'islands' },
})

const host = ref(null)
let island

onMounted(() => {
  if (!host.value) return
  island = mountIsland(host.value, TipIsland, {
    props: { topic: props.topic },
    shadow: true,
  })
})

watch(
  () => props.topic,
  (topic) => {
    island?.update({ topic })
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
