const KIND_LABEL = {
  signal: 'Pulse',
  computed: 'Derive',
  effect: 'Watch',
}

const statusEl = document.getElementById('status')
const hintEl = document.getElementById('hint')
const routePathEl = document.getElementById('route-path')
const pulseListEl = document.getElementById('pulse-list')
const pulseCountEl = document.getElementById('pulse-count')
const jcrListEl = document.getElementById('jcr-list')
const meshEmptyEl = document.getElementById('mesh-empty')
const meshTreeEl = document.getElementById('mesh-tree')
const meshFilterEl = document.getElementById('mesh-filter')
const meshTableWrapEl = document.getElementById('mesh-table-wrap')
const meshDetailEmptyEl = document.getElementById('mesh-detail-empty')
const meshTitleEl = document.getElementById('mesh-title')
const meshCellCountEl = document.getElementById('mesh-cell-count')
const meshRowsEl = document.getElementById('mesh-rows')
const scopeEmptyEl = document.getElementById('scope-empty')
const scopeTableEl = document.getElementById('scope-table')
const scopeRowsEl = document.getElementById('scope-rows')
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
const detailValueWrapEl = document.getElementById('detail-value-wrap')
const detailBindCountEl = document.getElementById('detail-bind-count')
const meshIoStatusEl = document.getElementById('mesh-io-status')
const meshImportFileEl = document.getElementById('mesh-import-file')
const btnMeshExport = document.getElementById('btn-mesh-export')
const btnMeshImport = document.getElementById('btn-mesh-import')

let inspect = null
let selectedPulseId = null
let selectedJcr = null
let selectedBagId = null
let hello = null
let activeTab = 'state'
const previousValues = new Map()
let lastChanged = new Set()
let lastPreviousById = new Map()

applyTheme()

function applyTheme() {
  try {
    const theme = chrome.devtools.panels.themeName
    document.documentElement.classList.toggle('theme-dark', theme === 'dark')
    document.documentElement.classList.toggle('theme-default', theme !== 'dark')
  } catch {
    // ignore
  }
}

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

async function ensurePageBridge() {
  return chrome.runtime.sendMessage({
    type: 'jacare-ensure-page',
    tabId: chrome.devtools.inspectedWindow.tabId,
  })
}

function renderHint() {
  if (!hello) {
    hintEl.hidden = false
    hintEl.textContent =
      'No Jacaré app detected. Run yarn lab:dev, open the Lab, reload this tab, then Refresh.'
    return
  }
  if (!hello.enabled) {
    hintEl.hidden = false
    hintEl.textContent = 'Jacaré found — enabling live collection…'
    return
  }
  hintEl.hidden = true
}

function renderRoute() {
  const route = inspect?.route
  if (!route) {
    routePathEl.textContent = 'no route'
    return
  }
  const bits = [route.path || '/']
  const params = route.params ?? {}
  const search = route.search ?? {}
  if (Object.keys(params).length) bits.push(compactJson(params))
  if (Object.keys(search).length) bits.push(`?${new URLSearchParams(search)}`)
  if (route.hash) bits.push(route.hash)
  routePathEl.textContent = bits.join(' ')
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

function typeLabel(pulse) {
  const value = pulse.value
  if (Array.isArray(value)) return `Array[${value.length}]`
  if (value === null) return 'Null'
  if (typeof value === 'object') return 'Object'
  if (typeof value === 'string') return 'String'
  if (typeof value === 'number') return 'Number'
  if (typeof value === 'boolean') return 'Boolean'
  return kindLabel(pulse)
}

function renderState() {
  const pulses = visiblePulses()
  pulseCountEl.textContent = `${pulses.length} pulse${pulses.length === 1 ? '' : 's'}`
  pulseListEl.replaceChildren()

  for (const pulse of pulses) {
    const li = document.createElement('li')
    if (pulse.id === selectedPulseId) li.classList.add('active')
    const left = document.createElement('div')
    left.innerHTML = `<span class="item-name">${escapeHtml(nodeLabel(pulse))}</span><span class="item-meta">${escapeHtml(typeLabel(pulse))}${sourceLabel(pulse) ? ` · ${escapeHtml(sourceLabel(pulse))}` : ''}</span>`
    const right = document.createElement('span')
    right.className = 'item-value'
    right.textContent = previewValue(pulse.value ?? pulse.valuePreview)
    li.append(left, right)
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
    empty.textContent = activePulses().length
      ? 'Nothing matches this filter.'
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
    li.innerHTML = `<div><span class="item-name">${escapeHtml(group.file)}</span><span class="item-meta">${usefulCount} state · ${group.bindingCount} binds</span></div>`
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

function visibleBags() {
  const q = meshFilterEl.value.trim().toLowerCase()
  return (inspect?.mesh ?? []).filter((bag) => {
    if (!q) return true
    return `@${bag.id}`.toLowerCase().includes(q) || bag.id.toLowerCase().includes(q)
  })
}

function renderMesh() {
  const bags = visibleBags()
  meshTreeEl.replaceChildren()
  meshEmptyEl.hidden = bags.length > 0

  const root = document.createElement('li')
  root.style.cursor = 'default'
  root.innerHTML = `<div><span class="item-name">@bag</span><span class="item-meta">${bags.length} bag${bags.length === 1 ? '' : 's'}</span></div>`
  if (bags.length) meshTreeEl.append(root)

  for (const bag of bags) {
    const li = document.createElement('li')
    if (selectedBagId === bag.id) li.classList.add('active')
    li.innerHTML = `<div><span class="item-name">@${escapeHtml(bag.id)}</span><span class="item-meta">${bag.cells.length} cells · bag</span></div>`
    li.addEventListener('click', () => {
      selectedBagId = bag.id
      renderMesh()
      renderMeshDetail(bag)
    })
    meshTreeEl.append(li)
  }

  const selected = bags.find((b) => b.id === selectedBagId) ?? bags[0] ?? null
  if (selected) {
    selectedBagId = selected.id
    renderMeshDetail(selected)
  } else {
    meshTableWrapEl.hidden = true
    meshDetailEmptyEl.hidden = false
  }
}

function renderMeshDetail(bag) {
  meshTableWrapEl.hidden = false
  meshDetailEmptyEl.hidden = true
  meshTitleEl.textContent = `@${bag.id}`
  meshCellCountEl.textContent = `${bag.cells.length} cell${bag.cells.length === 1 ? '' : 's'}`
  meshRowsEl.replaceChildren()
  for (const cell of bag.cells) {
    const tr = document.createElement('tr')
    const keyTd = document.createElement('td')
    keyTd.className = 'mono'
    keyTd.textContent = cell.key
    const addrTd = document.createElement('td')
    addrTd.className = 'mono'
    addrTd.textContent = cell.address
    const kindTd = document.createElement('td')
    kindTd.textContent = cell.kind
    const valueTd = document.createElement('td')
    valueTd.className = 'cell-value'
    if (cell.kind === 'pulse' && typeof cell.value === 'number' && Number.isFinite(cell.value)) {
      valueTd.append(
        createStepper(cell.value, async (next) => {
          await sendToPage({ type: 'setMeshCell', bagId: bag.id, key: cell.key, value: next })
          await refresh()
        }),
      )
    } else {
      const span = document.createElement('span')
      span.className = 'mono'
      span.textContent = cell.valuePreview ?? previewValue(cell.value)
      valueTd.append(span)
    }
    tr.append(keyTd, addrTd, kindTd, valueTd)
    tr.addEventListener('click', (event) => {
      if (event.target.closest('.stepper')) return
      if (cell.pulseId != null) {
        selectedPulseId = cell.pulseId
        setTab('state')
        renderState()
        void selectPulse(cell.pulseId)
      }
    })
    meshRowsEl.append(tr)
  }
  if (!bag.cells.length) {
    const tr = document.createElement('tr')
    tr.innerHTML = `<td colspan="4" class="muted">No cells yet.</td>`
    meshRowsEl.append(tr)
  }
}

function createStepper(value, onCommit) {
  const wrap = document.createElement('div')
  wrap.className = 'stepper'
  const dec = document.createElement('button')
  dec.type = 'button'
  dec.textContent = '−'
  dec.title = 'Decrease'
  const input = document.createElement('input')
  input.type = 'number'
  input.value = String(value)
  input.step = Number.isInteger(value) ? '1' : 'any'
  const inc = document.createElement('button')
  inc.type = 'button'
  inc.textContent = '+'
  inc.title = 'Increase'

  const commit = async (next) => {
    if (!Number.isFinite(next)) return
    input.value = String(next)
    await onCommit(next)
  }

  dec.addEventListener('click', (event) => {
    event.stopPropagation()
    const current = Number(input.value)
    const step = Number.isInteger(current) ? 1 : 0.1
    void commit(roundStep(current - step, step))
  })
  inc.addEventListener('click', (event) => {
    event.stopPropagation()
    const current = Number(input.value)
    const step = Number.isInteger(current) ? 1 : 0.1
    void commit(roundStep(current + step, step))
  })
  input.addEventListener('click', (event) => event.stopPropagation())
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      void commit(Number(input.value))
    }
  })
  input.addEventListener('change', () => {
    void commit(Number(input.value))
  })

  wrap.append(dec, input, inc)
  return wrap
}

function roundStep(value, step) {
  if (step >= 1) return Math.round(value)
  return Math.round(value * 10) / 10
}

function setMeshIoStatus(text, kind) {
  if (!text) {
    meshIoStatusEl.hidden = true
    meshIoStatusEl.textContent = ''
    return
  }
  meshIoStatusEl.hidden = false
  meshIoStatusEl.textContent = text
  meshIoStatusEl.className = `mesh-io-status${kind ? ` is-${kind}` : ''}`
}

function renderScope() {
  const entries = inspect?.scope ?? []
  scopeRowsEl.replaceChildren()
  scopeEmptyEl.hidden = entries.length > 0
  scopeTableEl.hidden = entries.length === 0
  for (const entry of entries) {
    const tr = document.createElement('tr')
    tr.innerHTML = `
      <td>${escapeHtml(entry.label || entry.id)}</td>
      <td class="mono">${escapeHtml(entry.id)}</td>
      <td class="mono">${escapeHtml(entry.valuePreview ?? previewValue(entry.value))}</td>
    `
    scopeRowsEl.append(tr)
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
    li.innerHTML = `<span>${escapeHtml(nodeLabel(node))}</span><span class="item-value">${escapeHtml(previewValue(node.value ?? node.valuePreview))}</span>`
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
    const dom = [binding.tag, binding.id ? `#${binding.id}` : ''].filter(Boolean).join('')
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
  const kind = typeLabel(pulse)
  if (kind) {
    detailKindEl.hidden = false
    detailKindEl.textContent = kind
  } else {
    detailKindEl.hidden = true
    detailKindEl.textContent = ''
  }

  const src = sourceLabel(pulse)
  if (src) {
    detailSourceEl.hidden = false
    detailSourceEl.textContent = src
  } else {
    detailSourceEl.hidden = true
  }

  if (!isEditingValue()) {
    renderValueEditor(pulse, options)
  }

  detailBindCountEl.textContent = String(bindings?.length ?? 0)
  renderBindings(bindings ?? [])
  renderRelationList(upstreamListEl, relatedNodes(pulse.id, 'up'))
  renderRelationList(downstreamListEl, relatedNodes(pulse.id, 'down'))
}

function isEditingValue() {
  const el = document.activeElement
  return Boolean(el && (el.closest('.stepper') || el.closest('#detail-value-wrap')))
}

function renderValueEditor(pulse, options = {}) {
  const value = pulse.value
  detailValueWrapEl.replaceChildren()
  if (typeof value === 'number' && Number.isFinite(value) && pulse.kind === 'signal') {
    detailValueWrapEl.append(
      createStepper(value, async (next) => {
        await sendToPage({ type: 'setPulseValue', pulseId: pulse.id, value: next })
        await refresh()
      }),
    )
    return
  }

  const pre = document.createElement('pre')
  pre.id = 'detail-value'
  const valueText = formatValue(value)
  const flashed = Boolean(options.flashed)
  pre.className = `value-block${flashed ? ' is-flash' : ''}`
  pre.innerHTML = flashed
    ? highlightChangedLines(options.previousText, valueText)
    : escapeHtml(valueText)
  detailValueWrapEl.append(pre)
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
    const bridge = await ensurePageBridge()
    if (bridge && bridge.ok === false) {
      hello = null
      inspect = null
      setStatus('offline', false)
      hintEl.hidden = false
      hintEl.textContent = bridge.error || 'Could not attach to this tab.'
      renderAll()
      return
    }
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
            Boolean(
              pulse.name ||
                pulse.bindings > 0 ||
                (pulse.file && /\.jcr/i.test(pulse.file)) ||
                pulse.kind === 'signal',
            )
        }
      }
    }
    setStatus(hello ? 'live' : 'offline', Boolean(hello))
  } catch (error) {
    hello = null
    inspect = null
    setStatus('error', false)
    hintEl.hidden = false
    hintEl.textContent = String(error?.message ?? error)
  }
  renderHint()
  renderRoute()
  detectChanges(activePulses())
  renderState()
  renderScreens()
  if (!isEditingValue()) {
    renderMesh()
  }
  renderScope()
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
    setTab('state')
    await selectPulse(selectedPulseId)
    renderState()
  }
})

filterEl.addEventListener('input', () => renderState())
showAllEl.addEventListener('change', () => renderState())
meshFilterEl.addEventListener('input', () => renderMesh())

btnMeshExport.addEventListener('click', async () => {
  try {
    const res = await sendToPage({ type: 'exportMesh' })
    const mesh = res?.mesh ?? {}
    const blob = new Blob([JSON.stringify(mesh, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `jacare-mesh${selectedBagId ? `-${selectedBagId}` : ''}.json`
    a.click()
    URL.revokeObjectURL(url)
    setMeshIoStatus(`Exported ${Object.keys(mesh).length} bag(s)`, 'ok')
  } catch (error) {
    setMeshIoStatus(String(error?.message ?? error), 'error')
  }
})

btnMeshImport.addEventListener('click', () => {
  meshImportFileEl.click()
})

meshImportFileEl.addEventListener('change', async () => {
  const file = meshImportFileEl.files?.[0]
  meshImportFileEl.value = ''
  if (!file) return
  try {
    const text = await file.text()
    const data = JSON.parse(text)
    const res = await sendToPage({ type: 'importMesh', data })
    if (!res?.ok) {
      setMeshIoStatus(res?.error || 'Import failed', 'error')
      return
    }
    setMeshIoStatus(`Imported ${res.bags?.join(', ') || 'bags'}`, 'ok')
    await refresh()
  } catch (error) {
    setMeshIoStatus(String(error?.message ?? error), 'error')
  }
})

for (const btn of document.querySelectorAll('.tab')) {
  btn.addEventListener('click', () => setTab(btn.dataset.tab))
}

bindSplitters()

void refresh()
setInterval(() => {
  void refresh()
}, 1500)

function bindSplitters() {
  for (const workspace of document.querySelectorAll('[data-split]')) {
    const id = workspace.dataset.split
    const split = workspace.querySelector('.split')
    if (!split) continue

    const stacked = () => window.matchMedia('(max-width: 720px)').matches
    const storageKey = () => `jacare-devtools-split-${id}-${stacked() ? 'y' : 'x'}`

    const bounds = () => {
      const rect = workspace.getBoundingClientRect()
      return stacked()
        ? { min: 88, max: Math.max(120, rect.height - 80) }
        : { min: 160, max: Math.max(200, rect.width - 180) }
    }

    const apply = (px) => {
      const { min, max } = bounds()
      const next = Math.round(Math.min(max, Math.max(min, px)))
      workspace.style.setProperty('--split-size', `${next}px`)
      try {
        sessionStorage.setItem(storageKey(), String(next))
      } catch {
        // ignore
      }
      return next
    }

    const read = () => {
      try {
        const raw = sessionStorage.getItem(storageKey())
        if (raw) return Number(raw)
      } catch {
        // ignore
      }
      return stacked() ? 160 : 240
    }

    const syncChrome = () => {
      split.setAttribute('aria-orientation', stacked() ? 'horizontal' : 'vertical')
      apply(read())
    }

    syncChrome()

    let dragging = false
    const onMove = (event) => {
      if (!dragging) return
      const rect = workspace.getBoundingClientRect()
      const next = stacked() ? event.clientY - rect.top : event.clientX - rect.left
      apply(next)
    }
    const onUp = () => {
      if (!dragging) return
      dragging = false
      workspace.classList.remove('is-dragging')
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }

    split.addEventListener('pointerdown', (event) => {
      dragging = true
      workspace.classList.add('is-dragging')
      split.setPointerCapture?.(event.pointerId)
      window.addEventListener('pointermove', onMove)
      window.addEventListener('pointerup', onUp)
      onMove(event)
    })

    window.matchMedia('(max-width: 720px)').addEventListener('change', syncChrome)
  }
}
