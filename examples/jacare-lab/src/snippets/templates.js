import { viewSnippet } from '../utils/snippet.js'

export const textBindingCode = viewSnippet(
  `const name = pulse('Jacaré')`,
  `  <div class="stack">
    <input class="input" bind-value=\${name} placeholder="Type a name" />
    <p class="muted">Bare (text binding): <strong>\${name}</strong></p>
    <p class="muted">Mixed (needs "()"): Hello, \${name()}!</p>
  </div>`,
)

export const attrCode = viewSnippet(
  `const avatarKind = pulse('leaf')
const avatarSrc = derive(() => (avatarKind() === 'leaf' ? '/leaf.svg' : '/amber.svg'))

function swapAvatar() {
  avatarKind.update((kind) => (kind === 'leaf' ? 'amber' : 'leaf'))
}

const linkKind = pulse('reactivity')
const linkLabel = derive(() => '/' + linkKind())

function swapLink() {
  linkKind.update((kind) => (kind === 'reactivity' ? 'templates' : 'reactivity'))
}`,
  `  <div class="stack">
    <div class="row">
      <span class="badge" title="This title never changes">Static attribute</span>
      <img :src=\${avatarSrc} width="32" height="32" alt="Avatar" />
      <button type="button" class="btn btn-outline" on-click=\${swapAvatar}>Swap :src</button>
    </div>
    <div class="row">
      <a class="text-link" bind-href=\${linkLabel}>Reactive link → \${linkLabel}</a>
      <button type="button" class="btn btn-outline" on-click=\${swapLink}>Swap bind-href</button>
    </div>
  </div>`,
)

export const progressCode = viewSnippet(
  `const progress = pulse(40)
const pct = derive(() => progress() + '%')

function bump(delta) {
  progress.update((n) => Math.max(0, Math.min(100, n + delta)))
}`,
  `  <div class="stack">
    <div class="progress">
      <div class="progress-fill" style---pct=\${pct}></div>
    </div>
    <div class="row">
      <button type="button" class="btn btn-outline" on-click=\${() => bump(-10)}>−10</button>
      <button type="button" class="btn" on-click=\${() => bump(10)}>+10</button>
      <span class="muted">\${progress}%</span>
    </div>
  </div>`,
)

export const multiAttrCode = viewSnippet(
  `const seats = pulse(3)
const maxSeats = pulse(5)
const seatsLabel = derive(() => seats() + ' / ' + maxSeats() + ' seats booked')
const atCapacity = derive(() => seats() >= maxSeats())

function bookSeat() {
  if (!atCapacity()) seats.update((n) => n + 1)
}`,
  `  <div class="stack">
    <p class="muted">\${seatsLabel}</p>
    <button
      type="button"
      class="btn"
      :disabled=\${atCapacity}
      :title=\${seatsLabel}
      on-click=\${bookSeat}
    >
      Book a seat
    </button>
  </div>`,
)

export const trendCode = viewSnippet(
  `const price = pulse(128.4)
const previous = pulse(128.4)

function nudge(delta) {
  previous.set(price())
  price.update((n) => Math.round((n + delta) * 100) / 100)
}

const trendLabel = derive(() => (price() > previous() ? '▲ Up' : price() < previous() ? '▼ Down' : '– Flat'))`,
  `  <div class="stack">
    <p class="metric">\${price}</p>
    <div class="row">
      <span class="badge" class-badge-danger=\${() => price() > previous()} class-badge-warn=\${() => price() < previous()}>\${trendLabel}</span>
      <button type="button" class="btn btn-outline" on-click=\${() => nudge(-1.5)}>−1.5</button>
      <button type="button" class="btn" on-click=\${() => nudge(1.5)}>+1.5</button>
    </div>
  </div>`,
)
