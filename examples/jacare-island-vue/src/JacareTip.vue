<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { mountIsland } from '@jacare/core/island'
import TipIsland from './islands/TipIsland.jcr'

const props = defineProps({
  topic: { type: String, default: 'islands' },
})

const host = ref(null)
let dispose

function remount() {
  dispose?.()
  dispose = undefined
  if (!host.value) return
  dispose = mountIsland(host.value, TipIsland, {
    props: { topic: props.topic },
    shadow: true,
  })
}

onMounted(remount)
watch(() => props.topic, remount)
onBeforeUnmount(() => {
  dispose?.()
  dispose = undefined
})
</script>

<template>
  <div ref="host" class="island-host" />
</template>
