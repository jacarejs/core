import { viewSnippet } from '../utils/snippet.js'

export const renderCode = viewSnippet(
  `import { pulse } from '@jacare/core'

const count = pulse(0)

function bump() {
  count.update((n) => n + 1)
}

// server
// import { render } from './Counter.jcr'
// const { html, state } = render({ count: 0 })
// html  -> escaped markup from the same MountPlan as mount()
// state -> bindings needed to resume on the client`,
  `  <div class="stack">
    <span class="metric">\${count}</span>
    <button type="button" class="btn" on-click=\${bump}>Bump</button>
  </div>`,
)

export const resumeMentalModelCode = viewSnippet(
  `const hydrated = pulse(false)
const postHydrateClicks = pulse(0)
const hydrationStatus = derive(() =>
  hydrated() ? 'Hydrated — listeners attached' : 'Server HTML only — no listeners yet',
)

function simulateResume() {
  hydrated.set(true)
}

function onHydratedClick() {
  if (!hydrated()) return
  postHydrateClicks.update((n) => n + 1)
}`,
  `  <div class="stack">
    <p class="muted">\${hydrationStatus}</p>
    <div class="row">
      <button type="button" class="btn" disabled=\${!hydrated()} on-click=\${onHydratedClick}>
        Click me (needs resume())
      </button>
      <button type="button" class="btn btn-outline" on-click=\${simulateResume}>Simulate resume()</button>
    </div>
    <p class="muted">Clicks after hydration: \${postHydrateClicks}</p>
  </div>`,
)

export const resumeCode = viewSnippet(
  `import { pulse } from '@jacare/core'

const count = pulse(0)

// client — after the SSR HTML is already in the DOM
// import { resume } from './Counter.jcr'
// resume(document.getElementById('app'), state, props)
// resume() re-attaches signal subscriptions without recreating DOM nodes`,
  `  <div class="stack">
    <span class="metric">\${count}</span>
    <button type="button" class="btn" on-click=\${() => count.update((n) => n + 1)}>+1</button>
  </div>`,
)

export const renderToStringCode = viewSnippet(
  `import { pulse } from '@jacare/core'

const title = pulse('Jacaré')

// server handler
// import { renderToString } from '@jacare/core'
// import { render } from './Page.jcr'
// const html = renderToString(render, { title: 'Jacaré' })
// res.send('<div id="app">' + html + '</div>')`,
  `  <section class="page">
    <h1>\${title}</h1>
    <p class="muted">Same source for server HTML and client mount.</p>
  </section>`,
)

export const renderToStreamCode = viewSnippet(
  `import { pulse } from '@jacare/core'

const items = pulse(['Compile', 'Render', 'Resume'])

// server handler
// import { renderToStream } from '@jacare/core'
// import { render } from './Page.jcr'
// for await (const chunk of renderToStream(render, props)) {
//   res.write(chunk)
// }
// res.end()`,
  `  <ul class="list">
    #for items() as item (item)
      <li class="list-item"><span class="item-label">\${item}</span></li>
    #end
  </ul>`,
)
