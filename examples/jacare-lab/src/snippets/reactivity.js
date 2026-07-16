import { viewSnippet } from '../utils/snippet.js'

export const signalCode = viewSnippet(
  `const count = signal(0)
const peeked = signal(null)

function incrementCount() {
  count.update((n) => n + 1)
}

function resetCount() {
  count.set(0)
}

function peekCount() {
  peeked.set(count.peek)
}`,
  `  <div class="stack">
    <div class="row">
      <span class="metric">\${count}</span>
      <button type="button" class="btn" on-click=\${incrementCount}>+1</button>
      <button type="button" class="btn btn-outline" on-click=\${resetCount}>Reset</button>
      <button type="button" class="btn btn-ghost" on-click=\${peekCount}>Peek</button>
    </div>
    #if peeked() !== null
      <p class="muted">Last peek: \${peeked}</p>
    #end
  </div>`,
)

export const computedCode = viewSnippet(
  `const price = signal(12)
const qty = signal(3)

const total = computed(() => Number(price()) * Number(qty()))`,
  `  <div class="stack">
    <div class="row">
      <label class="field">
        <span class="field-label">Price</span>
        <input class="input" type="number" min="0" bind-value=\${price} />
      </label>
      <label class="field">
        <span class="field-label">Qty</span>
        <input class="input" type="number" min="0" bind-value=\${qty} />
      </label>
    </div>
    <p class="metric">Total: \${total}</p>
  </div>`,
)

export const effectCode = viewSnippet(
  `const log = signal([])
const ticker = signal(0)

effect(() => {
  log.update((lines) => [...lines.slice(-4), 'ticker is now ' + ticker()])
})

function bumpTicker() {
  ticker.update((n) => n + 1)
}

const logText = computed(() => log().join('\\n'))`,
  `  <div class="stack">
    <button type="button" class="btn" on-click=\${bumpTicker}>Bump ticker</button>
    <pre class="log">\${logText}</pre>
  </div>`,
)

export const batchCode = viewSnippet(
  `const batchA = signal(0)
const batchB = signal(0)
const batchRuns = signal(0)

effect(() => {
  batchA()
  batchB()
  batchRuns.update((n) => n + 1)
})

function bumpSeparately() {
  batchA.update((n) => n + 1)
  batchB.update((n) => n + 1)
}

function bumpBatched() {
  batch(() => {
    batchA.update((n) => n + 1)
    batchB.update((n) => n + 1)
  })
}`,
  `  <div class="stack">
    <div class="row">
      <button type="button" class="btn btn-outline" on-click=\${bumpSeparately}>Bump a + b separately</button>
      <button type="button" class="btn" on-click=\${bumpBatched}>Bump a + b in batch()</button>
    </div>
    <p class="muted">a: \${batchA} · b: \${batchB} · effect runs: \${batchRuns}</p>
  </div>`,
)

export const untrackCode = viewSnippet(
  `const tracked = signal(0)
const untrackedSource = signal(0)
const trackedRuns = signal(0)

effect(() => {
  tracked()               // subscribes — reruns the effect
  untrack(() => untrackedSource())  // reads without subscribing
  trackedRuns.update((n) => n + 1)
})

function bumpTracked() {
  tracked.update((n) => n + 1)
}

function bumpUntrackedSource() {
  untrackedSource.update((n) => n + 1)
}`,
  `  <div class="stack">
    <div class="row">
      <button type="button" class="btn" on-click=\${bumpTracked}>Bump tracked</button>
      <button type="button" class="btn btn-outline" on-click=\${bumpUntrackedSource}>Bump untracked</button>
    </div>
    <p class="muted">tracked: \${tracked} · untracked: \${untrackedSource} · effect runs: \${trackedRuns}</p>
  </div>`,
)

export const aliasCode = viewSnippet(
  `import { pulse, derive } from '@jacare/core'

const count = pulse(0)
const doubled = derive(() => count() * 2)

function bumpAlias() {
  count.update((n) => n + 1)
}`,
  `  <div class="stack">
    <div class="row">
      <span class="metric">\${count}</span>
      <button type="button" class="btn" on-click=\${bumpAlias}>+1</button>
    </div>
    <p class="muted">doubled: \${doubled}</p>
  </div>`,
)

export const rangeCode = viewSnippet(
  `const score = pulse(50)

const category = derive(() => {
  const n = Number(score())
  if (n < 34) return 'Low'
  if (n < 67) return 'Medium'
  return 'High'
})`,
  `  <div class="stack">
    <input class="input" type="range" min="0" max="100" bind-value=\${score} />
    <p class="metric">\${score} → \${category}</p>
  </div>`,
)

export const watchCode = viewSnippet(
  `const temp = signal(20)
const effectLog = signal([])
const watchLog = signal([])

effect(() => {
  effectLog.update((lines) => [...lines.slice(-3), 'effect saw ' + temp() + '°C'])
})

watch(() => {
  watchLog.update((lines) => [...lines.slice(-3), 'watch saw ' + temp() + '°C'])
})

const effectLogText = computed(() => effectLog().join('\\n'))
const watchLogText = computed(() => watchLog().join('\\n'))

function bumpTemp(delta) {
  temp.update((n) => n + delta)
}`,
  `  <div class="stack">
    <div class="row">
      <button type="button" class="btn btn-outline" on-click=\${() => bumpTemp(-1)}>−1°C</button>
      <span class="metric">\${temp}°C</span>
      <button type="button" class="btn" on-click=\${() => bumpTemp(1)}>+1°C</button>
    </div>
    <pre class="log">\${effectLogText}</pre>
    <pre class="log">\${watchLogText}</pre>
  </div>`,
)

export const nestedComputedCode = viewSnippet(
  `const meters = signal(2)
const centimeters = computed(() => meters() * 100)
const millimeters = computed(() => centimeters() * 10)`,
  `  <div class="stack">
    <input class="input" type="number" min="0" step="0.1" bind-value=\${meters} />
    <p class="muted">\${meters} m = \${centimeters} cm = \${millimeters} mm</p>
  </div>`,
)
