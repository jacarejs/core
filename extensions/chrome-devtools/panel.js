const statusEl = document.getElementById('status')
const hintEl = document.getElementById('hint')
const protocolEl = document.getElementById('protocol')
const coreVersionEl = document.getElementById('core-version')
const enabledEl = document.getElementById('enabled')
const pulseCountEl = document.getElementById('pulse-count')
const jcrCountEl = document.getElementById('jcr-count')
const meshCountEl = document.getElementById('mesh-count')
const pulseListEl = document.getElementById('pulse-list')
const jcrListEl = document.getElementById('jcr-list')
const bindingsListEl = document.getElementById('bindings-list')
const filterEl = document.getElementById('filter')
const filterJcrEl = document.getElementById('filter-jcr')
const routeEmptyEl = document.getElementById('route-empty')
const routeGridEl = document.getElementById('route-grid')
const detailEmptyEl = document.getElementById('detail-empty')
const detailBodyEl = document.getElementById('detail-body')
const detailNameEl = document.getElementById('detail-name')
const detailMetaEl = document.getElementById('detail-meta')
const detailValueEl = document.getElementById('detail-value')
const detailBindCountEl = document.getElementById('detail-bind-count')

let inspect = null
let selectedPulseId = null
let selectedJcr = null
let hello = null

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
    'Inspect .jcr sources, pulse values, bindings, and the current createNav route. Click a pulse to highlight DOM.'
}

function renderMeta() {
  protocolEl.textContent = inspect?.protocol ?? hello?.protocol ?? '—'
  coreVersionEl.textContent = inspect?.coreVersion ?? hello?.coreVersion ?? '—'
  enabledEl.textContent = hello ? String(Boolean(hello.enabled)) : '—'
  pulseCountEl.textContent = String(inspect?.pulses?.length ?? 0)
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

function visiblePulses() {
  const q = filterEl.value.trim().toLowerCase()
  const pulses = inspect?.pulses ?? []
  return pulses.filter((pulse) => {
    if (selectedJcr) {
      const file = pulse.file ? shortFile(pulse.file) : '(no .jcr source)'
      const inSelected =
        file === selectedJcr ||
        (inspect?.jcrFiles ?? [])
          .find((g) => g.file === selectedJcr)
          ?.pulses.some((p) => p.id === pulse.id)
      if (!inSelected) return false
    }
    if (!q) return true
    const hay = `${pulse.name ?? ''} ${pulse.kind ?? ''} ${pulse.id} ${pulse.file ?? ''} ${pulse.valuePreview ?? ''}`
    return hay.toLowerCase().includes(q)
  })
}

function renderPulses() {
  const pulses = visiblePulses()
  pulseListEl.replaceChildren()

  for (const pulse of pulses) {
    const li = document.createElement('li')
    if (pulse.id === selectedPulseId) li.classList.add('active')

    const left = document.createElement('div')
    const fileLabel = pulse.file
      ? `${shortFile(pulse.file)}${pulse.line != null ? ':' + pulse.line : ''}`
      : ''
    left.innerHTML = `<div>${escapeHtml(pulse.name ?? `pulse ${pulse.id}`)}</div><div class="kind">${escapeHtml(pulse.kind ?? '')} · #${pulse.id} · ${pulse.subscribers ?? 0} sub · ${pulse.bindings ?? 0} bind</div>${fileLabel ? `<div class="file">${escapeHtml(fileLabel)}</div>` : ''}`

    const right = document.createElement('code')
    right.className = 'value-preview'
    right.textContent = pulse.valuePreview ?? formatValue(pulse.value)

    li.append(left, right)
    li.addEventListener('click', () => {
      selectedPulseId = pulse.id
      renderPulses()
      void selectPulse(pulse.id)
    })
    pulseListEl.append(li)
  }

  if (!pulseListEl.children.length) {
    const empty = document.createElement('li')
    empty.className = 'muted'
    empty.textContent = (inspect?.pulses ?? []).length
      ? 'No pulses match the filter / .jcr selection.'
      : 'No pulses yet.'
    pulseListEl.append(empty)
  }
}

function renderDetail(pulse, bindings) {
  if (!pulse) {
    detailEmptyEl.hidden = false
    detailBodyEl.hidden = true
    return
  }
  detailEmptyEl.hidden = true
  detailBodyEl.hidden = false
  detailNameEl.textContent = pulse.name ?? `pulse ${pulse.id}`
  const fileLabel = pulse.file
    ? `${shortFile(pulse.file)}${pulse.line != null ? ':' + pulse.line : ''}`
    : 'no source'
  detailMetaEl.textContent = `${pulse.kind ?? 'pulse'} · #${pulse.id} · ${fileLabel} · ${pulse.subscribers ?? 0} subscribers`
  detailValueEl.textContent = pretty(pulse.value)
  detailBindCountEl.textContent = String(bindings?.length ?? 0)

  bindingsListEl.replaceChildren()
  for (const binding of bindings ?? []) {
    const li = document.createElement('li')
    const loc = binding.file
      ? `${shortFile(binding.file)}${binding.line != null ? ':' + binding.line : ''}`
      : ''
    const dom = [binding.tag, binding.id ? `#${binding.id}` : '', binding.className ? `.${String(binding.className).split(/\s+/).filter(Boolean).slice(0, 2).join('.')}` : '']
      .filter(Boolean)
      .join('')
    li.innerHTML = `<div><strong>${escapeHtml(binding.kind ?? 'bind')}</strong> ${escapeHtml(dom || 'node')}<div class="file">${escapeHtml(loc)}</div></div>`
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

  if (!(bindings ?? []).length) {
    const empty = document.createElement('li')
    empty.className = 'muted'
    empty.textContent = 'No DOM bindings for this pulse.'
    bindingsListEl.append(empty)
  }
}

async function selectPulse(pulseId) {
  await sendToPage({ type: 'highlight', pulseId })
  const res = await sendToPage({ type: 'getBindings', pulseId })
  const pulse = (inspect?.pulses ?? []).find((p) => p.id === pulseId) ?? null
  renderDetail(pulse, res?.bindings ?? [])
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
        pulses: graphRes?.graph?.pulses ?? [],
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
  renderPulses()
  if (selectedPulseId != null) {
    const pulse = (inspect?.pulses ?? []).find((p) => p.id === selectedPulseId)
    if (pulse) void selectPulse(selectedPulseId)
    else {
      selectedPulseId = null
      renderDetail(null, [])
    }
  } else {
    renderDetail(null, [])
  }
}

function pretty(value) {
  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return String(value)
  }
}

function formatValue(value) {
  if (typeof value === 'string') return JSON.stringify(value)
  if (value === undefined) return 'undefined'
  try {
    return JSON.stringify(value)
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
