const SOURCE = 'jacare-devtools-extension'
const PAGE_SOURCE = 'jacare-devtools-page'

const statusEl = document.getElementById('status')
const hintEl = document.getElementById('hint')
const protocolEl = document.getElementById('protocol')
const coreVersionEl = document.getElementById('core-version')
const enabledEl = document.getElementById('enabled')
const pulseCountEl = document.getElementById('pulse-count')
const pulseListEl = document.getElementById('pulse-list')
const bindingsListEl = document.getElementById('bindings-list')
const bindingsEmptyEl = document.getElementById('bindings-empty')
const filterEl = document.getElementById('filter')

let latestGraph = null
let selectedPulseId = null
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
      'No Jacaré hook on this page. Open a Jacaré app in DEV (Lab / yarn lab:dev), reload the tab, then Refresh. Production builds usually omit the hook.'
    return
  }
  if (!hello.enabled) {
    hintEl.textContent =
      'Hook found but DevTools collection is off. The page hook will call enableDevtools() when you Refresh.'
    return
  }
  hintEl.textContent = 'Connected. Click a pulse to highlight bindings in the page.'
}

function renderMeta() {
  protocolEl.textContent = hello?.protocol ?? '—'
  coreVersionEl.textContent = hello?.coreVersion ?? '—'
  enabledEl.textContent = hello ? String(Boolean(hello.enabled)) : '—'
  const count = latestGraph?.pulses?.length ?? 0
  pulseCountEl.textContent = String(count)
}

function renderPulses() {
  const q = filterEl.value.trim().toLowerCase()
  const pulses = latestGraph?.pulses ?? []
  pulseListEl.replaceChildren()

  for (const pulse of pulses) {
    const label = `${pulse.name ?? `#${pulse.id}`} · ${pulse.kind ?? 'pulse'}`
    if (q && !label.toLowerCase().includes(q) && !String(pulse.id).includes(q)) continue

    const li = document.createElement('li')
    if (pulse.id === selectedPulseId) li.classList.add('active')

    const left = document.createElement('div')
    left.innerHTML = `<div>${escapeHtml(pulse.name ?? `pulse ${pulse.id}`)}</div><div class="kind">${escapeHtml(pulse.kind ?? '')}</div>`

    const right = document.createElement('code')
    right.textContent = formatValue(pulse.value)

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
    empty.textContent = pulses.length ? 'No pulses match the filter.' : 'No pulses yet.'
    pulseListEl.append(empty)
  }
}

function renderBindings(bindings) {
  bindingsListEl.replaceChildren()
  const list = bindings ?? []
  bindingsEmptyEl.hidden = list.length > 0

  for (const binding of list) {
    const li = document.createElement('li')
    li.innerHTML = `<div><strong>${escapeHtml(binding.kind ?? 'bind')}</strong> ${escapeHtml(binding.file ?? '')}${binding.line != null ? ':' + binding.line : ''}</div>`
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

async function selectPulse(pulseId) {
  await sendToPage({ type: 'highlight', pulseId })
  const res = await sendToPage({ type: 'getBindings', pulseId })
  renderBindings(res?.bindings ?? [])
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
    const graphRes = await sendToPage({ type: 'getGraph' })
    latestGraph = graphRes?.graph ?? { pulses: [] }
    setStatus(hello ? 'connected' : 'no hook', Boolean(hello))
  } catch (error) {
    hello = null
    latestGraph = { pulses: [] }
    setStatus('error', false)
    hintEl.textContent = String(error?.message ?? error)
  }
  renderHint()
  renderMeta()
  renderPulses()
  renderBindings([])
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

void refresh()
setInterval(() => {
  void refresh()
}, 2000)
