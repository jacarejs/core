<script setup>
import { ref } from 'vue'
import JacareCounter from './JacareCounter.vue'
import JacareTip from './JacareTip.vue'

const start = ref(2)
const label = ref('Live clicks')
const version = import.meta.env.JACARE_VERSION
</script>

<template>
  <header class="host-top">
    <p class="host-brand">Vue Host</p>
    <p class="host-note">
      Vue 3 shell · Jacaré islands via <code>mountIsland</code>
      <span v-if="version" class="host-version">@jacare/core v{{ version }}</span>
    </p>
  </header>

  <main class="host-main">
    <article class="host-article">
      <h1>Embed Jacaré inside Vue</h1>
      <p>
        This page is a normal Vue 3 app (<code>createApp</code>, Composition API).
        The widgets below are compiled <code>.jcr</code> modules mounted with
        <code>@jacare/core/island</code> — Vue owns the shell; Jacaré owns the island.
      </p>
    </article>

    <aside class="host-aside">
      <h2>Host controls (Vue state → island props)</h2>
      <p class="host-hint">Changing these remounts the counter island with new props.</p>
      <div class="host-controls">
        <label>
          Start
          <input v-model.number="start" type="number" />
        </label>
        <label>
          Label
          <input v-model="label" type="text" />
        </label>
      </div>
    </aside>

    <aside class="host-aside">
      <h2>Island: counter</h2>
      <p class="host-hint">Light mount — shares the host document.</p>
      <JacareCounter :start="start" :label="label" />
    </aside>

    <aside class="host-aside">
      <h2>Island: tip (shadow)</h2>
      <p class="host-hint">
        <code>shadow: true</code> — island CSS stays inside the shadow root.
      </p>
      <JacareTip topic="vue + jacaré" />
    </aside>
  </main>

  <footer class="host-foot">
    <p>
      Source:
      <a href="https://github.com/jacarejs/core/tree/main/examples/jacare-island-vue">
        examples/jacare-island-vue
      </a>
      ·
      <a href="https://jacarejs.github.io/core/island/">Static island</a>
      ·
      <a href="https://jacarejs.github.io/core/island-react/">React host</a>
      ·
      <a href="https://jacarejs.github.io/core/island-angular/">Angular host</a>
    </p>
  </footer>
</template>
