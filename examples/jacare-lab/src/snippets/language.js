import { viewSnippet } from '../utils/snippet.js'

export const reservedBlocksCode = `export <contract>
  props: { title: 'string' }
  pulses: { count: 'number' }
  slots: ['default']
  emits: ['save']
  links: { total: { from: 'cart.total', mode: 'read' } }
</contract>

export <view>
  <h1>\${title}</h1>
  <p>\${count} · cart \${total}</p>
  <button type="button" on-click=\${() => emit('save')}>Save</button>
  <slot />
</view>

export <style>
h1 { font-weight: 700; }
</style>`

export const reservedDirectivesCode = `export <view>
#if loading()
  <p>Loading…</p>
#elif error()
  <p>\${error}</p>
#else
  #case role()
    #when 'admin'
      <Admin />
    #when 'guest'
      <Guest />
    #else
      <Member />
  #end

  #for items() as item, i (item.id)
    <li class-done=\${item.done}>\${i}: \${item.label}</li>
  #end
#end
</view>`

export const allBindsCode = viewSnippet(
  `import { pulse, derive } from '@jacare/core'

const draft = pulse('')
const on = pulse(false)
const href = pulse('/about')
const busy = pulse(false)
const width = pulse(45)
const pct = derive(() => width() + '%')
const tab = pulse('a')`,
  `  <div class="stack">
    <input class="input" bind-value=\${draft} placeholder="bind-value" />
    <label class="row"><input type="checkbox" bind-checked=\${on} /> bind-checked</label>
    <a class="btn btn-outline" bind-href=\${href}>bind-href</a>
    <button type="button" class="btn" :disabled=\${busy} on-click=\${() => busy.update((v) => !v)}>
      :disabled toggle
    </button>
    <div class="row">
      <button type="button" class="btn btn-outline" class-active=\${tab() === 'a'} on-click=\${() => tab.set('a')}>class-active A</button>
      <button type="button" class="btn btn-outline" class-active=\${tab() === 'b'} on-click=\${() => tab.set('b')}>class-active B</button>
    </div>
    <div class="bar" style---pct=\${pct}></div>
    <input class="input" type="range" min="0" max="100" bind-value=\${width} />
    <p class="muted">draft=\${draft} · on=\${on} · pct=\${pct}</p>
  </div>`,
  `.bar { width: var(--pct); height: 8px; background: #189030; border-radius: 4px; transition: width 0.12s ease; }
.btn-outline.active { outline: 2px solid #189030; }`,
)

export const bindsWithIfCode = viewSnippet(
  `import { pulse } from '@jacare/core'

const show = pulse(true)
const email = pulse('')
const err = pulse('')`,
  `  <div class="stack">
    <label class="row"><input type="checkbox" bind-checked=\${show} /> Show form</label>
    #if show()
      <input class="input" bind-value=\${email} placeholder="Email" />
      #if err()
        <p class="muted">\${err}</p>
      #else
        <p class="muted">Looks good — \${email}</p>
      #end
    #else
      <p class="muted">Form hidden</p>
    #end
  </div>`,
)

export const contractBindCode = `// Field.jcr
export <contract>
  props: {
    label: { type: 'string', required: true }
    value: { type: 'string', model: true }
  }
</contract>

export <view>
  <label>\${label}</label>
  <input bind-value=\${value} />
</view>

// parent
<Field :label=\${'Email'} bind-value=\${email} />`

export const cliCreateRunBuildCode = `# Create
npm create jacare@latest my-app
jacare new my-shop --template=todo

# Install + run
cd my-app && npm install
jacare dev
jacare dev --port=4000 --open=false

# Build
jacare build

# Check / inspect
jacare check
jacare check --bindings
jacare check --strict-style
jacare compile src/app.jcr --watch`
