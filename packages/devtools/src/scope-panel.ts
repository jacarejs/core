import type { ScopeSnapshot } from '@jacare/core'
import { clearScope } from '@jacare/core'
import {
  applyCorner,
  readUiConfig,
  writeUiConfig,
  type PanelCorner,
} from './config.js'

export interface ScopePanelHandle {
  render(snapshot: ScopeSnapshot): void
  dispose(): void
}

export function createScopePanel(host: HTMLElement): ScopePanelHandle {
  const root = document.createElement('div')
  root.className = 'jacare-scope'
  root.innerHTML = `
    <style>
      .jacare-scope {
        position: fixed;
        z-index: 2147483645;
        width: min(22rem, calc(100vw - 2rem));
        max-height: min(24rem, calc(100vh - 2rem));
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

      .jacare-scope__header {
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

      .jacare-scope__header:active {
        cursor: grabbing;
      }

      .jacare-scope__title {
        font-size: 0.8125rem;
        font-weight: 600;
      }

      .jacare-scope__meta {
        font-size: 0.75rem;
        color: #71717a;
      }

      .jacare-scope__actions {
        display: inline-flex;
        gap: 0.35rem;
      }

      .jacare-scope__toggle {
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
        cursor: pointer;
      }

      .jacare-scope__toggle:hover {
        background: #f4f4f5;
        color: #18181b;
      }

      .jacare-scope__body {
        overflow: auto;
        padding: 0.5rem 0.65rem;
      }

      .jacare-scope__empty {
        margin: 0;
        color: #71717a;
        font-size: 0.8125rem;
      }

      .jacare-scope__list {
        margin: 0;
        padding: 0;
        list-style: none;
        display: grid;
        gap: 0.45rem;
      }

      .jacare-scope__item {
        padding: 0.45rem 0.55rem;
        border-radius: 6px;
        background: #f4f4f5;
      }

      .jacare-scope__label {
        display: block;
        font-size: 0.6875rem;
        font-weight: 600;
        color: #71717a;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        margin-bottom: 0.2rem;
      }

      .jacare-scope__value {
        margin: 0;
        font: 12px/1.45 ui-monospace, SFMono-Regular, Menlo, monospace;
        white-space: pre-wrap;
        word-break: break-word;
      }

      .jacare-scope__hint {
        margin: 0 0 0.5rem;
        font-size: 0.6875rem;
        color: #71717a;
        line-height: 1.4;
      }
    </style>
    <header class="jacare-scope__header" data-drag>
      <div>
        <span class="jacare-scope__title">Scope</span>
        <span class="jacare-scope__meta" data-meta></span>
      </div>
      <div class="jacare-scope__actions">
        <button class="jacare-scope__toggle" type="button" data-clear title="Clear Scope entries" aria-label="Clear Scope">⌫</button>
      </div>
    </header>
    <div class="jacare-scope__body" data-body></div>
  `

  host.appendChild(root)

  const header = root.querySelector('[data-drag]') as HTMLElement
  const meta = root.querySelector('[data-meta]') as HTMLElement
  const body = root.querySelector('[data-body]') as HTMLElement
  const clearBtn = root.querySelector('[data-clear]') as HTMLButtonElement

  let ui = readUiConfig()
  applyCorner(root, ui.scopePosition)

  let dragOffsetX = 0
  let dragOffsetY = 0
  let dragging = false

  const onPosition = (event: Event): void => {
    const detail = (event as CustomEvent<{ corner: PanelCorner }>).detail
    if (!detail?.corner) return
    ui = writeUiConfig({ scopePosition: detail.corner })
    root.style.transform = ''
    applyCorner(root, detail.corner)
  }
  window.addEventListener('jacare:devtools:scope-position', onPosition)

  clearBtn.addEventListener('click', (event) => {
    event.stopPropagation()
    clearScope()
  })

  header.addEventListener('pointerdown', (event) => {
    const target = event.target as HTMLElement
    if (target.closest('button')) return
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
    if (value === '') return '(empty)'
    try {
      return JSON.stringify(value, null, 2)
    } catch {
      return String(value)
    }
  }

  function render(snapshot: ScopeSnapshot): void {
    meta.textContent = ` · ${snapshot.entries.length} live`
    if (snapshot.entries.length === 0) {
      body.innerHTML = `
        <p class="jacare-scope__hint">
          Scope is a manual watch list. Call <code>registerScope(id, label, () =&gt; value)</code>
          from <code>onActivate</code> / mount code — values refresh ~every 120ms while DevTools is open.
        </p>
        <p class="jacare-scope__empty">No entries yet. See Lifecycle lesson for a live example.</p>
      `
      return
    }

    body.innerHTML = `
      <ul class="jacare-scope__list">
        ${snapshot.entries
          .map(
            (entry) => `
          <li class="jacare-scope__item">
            <span class="jacare-scope__label">${escapeHtml(entry.label)}</span>
            <pre class="jacare-scope__value">${escapeHtml(formatValue(entry.value))}</pre>
          </li>
        `,
          )
          .join('')}
      </ul>
    `
  }

  return {
    render,
    dispose() {
      window.removeEventListener('jacare:devtools:scope-position', onPosition)
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
