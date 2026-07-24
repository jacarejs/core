const KIND_LABEL = {
  signal: 'Pulse',
  computed: 'Derive',
  effect: 'Watch',
}

const statusEl = document.getElementById('status')
const hintEl = document.getElementById('hint')
const routePathEl = document.getElementById('route-path')
const routeExtraEl = document.getElementById('route-extra')
const pulseListEl = document.getElementById('pulse-list')
const jcrListEl = document.getElementById('jcr-list')
const meshEmptyEl = document.getElementById('mesh-empty')
const meshBodyEl = document.getElementById('mesh-body')
const bindingsListEl = document.getElementById('bindings-list')
const upstreamListEl = document.getElementById('upstream-list')
const downstreamListEl = document.getElementById('downstream-list')
const filterEl = document.getElementById('filter')
const showAllEl = document.getElementById('show-all')
const detailEmptyEl = document.getElementById('detail-empty')
const detailBodyEl = document.getElementById('detail-body')
const detailNameEl = document.getElementById('detail-name')
const detailKindEl = document.getElementById('detail-kind')
const detailSourceEl = document.getElementById('detail-source')
const detailValueEl = document.getElementById('detail-value')
const detailBindCountEl = document.getElementById('detail-bind-count')

let inspect = null
let selectedPulseId = null
let selectedJcr = null
let hello = null
let activeTab = 'state'
const previousValues = new Map()
let lastChanged = new Set()
let lastPreviousById = new Map()

function setStatus(text, ok) {
  statusEl.textContent = text
  statusEl.className = `badge ${ok ? 'badge-ok' : 'badge-warn'}`
}

function sendToPage(message) {
  return chrome.runtime.sendMessage({
    type: 'jacare-panel-to-page',
    tabId: chrome.devtools.inspectedWindow.tabId,
    message,
  })
}

function renderHint() {
  if (!hello) {
    hintEl.textContent =
      'No Jacaré app detected. Run yarn lab:dev, open the Lab, reload this tab, then Refresh.'
    return
  }
  if (!hello.enabled) {
    hintEl.textContent = 'Jacaré found — enabling live collection…'
    return
  }
  hintEl.textContent =
    'State shows named values, DOM-bound pulses, and .jcr sources. Turn on “Show noise” only when you need internal watches.'
}

function renderRoute() {
  const route = inspect?.route
  if (!route) {
    routePathEl.textContent = '—'
    routeExtraEl.textContent = 'no createNav'
    return
  }
  routePathEl.textContent = route.path || '/'
  const bits = []
  const params = route.params ?? {}
  const search = route.search ?? {}
  if (Object.keys(params).length) bits.push(`params ${compactJson(params)}`)
  if (Object.keys(search).length) bits.push(`search ${compactJson(search)}`)
  if (route.hash) bits.push(route.hash)
  routeExtraEl.textContent = bits.join(' · ')
}

function setTab(tab) {
  activeTab = tab
  for (const btn of document.querySelectorAll('.tab')) {
    btn.classList.toggle('is-active', btn.dataset.tab === tab)
  }
  for (const pane of document.querySelectorAll('.pane')) {
    pane.classList.toggle('is-active', pane.id === `pane-${tab}`)
  }
}

function activePulses() {
  return (inspect?.pulses ?? []).filter((pulse) => !pulse.disposed)
}

function visiblePulses() {
  const q = filterEl.value.trim().toLowerCase()
  const showAll = showAllEl.checked
  return activePulses().filter((pulse) => {
    if (!showAll && pulse.useful === false) return false
    if (!showAll && pulse.kind === 'effect' && !pulse.name && !(pulse.bindings > 0)) return false
    if (selectedJcr) {
      const file = pulse.file ? shortFile(pulse.file) : ''
      const group = (inspect?.jcrFiles ?? []).find((g) => g.file === selectedJcr)
      const inSelected =
        file === selectedJcr || group?.pulses.some((p) => p.id === pulse.id)
      if (!inSelected) return false
    }
    if (!q) return true
    const hay = `${nodeLabel(pulse)} ${kindLabel(pulse)} ${pulse.id} ${sourceLabel(pulse)} ${pulse.valuePreview ?? ''}`
    return hay.toLowerCase().includes(q)
  })
}

function detectChanges(pulses) {
  const changed = new Set()
  const previousById = new Map()
  for (const pulse of pulses) {
    const encoded = formatValue(pulse.value)
    const prev = previousValues.get(pulse.id)
    previousById.set(pulse.id, prev ?? '')
    if (prev !== undefined && prev !== encoded) changed.add(pulse.id)
    previousValues.set(pulse.id, encoded)
  }
  lastChanged = changed
  lastPreviousById = previousById
}

function renderState() {
  const all = activePulses()
  const pulses = visiblePulses()
  pulseListEl.replaceChildren()

  for (const pulse of pulses) {
    const li = document.createElement('li')
    if (pulse.id === selectedPulseId) li.classList.add('active')
    if (lastChanged.has(pulse.id)) li.classList.add('is-flash')

    const src = sourceLabel(pulse)
    const binds = pulse.bindings ? ` · ${pulse.bindings} bind` : ''
    li.innerHTML = `
      <span class="item-name">${escapeHtml(nodeLabel(pulse))}</span>
      <span class="item-meta">${escapeHtml(kindLabel(pulse))}${src ? ` · ${escapeHtml(src)}` : ''}${escapeHtml(binds)}</span>
      <span class="item-value">${escapeHtml(previewValue(pulse.value ?? pulse.valuePreview))}</span>
    `

    li.addEventListener('mouseenter', () => {
      void sendToPage({ type: 'highlight', pulseId: pulse.id })
    })
    li.addEventListener('mouseleave', () => {
      if (selectedPulseId != null) void sendToPage({ type: 'highlight', pulseId: selectedPulseId })
      else void sendToPage({ type: 'clearHighlight' })
    })
    li.addEventListener('click', () => {
      selectedPulseId = pulse.id
      renderState()
      void selectPulse(pulse.id, {
        flashed: lastChanged.has(pulse.id),
        previousText: lastPreviousById.get(pulse.id),
      })
    })
    pulseListEl.append(li)
  }

  if (!pulses.length) {
    const empty = document.createElement('li')
    empty.className = 'muted'
    empty.style.cursor = 'default'
    empty.textContent = all.length
      ? showAllEl.checked || selectedJcr
        ? 'Nothing matches this filter.'
        : 'Only internal nodes right now. Enable “Show noise” or interact with the page.'
      : 'No state collected yet.'
    pulseListEl.append(empty)
  }
}

function renderScreens() {
  const files = inspect?.jcrFiles ?? []
  jcrListEl.replaceChildren()
  for (const group of files) {
    const li = document.createElement('li')
    if (selectedJcr === group.file) li.classList.add('active')
    const usefulCount = group.pulses.filter((p) => p.useful !== false && !p.disposed).length
    li.innerHTML = `
      <span class="item-name file">${escapeHtml(group.file)}</span>
      <span class="item-meta">${usefulCount} state · ${group.bindingCount} binds</span>
    `
    li.addEventListener('click', () => {
      selectedJcr = selectedJcr === group.file ? null : group.file
      setTab('state')
      renderScreens()
      renderState()
    })
    jcrListEl.append(li)
  }
  if (!files.length) {
    const empty = document.createElement('li')
    empty.className = 'muted'
    empty.style.cursor = 'default'
    empty.textContent = 'No .jcr bindings recorded yet.'
    jcrListEl.append(empty)
  }
}

function renderMesh() {
  const bags = inspect?.mesh ?? []
  meshBodyEl.replaceChildren()
  meshEmptyEl.hidden = bags.length > 0
  for (const bag of bags) {
    const section = document.createElement('section')
    section.className = 'mesh-bag'
    const title = document.createElement('div')
    title.className = 'mesh-bag-title'
    title.innerHTML = `@${escapeHtml(bag.id)} <span>${bag.cells.length} cell${bag.cells.length === 1 ? '' : 's'}${bag.published ? '' : ' · not published'}</span>`
    section.append(title)
    for (const cell of bag.cells) {
      const row = document.createElement('div')
      row.className = 'mesh-cell'
      row.innerHTML = `
        <span class="mesh-addr">${escapeHtml(cell.address)}</span>
        <span class="mesh-kind">${escapeHtml(cell.kind)}</span>
        <span class="mesh-value">${escapeHtml(cell.valuePreview ?? previewValue(cell.value))}</span>
      `
      row.addEventListener('click', () => {
        if (cell.pulseId != null) {
          selectedPulseId = cell.pulseId
          setTab('state')
          renderState()
          void selectPulse(cell.pulseId)
        }
      })
      section.append(row)
    }
    if (!bag.cells.length) {
      const empty = document.createElement('div')
      empty.className = 'muted'
      empty.style.padding = '8px 10px'
      empty.textContent = 'No cells yet.'
      section.append(empty)
    }
    meshBodyEl.append(section)
  }
}

function relatedNodes(pulseId, direction) {
  const edges = inspect?.edges ?? []
  const pulses = activePulses()
  const ids =
    direction === 'up'
      ? edges.filter((e) => e.to === pulseId).map((e) => e.from)
      : edges.filter((e) => e.from === pulseId).map((e) => e.to)
  return ids
    .map((id) => pulses.find((p) => p.id === id))
    .filter((node) => node && (showAllEl.checked || node.useful !== false))
}

function renderRelationList(listEl, nodes) {
  listEl.replaceChildren()
  if (!nodes.length) {
    const empty = document.createElement('li')
    empty.className = 'muted'
    empty.textContent = 'None'
    listEl.append(empty)
    return
  }
  for (const node of nodes) {
    const li = document.createElement('li')
    li.innerHTML = `<span>${escapeHtml(nodeLabel(node))}</span><span class="item-meta">${escapeHtml(previewValue(node.value ?? node.valuePreview))}</span>`
    li.addEventListener('click', () => {
      selectedPulseId = node.id
      renderState()
      void selectPulse(node.id)
    })
    listEl.append(li)
  }
}

function renderBindings(bindings) {
  bindingsListEl.replaceChildren()
  if (!bindings?.length) {
    const empty = document.createElement('li')
    empty.className = 'muted'
    empty.textContent = 'Not bound to the DOM'
    bindingsListEl.append(empty)
    return
  }
  for (const binding of bindings) {
    const li = document.createElement('li')
    const loc = binding.file
      ? `${shortFile(binding.file)}${binding.line != null ? ':' + binding.line : ''}`
      : ''
    const dom = [
      binding.tag,
      binding.id ? `#${binding.id}` : '',
    ]
      .filter(Boolean)
      .join('')
    li.innerHTML = `<div><strong>${escapeHtml(binding.kind ?? 'bind')}</strong> ${escapeHtml(dom || 'node')}${loc ? `<div class="file">${escapeHtml(loc)}</div>` : ''}</div>`
    const flash = document.createElement('button')
    flash.type = 'button'
    flash.textContent = 'Flash'
    flash.addEventListener('click', (event) => {
      event.stopPropagation()
      void sendToPage({ type: 'flash', pulseId: selectedPulseId })
    })
    li.append(flash)
    bindingsListEl.append(li)
  }
}

function renderDetail(pulse, bindings, options = {}) {
  if (!pulse) {
    detailEmptyEl.hidden = false
    detailBodyEl.hidden = true
    return
  }
  detailEmptyEl.hidden = true
  detailBodyEl.hidden = false
  detailNameEl.textContent = nodeLabel(pulse)
  detailKindEl.textContent = kindLabel(pulse)

  const src = sourceLabel(pulse)
  if (src) {
    detailSourceEl.hidden = false
    detailSourceEl.textContent = src
  } else {
    detailSourceEl.hidden = true
  }

  const valueText = formatValue(pulse.value)
  const flashed = Boolean(options.flashed)
  detailValueEl.className = `value-block${flashed ? ' is-flash' : ''}`
  detailValueEl.innerHTML = flashed
    ? highlightChangedLines(options.previousText, valueText)
    : escapeHtml(valueText)

  detailBindCountEl.textContent = String(bindings?.length ?? 0)
  renderBindings(bindings ?? [])
  renderRelationList(upstreamListEl, relatedNodes(pulse.id, 'up'))
  renderRelationList(downstreamListEl, relatedNodes(pulse.id, 'down'))
}

async function selectPulse(pulseId, options = {}) {
  await sendToPage({ type: 'highlight', pulseId })
  const res = await sendToPage({ type: 'getBindings', pulseId })
  const pulse = activePulses().find((p) => p.id === pulseId) ?? null
  renderDetail(pulse, res?.bindings ?? [], options)
}

async function refresh() {
  setStatus('…', false)
  try {
    const res = await sendToPage({ type: 'hello' })
    hello = res?.hello ?? null
    if (hello && !hello.enabled) {
      await sendToPage({ type: 'enable' })
      const again = await sendToPage({ type: 'hello' })
      hello = again?.hello ?? hello
    }
    const inspectRes = await sendToPage({ type: 'getInspect' })
    inspect = inspectRes?.inspect ?? null
    if (inspect?.pulses) {
      for (const pulse of inspect.pulses) {
        if (pulse.useful == null) {
          pulse.useful =
            !pulse.disposed &&
            Boolean(pulse.name || pulse.bindings > 0 || (pulse.file && /\.jcr/i.test(pulse.file)) || pulse.kind === 'signal')
        }
      }
    }
    setStatus(hello ? 'live' : 'offline', Boolean(hello))
  } catch (error) {
    hello = null
    inspect = null
    setStatus('error', false)
    hintEl.textContent = String(error?.message ?? error)
  }
  renderHint()
  renderRoute()
  detectChanges(activePulses())
  renderState()
  renderScreens()
  renderMesh()
  if (selectedPulseId != null) {
    const pulse = activePulses().find((p) => p.id === selectedPulseId)
    if (pulse) {
      void selectPulse(selectedPulseId, {
        flashed: lastChanged.has(selectedPulseId),
        previousText: lastPreviousById.get(selectedPulseId),
      })
    } else {
      selectedPulseId = null
      renderDetail(null, [])
    }
  } else {
    renderDetail(null, [])
  }
}

function kindLabel(pulse) {
  return KIND_LABEL[pulse.kind] ?? pulse.kind ?? 'Pulse'
}

function nodeLabel(pulse) {
  if (pulse.name) return pulse.name
  const src = sourceLabel(pulse)
  if (src) return `${kindLabel(pulse)} · ${src}`
  return `${kindLabel(pulse)} #${pulse.id}`
}

function sourceLabel(pulse) {
  if (!pulse.file) return ''
  const base = shortFile(pulse.file)
  return pulse.line != null ? `${base}:${pulse.line}` : base
}

function compactJson(value) {
  try {
    return JSON.stringify(value)
  } catch {
    return String(value)
  }
}

function formatValue(value) {
  if (value === undefined) return '—'
  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return String(value)
  }
}

function previewValue(value) {
  if (value === undefined) return '—'
  try {
    const text = typeof value === 'string' ? JSON.stringify(value) : JSON.stringify(value)
    if (text == null) return String(value)
    return text.length > 48 ? `${text.slice(0, 47)}…` : text
  } catch {
    return String(value)
  }
}

function shortFile(file) {
  const jcr = String(file).match(/([^/\\]+\.jcr)(?:\?.*)?$/i)
  if (jcr) return jcr[1]
  const parts = String(file).split(/[/\\]/)
  return parts[parts.length - 1] || file
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function highlightChangedLines(previous, next) {
  if (!previous) return escapeHtml(next)
  const prevCounts = new Map()
  for (const line of previous.split('\n')) {
    prevCounts.set(line, (prevCounts.get(line) ?? 0) + 1)
  }
  return next
    .split('\n')
    .map((line) => {
      const remaining = prevCounts.get(line) ?? 0
      if (remaining > 0) {
        prevCounts.set(line, remaining - 1)
        return escapeHtml(line)
      }
      return `<mark class="changed">${escapeHtml(line)}</mark>`
    })
    .join('\n')
}

document.getElementById('btn-refresh').addEventListener('click', () => {
  void refresh()
})
document.getElementById('btn-clear').addEventListener('click', () => {
  void sendToPage({ type: 'clearHighlight' })
})
document.getElementById('btn-pick').addEventListener('click', async () => {
  const res = await sendToPage({ type: 'pickElement' })
  if (res?.pulseIds?.length) {
    selectedPulseId = res.pulseIds[0]
    setTab('state')
    await selectPulse(selectedPulseId)
    renderState()
  }
})

filterEl.addEventListener('input', () => renderState())
showAllEl.addEventListener('change', () => renderState())

for (const btn of document.querySelectorAll('.tab')) {
  btn.addEventListener('click', () => setTab(btn.dataset.tab))
}

void refresh()
setInterval(() => {
  void refresh()
}, 1500)
