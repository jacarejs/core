import type { PulseGraphSnapshot, PulseNode, PulseNodeKind } from '@jacare/core'
import {
  clearHighlight,
  clearScope,
  getBindingsForPulse,
  getPulsesForElement,
  highlightBinding,
  pickElement,
} from '@jacare/core'
import {
  applyCorner,
  CORNER_LABELS,
  readUiConfig,
  writeUiConfig,
  type PanelCorner,
} from './config.js'

const KIND_LABEL: Record<PulseNodeKind, string> = {
  signal: 'Pulse',
  computed: 'Derive',
  effect: 'Watch',
}

export interface PanelHandle {
  render(snapshot: PulseGraphSnapshot): void
  dispose(): void
}

type PanelMode = 'open' | 'minimized' | 'hidden'

export function createPanel(host: HTMLElement): PanelHandle {
  const root = document.createElement('div')
  root.className = 'jacare-devtools'
  root.innerHTML = `
    <style>
      .jacare-devtools {
        position: fixed;
        z-index: 2147483646;
        width: min(26rem, calc(100vw - 2rem));
        max-height: min(32rem, calc(100vh - 2rem));
        display: grid;
        grid-template-rows: auto 1fr;
        border: 1px solid #d4d4d8;
        border-radius: 10px;
        background: #fff;
        color: #18181b;
        font: 13px/1.4 system-ui, -apple-system, sans-serif;
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.14);
        overflow: hidden;
      }

      .jacare-devtools--minimized {
        width: auto;
        max-height: none;
        grid-template-rows: auto;
      }

      .jacare-devtools--minimized .jacare-devtools__body,
      .jacare-devtools--minimized .jacare-devtools__hint,
      .jacare-devtools--minimized .jacare-devtools__config,
      .jacare-devtools--hidden .jacare-devtools__body,
      .jacare-devtools--hidden .jacare-devtools__header,
      .jacare-devtools--hidden .jacare-devtools__hint,
      .jacare-devtools--hidden .jacare-devtools__config {
        display: none;
      }

      .jacare-devtools--hidden {
        width: auto;
        max-height: none;
        border-radius: 999px;
        background: #061a14;
        color: #f4fff7;
        border-color: #061a14;
      }

      .jacare-devtools--minimized .jacare-devtools__header {
        border-bottom: none;
        cursor: pointer;
      }

      .jacare-devtools__launcher {
        display: none;
        align-items: center;
        gap: 0.45rem;
        padding: 0.55rem 0.9rem;
        border: none;
        background: transparent;
        color: inherit;
        font: inherit;
        font-weight: 600;
        cursor: pointer;
      }

      .jacare-devtools--hidden .jacare-devtools__launcher {
        display: inline-flex;
      }

      .jacare-devtools__launcher-dot {
        width: 0.5rem;
        height: 0.5rem;
        border-radius: 50%;
        background: #8fd12a;
        box-shadow: 0 0 0 3px rgba(143, 209, 42, 0.28);
      }

      .jacare-devtools__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.5rem;
        padding: 0.55rem 0.75rem;
        border-bottom: 1px solid #e4e4e7;
        background: #fafafa;
        cursor: grab;
        user-select: none;
      }

      .jacare-devtools__header:active {
        cursor: grabbing;
      }

      .jacare-devtools__header-main {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        min-width: 0;
      }

      .jacare-devtools__actions {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
      }

      .jacare-devtools__toggle {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 1.5rem;
        height: 1.5rem;
        padding: 0 0.35rem;
        border: 1px solid #d4d4d8;
        border-radius: 6px;
        background: #fff;
        color: #52525b;
        font: inherit;
        font-size: 0.75rem;
        line-height: 1;
        cursor: pointer;
      }

      .jacare-devtools__toggle:hover,
      .jacare-devtools__toggle.is-active {
        background: #f4f4f5;
        color: #18181b;
      }

      .jacare-devtools__title {
        font-size: 0.8125rem;
        font-weight: 600;
      }

      .jacare-devtools__meta {
        font-size: 0.75rem;
        color: #71717a;
      }

      .jacare-devtools__hint {
        display: block;
        padding: 0.35rem 0.75rem 0;
        font-size: 0.6875rem;
        color: #71717a;
      }

      .jacare-devtools__config {
        display: none;
        padding: 0.65rem 0.75rem;
        border-bottom: 1px solid #e4e4e7;
        background: #fafafa;
        gap: 0.65rem;
      }

      .jacare-devtools__config.is-open {
        display: grid;
      }

      .jacare-devtools__config-row {
        display: grid;
        gap: 0.3rem;
      }

      .jacare-devtools__config-row label {
        font-size: 0.6875rem;
        font-weight: 600;
        color: #71717a;
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }

      .jacare-devtools__config select,
      .jacare-devtools__config button {
        font: inherit;
        font-size: 0.8125rem;
      }

      .jacare-devtools__config select {
        width: 100%;
        padding: 0.35rem 0.45rem;
        border: 1px solid #d4d4d8;
        border-radius: 6px;
        background: #fff;
      }

      .jacare-devtools__config-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 0.35rem;
      }

      .jacare-devtools__config-actions button {
        padding: 0.3rem 0.55rem;
        border: 1px solid #d4d4d8;
        border-radius: 6px;
        background: #fff;
        color: #3f3f46;
        cursor: pointer;
      }

      .jacare-devtools__config-actions button:hover {
        background: #f4f4f5;
      }

      .jacare-devtools__config-note {
        margin: 0;
        font-size: 0.6875rem;
        color: #71717a;
        line-height: 1.4;
      }

      .jacare-devtools__body {
        display: grid;
        grid-template-columns: 11rem 1fr;
        min-height: 0;
      }

      .jacare-devtools__list {
        margin: 0;
        padding: 0.35rem 0;
        list-style: none;
        overflow: auto;
        border-right: 1px solid #e4e4e7;
      }

      .jacare-devtools__item {
        padding: 0.4rem 0.65rem;
        cursor: pointer;
        border-left: 2px solid transparent;
      }

      .jacare-devtools__item:hover {
        background: #f4f4f5;
      }

      .jacare-devtools__item.is-active {
        background: #eff6ff;
        border-left-color: #2563eb;
      }

      .jacare-devtools__item.is-pulse {
        animation: jacare-devtools-pulse 0.45s ease;
      }

      @keyframes jacare-devtools-pulse {
        0% { background: #dcfce7; }
        100% { background: transparent; }
      }

      .jacare-devtools__item-kind {
        display: block;
        font-size: 0.6875rem;
        color: #71717a;
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }

      .jacare-devtools__item-id {
        font-weight: 600;
        font-variant-numeric: tabular-nums;
      }

      .jacare-devtools__item-source {
        display: block;
        margin-top: 0.05rem;
        font-size: 0.65rem;
        color: #71717a;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .jacare-devtools__item-value {
        display: block;
        margin-top: 0.1rem;
        font: 11px/1.35 ui-monospace, SFMono-Regular, Menlo, monospace;
        color: #3f3f46;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .jacare-devtools__detail {
        padding: 0.65rem 0.75rem;
        overflow: auto;
      }

      .jacare-devtools__empty {
        color: #71717a;
        font-size: 0.8125rem;
      }

      .jacare-devtools__section {
        margin-bottom: 0.75rem;
      }

      .jacare-devtools__section h4 {
        margin: 0 0 0.35rem;
        font-size: 0.6875rem;
        font-weight: 600;
        color: #71717a;
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }

      .jacare-devtools__value {
        margin: 0;
        padding: 0.45rem 0.5rem;
        border-radius: 6px;
        background: #f4f4f5;
        font: 12px/1.45 ui-monospace, SFMono-Regular, Menlo, monospace;
        white-space: pre-wrap;
        word-break: break-word;
      }

      .jacare-devtools__value.is-pulse {
        animation: jacare-devtools-value 0.45s ease;
      }

      @keyframes jacare-devtools-value {
        0% { background: #dcfce7; }
        100% { background: #f4f4f5; }
      }

      .jacare-devtools__links {
        margin: 0;
        padding: 0;
        list-style: none;
      }

      .jacare-devtools__links li {
        padding: 0.2rem 0;
        font-variant-numeric: tabular-nums;
      }

      .jacare-devtools__link {
        color: #2563eb;
        text-decoration: none;
        cursor: pointer;
      }

      .jacare-devtools__link:hover {
        text-decoration: underline;
      }
    </style>
    <button class="jacare-devtools__launcher" type="button" data-launcher aria-label="Show Pulse Graph">
      <span class="jacare-devtools__launcher-dot" aria-hidden="true"></span>
      Pulse Graph
    </button>
    <header class="jacare-devtools__header" data-drag>
      <div class="jacare-devtools__header-main">
        <span class="jacare-devtools__title">Pulse Graph</span>
        <span class="jacare-devtools__meta" data-meta></span>
      </div>
      <div class="jacare-devtools__actions">
        <button class="jacare-devtools__toggle" type="button" data-config aria-label="Config" title="Config">⚙</button>
        <button class="jacare-devtools__toggle" type="button" data-pick aria-label="Pick element" title="Pick element">◎</button>
        <button class="jacare-devtools__toggle" type="button" data-minimize aria-label="Minimize Pulse Graph" title="Minimize">−</button>
        <button class="jacare-devtools__toggle" type="button" data-hide aria-label="Hide Pulse Graph" title="Hide">×</button>
      </div>
    </header>
    <div class="jacare-devtools__config" data-config-panel>
      <div class="jacare-devtools__config-row">
        <label for="jacare-pulse-corner">Pulse Graph position</label>
        <select id="jacare-pulse-corner" data-pulse-corner>
          ${cornerOptions()}
        </select>
      </div>
      <div class="jacare-devtools__config-row">
        <label for="jacare-scope-corner">Scope position</label>
        <select id="jacare-scope-corner" data-scope-corner>
          ${cornerOptions()}
        </select>
      </div>
      <div class="jacare-devtools__config-actions">
        <button type="button" data-clear-highlight>Clear highlight</button>
        <button type="button" data-clear-selection>Clear selection</button>
        <button type="button" data-clear-scope>Clear Scope</button>
        <button type="button" data-reset-layout>Reset layout</button>
      </div>
      <p class="jacare-devtools__config-note">
        Scope lists values you register with <code>registerScope(id, label, read)</code> —
        useful for cart totals, form drafts, filters. Drag the header to move freely.
      </p>
    </div>
    <p class="jacare-devtools__hint">Hover a node to outline DOM · ⚙ config · ◎ pick · drag header to move</p>
    <div class="jacare-devtools__body">
      <ul class="jacare-devtools__list" data-list></ul>
      <div class="jacare-devtools__detail" data-detail></div>
    </div>
  `

  host.appendChild(root)

  const header = root.querySelector('[data-drag]') as HTMLElement
  const launcher = root.querySelector('[data-launcher]') as HTMLButtonElement
  const configBtn = root.querySelector('[data-config]') as HTMLButtonElement
  const configPanel = root.querySelector('[data-config-panel]') as HTMLElement
  const pulseCornerSelect = root.querySelector('[data-pulse-corner]') as HTMLSelectElement
  const scopeCornerSelect = root.querySelector('[data-scope-corner]') as HTMLSelectElement
  const pickBtn = root.querySelector('[data-pick]') as HTMLButtonElement
  const minimizeBtn = root.querySelector('[data-minimize]') as HTMLButtonElement
  const hideBtn = root.querySelector('[data-hide]') as HTMLButtonElement
  const meta = root.querySelector('[data-meta]') as HTMLElement
  const list = root.querySelector('[data-list]') as HTMLUListElement
  const detail = root.querySelector('[data-detail]') as HTMLElement

  let ui = readUiConfig()
  let selectedId: number | null = null
  let mode: PanelMode = ui.pulseMode
  let configOpen = false
  let latest: PulseGraphSnapshot = { nodes: [], edges: [], updatedAt: 0 }
  const previousValues = new Map<number, string>()
  let dragOffsetX = 0
  let dragOffsetY = 0
  let dragging = false

  pulseCornerSelect.value = ui.pulsePosition
  scopeCornerSelect.value = ui.scopePosition
  applyCorner(root, ui.pulsePosition)
  notifyScopePosition(ui.scopePosition)

  function applyMode(): void {
    root.classList.toggle('jacare-devtools--minimized', mode === 'minimized')
    root.classList.toggle('jacare-devtools--hidden', mode === 'hidden')
    minimizeBtn.textContent = mode === 'minimized' ? '+' : '−'
    minimizeBtn.setAttribute(
      'aria-label',
      mode === 'minimized' ? 'Expand Pulse Graph' : 'Minimize Pulse Graph',
    )
    minimizeBtn.setAttribute('title', mode === 'minimized' ? 'Expand' : 'Minimize')
    ui = writeUiConfig({ pulseMode: mode })
  }

  function setMode(next: PanelMode): void {
    mode = next
    applyMode()
  }

  function setConfigOpen(open: boolean): void {
    configOpen = open
    configPanel.classList.toggle('is-open', open)
    configBtn.classList.toggle('is-active', open)
  }

  applyMode()

  configBtn.addEventListener('click', (event) => {
    event.stopPropagation()
    setConfigOpen(!configOpen)
  })

  pulseCornerSelect.addEventListener('change', () => {
    const corner = pulseCornerSelect.value as PanelCorner
    ui = writeUiConfig({ pulsePosition: corner })
    root.style.transform = ''
    applyCorner(root, corner)
  })

  scopeCornerSelect.addEventListener('change', () => {
    const corner = scopeCornerSelect.value as PanelCorner
    ui = writeUiConfig({ scopePosition: corner })
    notifyScopePosition(corner)
  })

  root.querySelector('[data-clear-highlight]')?.addEventListener('click', (event) => {
    event.stopPropagation()
    clearHighlight()
  })

  root.querySelector('[data-clear-selection]')?.addEventListener('click', (event) => {
    event.stopPropagation()
    selectedId = null
    clearHighlight()
    previousValues.clear()
    render(latest)
  })

  root.querySelector('[data-clear-scope]')?.addEventListener('click', (event) => {
    event.stopPropagation()
    clearScope()
  })

  root.querySelector('[data-reset-layout]')?.addEventListener('click', (event) => {
    event.stopPropagation()
    ui = writeUiConfig({
      pulsePosition: 'bottom-right',
      scopePosition: 'bottom-left',
      pulseMode: 'open',
    })
    pulseCornerSelect.value = ui.pulsePosition
    scopeCornerSelect.value = ui.scopePosition
    root.style.transform = ''
    applyCorner(root, ui.pulsePosition)
    notifyScopePosition(ui.scopePosition)
    setMode('open')
    setConfigOpen(false)
  })

  minimizeBtn.addEventListener('click', (event) => {
    event.stopPropagation()
    setMode(mode === 'minimized' ? 'open' : 'minimized')
  })

  hideBtn.addEventListener('click', (event) => {
    event.stopPropagation()
    clearHighlight()
    setConfigOpen(false)
    setMode('hidden')
  })

  pickBtn.addEventListener('click', async (event) => {
    event.stopPropagation()
    const el = await pickElement()
    if (!el) return
    const pulseIds = getPulsesForElement(el)
    if (pulseIds[0] != null) {
      selectedId = pulseIds[0]
      highlightBinding(selectedId)
      render(latest)
    }
  })

  launcher.addEventListener('click', () => {
    setMode('open')
  })

  header.addEventListener('click', () => {
    if (mode === 'minimized') {
      setMode('open')
    }
  })

  header.addEventListener('pointerdown', (event) => {
    if (mode !== 'open') return
    const target = event.target as HTMLElement
    if (target.closest('button') || target.closest('select')) return
    dragging = true
    const rect = root.getBoundingClientRect()
    dragOffsetX = event.clientX - rect.left
    dragOffsetY = event.clientY - rect.top
    header.setPointerCapture(event.pointerId)
  })

  header.addEventListener('pointermove', (event) => {
    if (!dragging) return
    const x = Math.max(0, Math.min(window.innerWidth - root.offsetWidth, event.clientX - dragOffsetX))
    const y = Math.max(0, Math.min(window.innerHeight - 40, event.clientY - dragOffsetY))
    root.style.left = `${x}px`
    root.style.top = `${y}px`
    root.style.right = 'auto'
    root.style.bottom = 'auto'
  })

  header.addEventListener('pointerup', () => {
    dragging = false
  })

  function formatValue(value: unknown): string {
    if (value === undefined) return '—'
    try {
      return JSON.stringify(value, null, 2)
    } catch {
      return String(value)
    }
  }

  function previewValue(value: unknown): string {
    if (value === undefined) return '—'
    try {
      const text = typeof value === 'string' ? JSON.stringify(value) : JSON.stringify(value)
      if (text == null) return String(value)
      return text.length > 42 ? `${text.slice(0, 41)}…` : text
    } catch {
      return String(value)
    }
  }

  function nodeLabel(node: PulseNode): string {
    if (node.name) return node.name
    return `${KIND_LABEL[node.kind]} #${node.id}`
  }

  function sourceLabel(node: PulseNode): string {
    if (!node.file) return ''
    const base = node.file.replace(/\\/g, '/').split('/').pop() || node.file
    if (node.line != null) return `${base}:${node.line}`
    return base
  }

  function openSource(node: PulseNode): void {
    if (!node.file) return
    const line = node.line ?? 1
    const path = node.file
    if (path.includes('/') || path.includes('\\')) {
      const href = `vscode://file${path.startsWith('/') ? '' : '/'}${path}:${line}`
      window.open(href, '_blank')
    }
  }

  function renderDetail(
    snapshot: PulseGraphSnapshot,
    node: PulseNode | undefined,
    flashed: boolean,
  ): void {
    if (!node) {
      detail.innerHTML = '<p class="jacare-devtools__empty">Select a node to inspect live values.</p>'
      return
    }

    const upstream = snapshot.edges
      .filter((edge) => edge.to === node.id)
      .map((edge) => snapshot.nodes.find((item) => item.id === edge.from))
      .filter((item): item is PulseNode => item != null)

    const downstream = snapshot.edges
      .filter((edge) => edge.from === node.id)
      .map((edge) => snapshot.nodes.find((item) => item.id === edge.to))
      .filter((item): item is PulseNode => item != null)

    const bindings = getBindingsForPulse(node.id)
    const src = sourceLabel(node)

    detail.innerHTML = `
      <div class="jacare-devtools__section">
        <h4>Value</h4>
        <pre class="jacare-devtools__value${flashed ? ' is-pulse' : ''}">${escapeHtml(formatValue(node.value))}</pre>
      </div>
      <div class="jacare-devtools__section">
        <h4>Meta</h4>
        <pre class="jacare-devtools__value">${escapeHtml(
          JSON.stringify(
            {
              id: node.id,
              name: node.name ?? null,
              kind: node.kind,
              source: src || null,
              stale: node.stale ?? false,
              disposed: node.disposed,
              subscribers: node.subscribers,
              bindings: bindings.length,
            },
            null,
            2,
          ),
        )}</pre>
        ${
          src
            ? `<p style="margin:0.35rem 0 0"><a class="jacare-devtools__link" data-open-source href="#">${escapeHtml(src)}</a></p>`
            : ''
        }
      </div>
      <div class="jacare-devtools__section">
        <h4>DOM bindings (${bindings.length})</h4>
        <ul class="jacare-devtools__links">
          ${
            bindings.length
              ? bindings
                  .map(
                    (b) =>
                      `<li>${escapeHtml(b.kind)}${b.file ? ` · ${escapeHtml(basename(b.file))}${b.line != null ? `:${b.line}` : ''}` : ''}</li>`,
                  )
                  .join('')
              : '<li class="jacare-devtools__empty">None</li>'
          }
        </ul>
      </div>
      <div class="jacare-devtools__section">
        <h4>Depends on (${upstream.length})</h4>
        <ul class="jacare-devtools__links">
          ${
            upstream.length
              ? upstream.map((item) => `<li>${escapeHtml(nodeLabel(item))}</li>`).join('')
              : '<li class="jacare-devtools__empty">None</li>'
          }
        </ul>
      </div>
      <div class="jacare-devtools__section">
        <h4>Feeds (${downstream.length})</h4>
        <ul class="jacare-devtools__links">
          ${
            downstream.length
              ? downstream.map((item) => `<li>${escapeHtml(nodeLabel(item))}</li>`).join('')
              : '<li class="jacare-devtools__empty">None</li>'
          }
        </ul>
      </div>
    `

    const openLink = detail.querySelector('[data-open-source]')
    openLink?.addEventListener('click', (event) => {
      event.preventDefault()
      openSource(node)
    })
  }

  function render(snapshot: PulseGraphSnapshot): void {
    latest = snapshot
    const activeNodes = snapshot.nodes.filter((node) => !node.disposed)
    if (selectedId != null && !activeNodes.some((node) => node.id === selectedId)) {
      selectedId = activeNodes[0]?.id ?? null
    }
    if (selectedId == null && activeNodes[0]) {
      selectedId = activeNodes[0].id
    }

    const changed = new Set<number>()
    for (const node of activeNodes) {
      const encoded = previewValue(node.value)
      const prev = previousValues.get(node.id)
      if (prev !== undefined && prev !== encoded) {
        changed.add(node.id)
      }
      previousValues.set(node.id, encoded)
    }

    meta.textContent = `${activeNodes.length} nodes · ${snapshot.edges.length} edges`
    list.innerHTML = ''

    for (const node of activeNodes) {
      const item = document.createElement('li')
      item.className = 'jacare-devtools__item'
      if (node.id === selectedId) item.classList.add('is-active')
      if (changed.has(node.id)) item.classList.add('is-pulse')
      const src = sourceLabel(node)
      item.innerHTML = `
        <span class="jacare-devtools__item-kind">${KIND_LABEL[node.kind]}</span>
        <span class="jacare-devtools__item-id">${escapeHtml(nodeLabel(node))}</span>
        ${src ? `<span class="jacare-devtools__item-source">${escapeHtml(src)}</span>` : ''}
        <span class="jacare-devtools__item-value">${escapeHtml(previewValue(node.value))}</span>
      `
      item.addEventListener('mouseenter', () => {
        highlightBinding(node.id)
      })
      item.addEventListener('mouseleave', () => {
        if (selectedId != null) highlightBinding(selectedId)
        else clearHighlight()
      })
      item.addEventListener('click', () => {
        selectedId = node.id
        highlightBinding(node.id)
        render(latest)
      })
      list.appendChild(item)
    }

    const current = activeNodes.find((node) => node.id === selectedId)
    if (current) highlightBinding(current.id)
    renderDetail(snapshot, current, current ? changed.has(current.id) : false)
  }

  return {
    render,
    dispose() {
      clearHighlight()
      root.remove()
    },
  }
}

function cornerOptions(): string {
  return (Object.keys(CORNER_LABELS) as PanelCorner[])
    .map((key) => `<option value="${key}">${CORNER_LABELS[key]}</option>`)
    .join('')
}

function basename(path: string): string {
  return path.replace(/\\/g, '/').split('/').pop() || path
}

function notifyScopePosition(corner: PanelCorner): void {
  window.dispatchEvent(new CustomEvent('jacare:devtools:scope-position', { detail: { corner } }))
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}
