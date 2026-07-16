import type { PulseGraphSnapshot, PulseNode, PulseNodeKind } from '@jacare/core'

const KIND_LABEL: Record<PulseNodeKind, string> = {
  signal: 'Pulse',
  computed: 'Derive',
  effect: 'Watch',
}

const STORAGE_KEY = 'jacare:devtools:pulse'

export interface PanelHandle {
  render(snapshot: PulseGraphSnapshot): void
  dispose(): void
}

type PanelMode = 'open' | 'minimized' | 'hidden'

function readStoredMode(): PanelMode {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (raw === 'open' || raw === 'minimized' || raw === 'hidden') return raw
  } catch {}
  return 'open'
}

function storeMode(mode: PanelMode): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, mode)
  } catch {}
}

export function createPanel(host: HTMLElement): PanelHandle {
  const root = document.createElement('div')
  root.className = 'jacare-devtools'
  root.innerHTML = `
    <style>
      .jacare-devtools {
        position: fixed;
        right: 1rem;
        bottom: 1rem;
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
      .jacare-devtools--hidden .jacare-devtools__body,
      .jacare-devtools--hidden .jacare-devtools__header {
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
        width: 1.5rem;
        height: 1.5rem;
        padding: 0;
        border: 1px solid #d4d4d8;
        border-radius: 6px;
        background: #fff;
        color: #52525b;
        font: inherit;
        font-size: 0.875rem;
        line-height: 1;
        cursor: pointer;
      }

      .jacare-devtools__toggle:hover {
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

      .jacare-devtools--minimized .jacare-devtools__hint,
      .jacare-devtools--hidden .jacare-devtools__hint {
        display: none;
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
    </style>
    <button class="jacare-devtools__launcher" type="button" data-launcher aria-label="Show Pulse Graph">
      <span class="jacare-devtools__launcher-dot" aria-hidden="true"></span>
      Pulse Graph
    </button>
    <header class="jacare-devtools__header">
      <div class="jacare-devtools__header-main">
        <span class="jacare-devtools__title">Pulse Graph</span>
        <span class="jacare-devtools__meta" data-meta></span>
      </div>
      <div class="jacare-devtools__actions">
        <button class="jacare-devtools__toggle" type="button" data-minimize aria-label="Minimize Pulse Graph" title="Minimize">−</button>
        <button class="jacare-devtools__toggle" type="button" data-hide aria-label="Hide Pulse Graph" title="Hide">×</button>
      </div>
    </header>
    <p class="jacare-devtools__hint">Live values update as you interact · hide with × · restore from the chip</p>
    <div class="jacare-devtools__body">
      <ul class="jacare-devtools__list" data-list></ul>
      <div class="jacare-devtools__detail" data-detail></div>
    </div>
  `

  host.appendChild(root)

  const header = root.querySelector('.jacare-devtools__header') as HTMLElement
  const launcher = root.querySelector('[data-launcher]') as HTMLButtonElement
  const minimizeBtn = root.querySelector('[data-minimize]') as HTMLButtonElement
  const hideBtn = root.querySelector('[data-hide]') as HTMLButtonElement
  const meta = root.querySelector('[data-meta]') as HTMLElement
  const list = root.querySelector('[data-list]') as HTMLUListElement
  const detail = root.querySelector('[data-detail]') as HTMLElement

  let selectedId: number | null = null
  let mode: PanelMode = readStoredMode()
  let latest: PulseGraphSnapshot = { nodes: [], edges: [], updatedAt: 0 }
  const previousValues = new Map<number, string>()

  function applyMode(): void {
    root.classList.toggle('jacare-devtools--minimized', mode === 'minimized')
    root.classList.toggle('jacare-devtools--hidden', mode === 'hidden')
    minimizeBtn.textContent = mode === 'minimized' ? '+' : '−'
    minimizeBtn.setAttribute(
      'aria-label',
      mode === 'minimized' ? 'Expand Pulse Graph' : 'Minimize Pulse Graph',
    )
    minimizeBtn.setAttribute('title', mode === 'minimized' ? 'Expand' : 'Minimize')
    storeMode(mode)
  }

  function setMode(next: PanelMode): void {
    mode = next
    applyMode()
  }

  applyMode()

  minimizeBtn.addEventListener('click', (event) => {
    event.stopPropagation()
    setMode(mode === 'minimized' ? 'open' : 'minimized')
  })

  hideBtn.addEventListener('click', (event) => {
    event.stopPropagation()
    setMode('hidden')
  })

  launcher.addEventListener('click', () => {
    setMode('open')
  })

  header.addEventListener('click', () => {
    if (mode === 'minimized') {
      setMode('open')
    }
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
    return `${KIND_LABEL[node.kind]} #${node.id}`
  }

  function renderDetail(snapshot: PulseGraphSnapshot, node: PulseNode | undefined, flashed: boolean): void {
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
              kind: node.kind,
              stale: node.stale ?? false,
              disposed: node.disposed,
              subscribers: node.subscribers,
            },
            null,
            2,
          ),
        )}</pre>
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
      item.innerHTML = `
        <span class="jacare-devtools__item-kind">${KIND_LABEL[node.kind]}</span>
        <span class="jacare-devtools__item-id">#${node.id}</span>
        <span class="jacare-devtools__item-value">${escapeHtml(previewValue(node.value))}</span>
      `
      item.addEventListener('click', () => {
        selectedId = node.id
        render(latest)
      })
      list.appendChild(item)
    }

    const current = activeNodes.find((node) => node.id === selectedId)
    renderDetail(snapshot, current, current ? changed.has(current.id) : false)
  }

  return {
    render,
    dispose() {
      root.remove()
    },
  }
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}
