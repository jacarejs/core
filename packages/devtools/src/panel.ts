import type { PulseGraphSnapshot, PulseNode, PulseNodeKind } from '@jacare/core'

const KIND_LABEL: Record<PulseNodeKind, string> = {
  signal: 'Pulse',
  computed: 'Derive',
  effect: 'Watch',
}

export interface PanelHandle {
  render(snapshot: PulseGraphSnapshot): void
  dispose(): void
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
        width: min(24rem, calc(100vw - 2rem));
        max-height: min(28rem, calc(100vh - 2rem));
        display: grid;
        grid-template-rows: auto 1fr;
        border: 1px solid #d4d4d8;
        border-radius: 8px;
        background: #fff;
        color: #18181b;
        font: 13px/1.4 system-ui, -apple-system, sans-serif;
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
        overflow: hidden;
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

      .jacare-devtools__title {
        font-size: 0.8125rem;
        font-weight: 600;
      }

      .jacare-devtools__meta {
        font-size: 0.75rem;
        color: #71717a;
      }

      .jacare-devtools__body {
        display: grid;
        grid-template-columns: 9rem 1fr;
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
        padding: 0.35rem 0.65rem;
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
        animation: jacare-devtools-pulse 0.35s ease;
      }

      @keyframes jacare-devtools-pulse {
        0% { background: #dbeafe; }
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
        font-weight: 500;
        font-variant-numeric: tabular-nums;
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
    <header class="jacare-devtools__header">
      <span class="jacare-devtools__title">Pulse Graph</span>
      <span class="jacare-devtools__meta" data-meta></span>
    </header>
    <div class="jacare-devtools__body">
      <ul class="jacare-devtools__list" data-list></ul>
      <div class="jacare-devtools__detail" data-detail></div>
    </div>
  `

  host.appendChild(root)

  const meta = root.querySelector('[data-meta]') as HTMLElement
  const list = root.querySelector('[data-list]') as HTMLUListElement
  const detail = root.querySelector('[data-detail]') as HTMLElement

  let selectedId: number | null = null
  let lastUpdatedAt = 0
  const pulsed = new Set<number>()

  function formatValue(value: unknown): string {
    if (value === undefined) return '—'
    try {
      return JSON.stringify(value, null, 2)
    } catch {
      return String(value)
    }
  }

  function nodeLabel(node: PulseNode): string {
    return `${KIND_LABEL[node.kind]} #${node.id}`
  }

  function renderDetail(snapshot: PulseGraphSnapshot, node: PulseNode | undefined): void {
    if (!node) {
      detail.innerHTML = '<p class="jacare-devtools__empty">Select a node to inspect dependencies.</p>'
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
        <pre class="jacare-devtools__value">${escapeHtml(formatValue(node.value))}</pre>
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
    const activeNodes = snapshot.nodes.filter((node) => !node.disposed)
    if (selectedId != null && !activeNodes.some((node) => node.id === selectedId)) {
      selectedId = activeNodes[0]?.id ?? null
    }
    if (selectedId == null && activeNodes[0]) {
      selectedId = activeNodes[0].id
    }

    if (snapshot.updatedAt !== lastUpdatedAt) {
      pulsed.clear()
      lastUpdatedAt = snapshot.updatedAt
    }

    meta.textContent = `${activeNodes.length} nodes · ${snapshot.edges.length} edges`
    list.innerHTML = ''

    for (const node of activeNodes) {
      const item = document.createElement('li')
      item.className = 'jacare-devtools__item'
      if (node.id === selectedId) item.classList.add('is-active')
      item.innerHTML = `
        <span class="jacare-devtools__item-kind">${KIND_LABEL[node.kind]}</span>
        <span class="jacare-devtools__item-id">#${node.id}</span>
      `
      item.addEventListener('click', () => {
        selectedId = node.id
        render(snapshot)
      })
      list.appendChild(item)
    }

    const current = activeNodes.find((node) => node.id === selectedId)
    renderDetail(snapshot, current)
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
