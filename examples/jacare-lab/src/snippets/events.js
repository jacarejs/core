import { viewSnippet } from '../utils/snippet.js'

export const clickCode = viewSnippet(
  `const clicks = pulse(0)

function handleClick() {
  clicks.update((n) => n + 1)
}`,
  `  <div class="stack">
    <div class="row">
      <button type="button" class="btn" on-click=\${handleClick}>on-click (named)</button>
      <button type="button" class="btn btn-outline" @click=\${() => clicks.update((n) => n + 1)}>@click (inline)</button>
    </div>
    <p class="muted">Clicks: \${clicks}</p>
  </div>`,
)

export const forCode = viewSnippet(
  `const fruits = pulse([
  { id: 'a', label: 'Apple', picks: 0 },
  { id: 'b', label: 'Banana', picks: 0 },
  { id: 'c', label: 'Cherry', picks: 0 },
])

function pick(id) {
  fruits.update((list) =>
    list.map((fruit) => (fruit.id === id ? { ...fruit, picks: fruit.picks + 1 } : fruit)),
  )
}`,
  `  <ul class="list">
    #for fruits() as fruit (fruit.id)
      <li class="list-item">
        <span class="item-label">\${fruit.label} · \${fruit.picks}</span>
        <button type="button" class="btn btn-outline" on-click=\${() => pick(fruit.id)}>Pick</button>
      </li>
    #end
  </ul>`,
)

export const keydownCode = viewSnippet(
  `const searchDraft = pulse('')
const submittedSearch = pulse('')

function onSearchKeydown(event) {
  if (event.key === 'Enter') submittedSearch.set(searchDraft())
}`,
  `  <div class="stack">
    <input
      class="input"
      bind-value=\${searchDraft}
      placeholder="Type and press Enter"
      on-keydown=\${onSearchKeydown}
    />
    <p class="muted">Submitted: \${submittedSearch}</p>
  </div>`,
)

export const inputChangeCode = viewSnippet(
  `const note = pulse('')
const noteLive = pulse('')
const noteCommitted = pulse('')

function onNoteInput(event) {
  noteLive.set(event.target.value)
}

function onNoteChange(event) {
  noteCommitted.set(event.target.value)
}`,
  `  <div class="stack">
    <input
      class="input"
      bind-value=\${note}
      placeholder="Type, then blur or press Enter"
      on-input=\${onNoteInput}
      on-change=\${onNoteChange}
    />
    <p class="muted">on-input (live): \${noteLive}</p>
    <p class="muted">on-change (committed): \${noteCommitted}</p>
  </div>`,
)

export const focusBlurCode = viewSnippet(
  `const focused = pulse(false)
const focusLabel = derive(() => (focused() ? 'focused' : 'blurred'))
const focusLog = pulse([])
const focusLogText = derive(() => focusLog().join(' · ') || 'none yet')

function onFocus() {
  focused.set(true)
  focusLog.update((lines) => [...lines.slice(-3), 'focus'])
}

function onBlur() {
  focused.set(false)
  focusLog.update((lines) => [...lines.slice(-3), 'blur'])
}`,
  `  <div class="stack">
    <input
      class="input"
      placeholder="Click in, then click away"
      on-focus=\${onFocus}
      on-blur=\${onBlur}
    />
    <p class="muted">State: \${focusLabel}</p>
    <p class="muted">Log: \${focusLogText}</p>
  </div>`,
)

export const submitCode = viewSnippet(
  `const formName = pulse('')
const formMsg = pulse('Waiting for submit…')

function onFormSubmit(event) {
  event.preventDefault()
  const name = formName().trim()
  formMsg.set(name ? 'Saved "' + name + '" (no page reload)' : 'Name is required')
}`,
  `  <form class="stack" on-submit=\${onFormSubmit}>
    <input class="input" bind-value=\${formName} placeholder="Your name" />
    <button type="submit" class="btn">Submit</button>
    <p class="muted">\${formMsg}</p>
  </form>`,
)

export const padCode = viewSnippet(
  `const padX = pulse(50)
const padY = pulse(50)
const padXPct = derive(() => padX() + '%')
const padYPct = derive(() => padY() + '%')
const pointerDown = pulse(false)
const pointerLabel = derive(() => (pointerDown() ? 'pressing' : 'idle'))

function onPadMove(event) {
  const rect = event.currentTarget.getBoundingClientRect()
  const x = ((event.clientX - rect.left) / rect.width) * 100
  const y = ((event.clientY - rect.top) / rect.height) * 100
  padX.set(Math.max(0, Math.min(100, Math.round(x))))
  padY.set(Math.max(0, Math.min(100, Math.round(y))))
}

function onPadDown() {
  pointerDown.set(true)
}

function onPadUp() {
  pointerDown.set(false)
}`,
  `  <div class="stack">
    <div
      class="pad"
      style---x=\${padXPct}
      style---y=\${padYPct}
      on-pointermove=\${onPadMove}
      on-pointerdown=\${onPadDown}
      on-pointerup=\${onPadUp}
      on-pointerleave=\${onPadUp}
    ></div>
    <p class="muted">x: \${padX} · y: \${padY} · \${pointerLabel}</p>
  </div>`,
)

export const stopCode = viewSnippet(
  `const outerClicks = pulse(0)
const innerClicks = pulse(0)

function onOuterClick() {
  outerClicks.update((n) => n + 1)
}

function onInnerClick(event) {
  event.stopPropagation()
  innerClicks.update((n) => n + 1)
}`,
  `  <div class="stack">
    <article class="card" on-click=\${onOuterClick}>
      <p class="muted">Click anywhere in this card.</p>
      <button type="button" class="btn" on-click=\${onInnerClick}>Inner button (stops propagation)</button>
    </article>
    <p class="muted">outer: \${outerClicks} · inner: \${innerClicks}</p>
  </div>`,
)

export const preventLinkCode = viewSnippet(
  `const linkBlocked = pulse(0)

function onLinkClick(event) {
  event.preventDefault()
  linkBlocked.update((n) => n + 1)
}`,
  `  <div class="stack">
    <a class="btn btn-outline" href="https://example.com" on-click=\${onLinkClick}>
      External link (blocked)
    </a>
    <p class="muted">preventDefault calls: \${linkBlocked}</p>
  </div>`,
)

export const hoverCode = viewSnippet(
  `const hovering = pulse(false)
const hovers = pulse(0)
const hoveringLabel = derive(() => (hovering() ? 'yes' : 'no'))

function onCardEnter() {
  hovering.set(true)
  hovers.update((n) => n + 1)
}

function onCardLeave() {
  hovering.set(false)
}`,
  `  <div class="stack">
    <article class="card" on-mouseenter=\${onCardEnter} on-mouseleave=\${onCardLeave}>
      <p class="muted">Hover this card — hovering: \${hoveringLabel}</p>
    </article>
    <p class="muted">Times entered: \${hovers}</p>
  </div>`,
)

export const dblClickCode = viewSnippet(
  `const doubles = pulse(0)

function onDoubleClick() {
  doubles.update((n) => n + 1)
}`,
  `  <div class="stack">
    <button type="button" class="btn" on-dblclick=\${onDoubleClick}>Double-click me</button>
    <p class="muted">dblclick count: \${doubles}</p>
  </div>`,
)

export const debugEventsCode = viewSnippet(
  `const clicks = pulse(0)
const fruits = pulse([
  { id: 'a', label: 'Apple', picks: 0 },
  { id: 'b', label: 'Banana', picks: 0 },
])

function handleClick() {
  clicks.update((n) => n + 1)
}

function pick(id) {
  fruits.update((list) =>
    list.map((fruit) => (fruit.id === id ? { ...fruit, picks: fruit.picks + 1 } : fruit)),
  )
}`,
  `  <div class="stack">
    <div class="row">
      <button type="button" class="btn" on-click=\${handleClick}>Click</button>
      <button type="button" class="btn btn-outline" on-click=\${() => pick('a')}>Pick apple</button>
    </div>
    <p class="muted">Clicks: \${clicks}</p>
    <debug copy label="events">\${{ clicks, fruits }}</debug>
  </div>`,
)
