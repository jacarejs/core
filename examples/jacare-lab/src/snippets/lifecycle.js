import { viewSnippet } from '../utils/snippet.js'

export const cycleFlowCode = `// packages/runtime/src/nav/screen.ts (simplified)
export function screen(mod) {
  return (host, ctx) => {
    const cleanups = []

    const activateCleanup = runScreenLifecycle(lifecycle, 'activate', ctx)
    if (typeof activateCleanup === 'function') cleanups.push(activateCleanup)

    const mountCleanup = runScreenLifecycle(lifecycle, 'mount')
    if (typeof mountCleanup === 'function') cleanups.push(mountCleanup)

    cleanups.push(adapted(host, ctx)) // mount the .jcr view

    return () => {
      runScreenLifecycle(lifecycle, 'deactivate')
      runScreenLifecycle(lifecycle, 'unmount')
      for (const cleanup of cleanups) cleanup()
    }
  }
}`

export const hooksCode = `export const lifecycle = createLifecycle({
  onMount() {
    const timer = setInterval(() => ticks.update((n) => n + 1), 1000)
    return () => clearInterval(timer) // cleanup on unmount
  },
  onActivate(ctx) {
    document.title = 'Jacaré Lab · Lifecycle'
    activations.update((n) => n + 1)
    return registerScope('lab-lifecycle.ticks', 'Lifecycle ticks', () => ticks())
  },
  onDeactivate() {
    deactivations.update((n) => n + 1)
  },
  onUnmount() {
    unmounts.update((n) => n + 1)
  },
})`

export const scopeCode = `registerScope(id, label, readFn)
// readFn is called on a short interval and whenever any scope entry changes,
// so the DevTools Scope panel always shows a live value`

export const activationCode = `onActivate() {
  document.title = 'Jacaré Lab · Lifecycle'
  activations.update((n) => n + 1) // runs again every time you come back
  return registerScope('lab-lifecycle.ticks', 'Lifecycle ticks', () => ticks())
}

onDeactivate() {
  deactivations.update((n) => n + 1) // fires when nav hides this screen
}`

export const disposeCode = viewSnippet(
  `const showBlock = pulse(true)
const mounts = pulse(0)
const disposals = pulse(0)

effect(() => {
  if (!showBlock()) return
  mounts.update((n) => n + 1)
  return () => disposals.update((n) => n + 1) // cleanup runs before the next rerun and on dispose
})

function toggleBlock() {
  showBlock.update((on) => !on)
}`,
  `  <div class="stack">
    <button type="button" class="btn" on-click=\${toggleBlock}>\${showBlock() ? 'Unmount' : 'Mount'} block</button>
    <p class="muted">mounts: \${mounts} · disposals: \${disposals}</p>
    #if showBlock()
      <p class="muted">This block is currently mounted.</p>
    #end
  </div>`,
)
