const KIND_LABEL = {
  signal: 'Pulse',
  computed: 'Derive',
  effect: 'Watch',
}

const statusEl = document.getElementById('status')
const hintEl = document.getElementById('hint')
const protocolEl = document.getElementById('protocol')
const coreVersionEl = document.getElementById('core-version')
const enabledEl = document.getElementById('enabled')
const pulseCountEl = document.getElementById('pulse-count')
const jcrCountEl = document.getElementById('jcr-count')
const meshCountEl = document.getElementById('mesh-count')
const graphMetaEl = document.getElementById('graph-meta')
const pulseListEl = document.getElementById('pulse-list')
const jcrListEl = document.getElementById('jcr-list')
const bindingsListEl = document.getElementById('bindings-list')
const upstreamListEl = document.getElementById('upstream-list')
const downstreamListEl = document.getElementById('downstream-list')
const filterEl = document.getElementById('filter')
const filterJcrEl = document.getElementById('filter-jcr')
const routeEmptyEl = document.getElementById('route-empty')
const routeGridEl = document.getElementById('route-grid')
const detailEmptyEl = document.getElementById('detail-empty')
const detailBodyEl = document.getElementById('detail-body')
const detailValueEl = document.getElementById('detail-value')
const detailMetaJsonEl = document.getElementById('detail-meta-json')
const detailBindCountEl = document.getElementById('detail-bind-count')
const detailUpCountEl = document.getElementById('detail-up-count')
const detailDownCountEl = document.getElementById('detail-down-count')
const detailSourceWrapEl = document.getElementById('detail-source-wrap')
const detailSourceEl = document.getElementById('detail-source')

let inspect = null
let selectedPulseId = null
let selectedJcr = null
let hello = null
let latestBindings = []
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
      'No Jacaré hook on this page. Open a Jacaré app in DEV (Lab / yarn lab:dev), reload the tab, then Refresh.'
    return
  }
  if (!hello.enabled) {
    hintEl.textContent =
      'Hook found but DevTools collection is off. Refresh enables collection automatically.'
    return
  }
  hintEl.textContent =
    'Pulse Graph mirrors the in-page overlay: live values, .jcr sources, DOM bindings, depends-on and feeds. Route updates with createNav.'
}

function renderMeta() {
  protocolEl.textContent = inspect?.protocol ?? hello?.protocol ?? '—'
  coreVersionEl.textContent = inspect?.coreVersion ?? hello?.coreVersion ?? '—'
  enabledEl.textContent = hello ? String(Boolean(hello.enabled)) : '—'
  const pulses = activePulses()
  const edges = inspect?.edges ?? []
  pulseCountEl.textContent = String(pulses.length)
  graphMetaEl.textContent = `· ${pulses.length} nodes · ${edges.length} edges`
  jcrCountEl.textContent = String(
    (inspect?.jcrFiles ?? []).filter((f) => f.file.endsWith('.jcr')).length,
  )
  meshCountEl.textContent = String(inspect?.meshBagCount ?? 0)
}

function renderRoute() {
  const route = inspect?.route
  if (!route) {
    routeEmptyEl.hidden = false
    routeGridEl.hidden = true
    routeEmptyEl.textContent = 'No createNav route registered on this page.'
    return
  }
  routeEmptyEl.hidden = true
  routeGridEl.hidden = false
  document.getElementById('route-path').textContent = route.path || '—'
  document.getElementById('route-href').textContent = route.href || '—'
  document.getElementById('route-title').textContent = route.title || '—'
  document.getElementById('route-hash').textContent = route.hash || '—'
  document.getElementById('route-base').textContent = route.base || '—'
  document.getElementById('route-params').textContent = pretty(route.params ?? {})
  document.getElementById('route-search').textContent = pretty(route.search ?? {})
  document.getElementById('route-screens').textContent = pretty(route.screens ?? [])
}

function renderJcrFiles() {
  const q = filterJcrEl.value.trim().toLowerCase()
  const files = inspect?.jcrFiles ?? []
  jcrListEl.replaceChildren()

  for (const group of files) {
    if (q && !group.file.toLowerCase().includes(q)) continue
    const li = document.createElement('li')
    if (selectedJcr === group.file) li.classList.add('active')

    const left = document.createElement('div')
    left.innerHTML = `<div class="file">${escapeHtml(group.file)}</div><div class="jcr-meta">${group.pulses.length} pulse${group.pulses.length === 1 ? '' : 's'} · ${group.bindingCount} bind${group.bindingCount === 1 ? '' : 's'}</div>`

    const right = document.createElement('span')
    right.className = 'kind'
    right.textContent = group.file.endsWith('.jcr') ? 'jcr' : 'src'

    li.append(left, right)
    li.addEventListener('click', () => {
      selectedJcr = selectedJcr === group.file ? null : group.file
      renderJcrFiles()
      renderPulses()
    })
    jcrListEl.append(li)
  }

  if (!jcrListEl.children.length) {
    const empty = document.createElement('li')
    empty.className = 'muted'
    empty.textContent = files.length ? 'No .jcr match the filter.' : 'No .jcr sources linked yet.'
    jcrListEl.append(empty)
  }
}

function activePulses() {
  return (inspect?.pulses ?? []).filter((pulse) => !pulse.disposed)
}

function visiblePulses() {
  const q = filterEl.value.trim().toLowerCase()
  return activePulses().filter((pulse) => {
    if (selectedJcr) {
      const file = pulse.file ? shortFile(pulse.file) : '(no .jcr source)'
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
  return { changed, previousById }
}

function renderPulses() {
  const all = activePulses()
  const pulses = visiblePulses()
  pulseListEl.replaceChildren()

  for (const pulse of pulses) {
    const li = document.createElement('li')
    if (pulse.id === selectedPulseId) li.classList.add('active')
    if (lastChanged.has(pulse.id)) li.classList.add('is-pulse')

    const src = sourceLabel(pulse)
    li.innerHTML = `
      <span class="item-kind">${escapeHtml(kindLabel(pulse))}</span>
      <span class="item-id">${escapeHtml(nodeLabel(pulse))}</span>
      ${src ? `<span class="item-source">${escapeHtml(src)}</span>` : ''}
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
      renderPulses()
      void selectPulse(pulse.id, {
        flashed: lastChanged.has(pulse.id),
        previousText: lastPreviousById.get(pulse.id),
      })
    })
    pulseListEl.append(li)
  }

  if (!pulseListEl.children.length) {
    const empty = document.createElement('li')
    empty.className = 'muted'
    empty.textContent = all.length
      ? 'No nodes match the filter / .jcr selection.'
      : 'No pulse nodes yet.'
    pulseListEl.append(empty)
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
    .filter(Boolean)
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
    li.innerHTML = `<span>${escapeHtml(nodeLabel(node))}</span><span class="kind">${escapeHtml(kindLabel(node))}</span>`
    li.addEventListener('click', () => {
      selectedPulseId = node.id
      renderPulses()
      void selectPulse(node.id)
    })
    listEl.append(li)
  }
}

function renderBindings(bindings) {
  bindingsListEl.replaceChildren()
  latestBindings = bindings ?? []
  if (!latestBindings.length) {
    const empty = document.createElement('li')
    empty.className = 'muted'
    empty.textContent = 'None'
    bindingsListEl.append(empty)
    return
  }
  for (const binding of latestBindings) {
    const li = document.createElement('li')
    const loc = binding.file
      ? `${shortFile(binding.file)}${binding.line != null ? ':' + binding.line : ''}`
      : ''
    const dom = [
      binding.tag,
      binding.id ? `#${binding.id}` : '',
      binding.className
        ? `.${String(binding.className).split(/\s+/).filter(Boolean).slice(0, 2).join('.')}`
        : '',
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

  const valueText = formatValue(pulse.value)
  const flashed = Boolean(options.flashed)
  detailValueEl.className = `value-block${flashed ? ' is-flash' : ''}`
  detailValueEl.innerHTML = flashed
    ? highlightChangedLines(options.previousText, valueText)
    : escapeHtml(valueText)

  const src = sourceLabel(pulse)
  detailMetaJsonEl.textContent = pretty({
    id: pulse.id,
    name: pulse.name ?? null,
    kind: pulse.kind,
    source: src || null,
    stale: pulse.stale ?? false,
    disposed: pulse.disposed,
    subscribers: pulse.subscribers,
    bindings: bindings?.length ?? pulse.bindings ?? 0,
  })

  if (src) {
    detailSourceWrapEl.hidden = false
    detailSourceEl.textContent = src
    detailSourceEl.onclick = () => {
      if (pulse.file) {
        selectedJcr = shortFile(pulse.file)
        renderJcrFiles()
        renderPulses()
      }
    }
  } else {
    detailSourceWrapEl.hidden = true
  }

  detailBindCountEl.textContent = String(bindings?.length ?? 0)
  renderBindings(bindings ?? [])

  const upstream = relatedNodes(pulse.id, 'up')
  const downstream = relatedNodes(pulse.id, 'down')
  detailUpCountEl.textContent = String(upstream.length)
  detailDownCountEl.textContent = String(downstream.length)
  renderRelationList(upstreamListEl, upstream)
  renderRelationList(downstreamListEl, downstream)
}

async function selectPulse(pulseId, options = {}) {
  await sendToPage({ type: 'highlight', pulseId })
  const res = await sendToPage({ type: 'getBindings', pulseId })
  const pulse = activePulses().find((p) => p.id === pulseId) ?? null
  renderDetail(pulse, res?.bindings ?? [], options)
}

async function refresh() {
  setStatus('refreshing…', false)
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
    if (!inspect) {
      const graphRes = await sendToPage({ type: 'getGraph' })
      const routeRes = await sendToPage({ type: 'getRoute' })
      inspect = {
        protocol: hello?.protocol,
        coreVersion: hello?.coreVersion,
        enabled: Boolean(hello?.enabled),
        pulses: graphRes?.graph?.pulses ?? graphRes?.graph?.nodes ?? [],
        edges: graphRes?.graph?.edges ?? [],
        jcrFiles: [],
        route: routeRes?.route ?? null,
        meshBagCount: 0,
      }
    }
    setStatus(hello ? 'connected' : 'no hook', Boolean(hello))
  } catch (error) {
    hello = null
    inspect = null
    setStatus('error', false)
    hintEl.textContent = String(error?.message ?? error)
  }
  renderHint()
  renderMeta()
  renderRoute()
  renderJcrFiles()
  detectChanges(activePulses())
  renderPulses()
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
  return `${kindLabel(pulse)} #${pulse.id}`
}

function sourceLabel(pulse) {
  if (!pulse.file) return ''
  const base = shortFile(pulse.file)
  return pulse.line != null ? `${base}:${pulse.line}` : base
}

function pretty(value) {
  try {
    return JSON.stringify(value, null, 2)
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
    return text.length > 42 ? `${text.slice(0, 41)}…` : text
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
    await selectPulse(selectedPulseId)
    renderPulses()
  }
})

filterEl.addEventListener('input', () => renderPulses())
filterJcrEl.addEventListener('input', () => renderJcrFiles())

void refresh()
setInterval(() => {
  void refresh()
}, 2000)
