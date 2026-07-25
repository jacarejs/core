import { moduleSnippet, viewSnippet } from '../utils/snippet.js'

export const basicMountCode = moduleSnippet(
  `import { mountIsland } from '@jacare/core/island'
import Widget from './Widget.jcr'

// Host page — not a Jacaré SPA shell
const dispose = mountIsland('#slot', Widget, {
  props: { start: 3, label: 'Lab clicks' },
})

// later (route change, HMR, unmount):
// dispose()`,
)

export const widgetSourceCode = viewSnippet(
  `import { pulse } from '@jacare/core'

export <contract>
  props: {
    start: { type: 'number', default: 0 }
    label: { type: 'string', default: 'Clicks' }
  }
</contract>

const clicks = pulse(0)

function bump() {
  clicks.update((n) => n + 1)
}`,
  `  <section data-jacare-island>
    <p>\${label}</p>
    <p>\${() => (Number(start) || 0) + clicks()}</p>
    <button type="button" on-click=\${bump}>+1</button>
  </section>`,
)

export const propsRemountCode = moduleSnippet(
  `import { mountIsland } from '@jacare/core/island'
import Widget from './Widget.jcr'

let dispose

function remount(start, label) {
  dispose?.()
  dispose = mountIsland('#slot', Widget, {
    props: { start, label },
  })
}

// Host state changed → remount with new props
remount(5, 'From host')`,
)

export const shadowCode = moduleSnippet(
  `import { mountIsland } from '@jacare/core/island'
import Tip from './Tip.jcr'

mountIsland('#tip', Tip, {
  props: { topic: 'shadow' },
  shadow: true, // open shadow root + inner Element wrapper
})

// Island <style> is injected into the shadow root
// Host Georgia / global rules do not restyle the tip`,
)

export const optionsCode = moduleSnippet(
  `mountIsland(target, app, {
  props: { unit: 'metric' }, // → mount(root, props)
  shadow: true,              // true | 'open' | 'closed'
  clear: true,               // default — wipe host children / loading text
  mark: 'data-jacare-island', // host attribute after mount; false to skip
})

// App shapes accepted:
//   mount function
//   { mount }
//   { default }  // compiled .jcr default export IS mount`,
)

export const disposeCode = moduleSnippet(
  `const dispose = mountIsland('#slot', Widget)

dispose()
// → runs widget mount cleanups (effects, listeners)
// → removes data-jacare-island mark
// → clears the mount root when clear was true`,
)

export const howItWorksCode = moduleSnippet(
  `// 1. Resolve host
//    string → document.querySelector(selector)
//    Element → use as-is

// 2. Resolve mount function
//    function | module.mount | module.default

// 3. Resolve mount target
//    no shadow → host element
//    shadow    → host.attachShadow({ mode })
//                + inner <div data-jacare-island-root>
//                (compiled mount needs an Element, not ShadowRoot)

// 4. clear (default)
//    host.replaceChildren()
//    (+ clear wrapper if shadow)

// 5. mount(target, props)  // same as SPA mount

// 6. mark host with data-jacare-island

// 7. return dispose → reverse of 5–6 (+ clear)`,
)

export const whySubpathCode = moduleSnippet(
  `// Thin entry — does NOT pull nav / forms / DevTools
import { mountIsland } from '@jacare/core/island'

// Widget still uses the usual core symbols (tree-shaken)
import { pulse, derive } from '@jacare/core'

// Avoid:
// import { mountIsland } from '@jacare/core'  // not exported from main`,
)

export const reactHostCode = moduleSnippet(
  `import { useEffect, useRef } from 'react'
import { mountIsland } from '@jacare/core/island'
import Counter from './Counter.jcr'

export function JacareCounter({ start, label }) {
  const ref = useRef(null)

  useEffect(() => {
    if (!ref.current) return
    return mountIsland(ref.current, Counter, {
      props: { start, label },
    })
  }, [start, label])

  return <div ref={ref} />
}`,
)

export const vueHostCode = moduleSnippet(
  `<script setup>
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import { mountIsland } from '@jacare/core/island'
import Counter from './Counter.jcr'

const props = defineProps({ start: Number, label: String })
const host = ref(null)
let dispose

function remount() {
  dispose?.()
  if (!host.value) return
  dispose = mountIsland(host.value, Counter, {
    props: { start: props.start, label: props.label },
  })
}

onMounted(remount)
watch(() => [props.start, props.label], remount)
onBeforeUnmount(() => dispose?.())
</script>

<template>
  <div ref="host" />
</template>`,
)

export const angularHostCode = moduleSnippet(
  `import {
  AfterViewInit, Component, ElementRef,
  Input, OnChanges, OnDestroy, ViewChild,
} from '@angular/core'
import { mountIsland } from '@jacare/core/island'
import Counter from './Counter.jcr'

@Component({
  selector: 'app-jacare-counter',
  standalone: true,
  template: '<div #host></div>',
})
export class JacareCounterComponent
  implements AfterViewInit, OnChanges, OnDestroy {
  @Input() start = 0
  @Input() label = 'Clicks'
  @ViewChild('host', { static: true }) host!: ElementRef<HTMLDivElement>
  private dispose?: () => void
  private ready = false

  ngAfterViewInit() {
    this.ready = true
    this.remount()
  }
  ngOnChanges() {
    if (this.ready) this.remount()
  }
  ngOnDestroy() {
    this.dispose?.()
  }
  private remount() {
    this.dispose?.()
    this.dispose = mountIsland(this.host.nativeElement, Counter, {
      props: { start: this.start, label: this.label },
    })
  }
}`,
)

export const staticHostCode = moduleSnippet(
  `<!-- Plain HTML host (WordPress, Rails, static site…) -->
<div id="widget">
  <p>Loading…</p>
</div>
<script type="module">
  import { mountIsland } from '@jacare/core/island'
  import App from './App.jcr'
  mountIsland('#widget', App, { props: { unit: 'metric' } })
</script>`,
)

export const viteHostCode = moduleSnippet(
  `// vite.config.js — host app (React / Vue / Angular / static)
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react' // or vue() / none
import { jacare } from '@jacare/vite-plugin'

export default defineConfig({
  plugins: [react(), jacare()], // jacare() compiles .jcr on import
})`,
)
