import type { ScopeSnapshot } from '@jacare/core'
import { clearScope } from '@jacare/core'
import {
  applyCorner,
  readUiConfig,
  writeUiConfig,
  type PanelCorner,
} from './config.js'
import { renderScopeView, scopeSummary, SCOPE_VIEW_STYLES } from './scope-view.js'

type ScopeMode = 'open' | 'minimized'

export interface ScopePanelHandle {
  render(snapshot: ScopeSnapshot): void
  dispose(): void
}

/** Floating Scope window — used when the Scope tab is popped out of Pulse Graph. */
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

      .jacare-scope--minimized {
        width: auto;
        max-height: none;
        grid-template-rows: auto;
      }

      .jacare-scope--minimized .jacare-scope__body {
        display: none;
      }

      .jacare-scope--minimized .jacare-scope__header {
        border-bottom: none;
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
        min-height: 0;
      }

      ${SCOPE_VIEW_STYLES}
    </style>
    <header class="jacare-scope__header" data-drag>
      <div>
        <span class="jacare-scope__title">Scope</span>
        <span class="jacare-scope__meta" data-meta></span>
      </div>
      <div class="jacare-scope__actions">
        <button class="jacare-scope__toggle" type="button" data-dock title="Dock into Pulse Graph" aria-label="Dock Scope into Pulse Graph">↙</button>
        <button class="jacare-scope__toggle" type="button" data-clear title="Clear Scope entries" aria-label="Clear Scope">⌫</button>
        <button class="jacare-scope__toggle" type="button" data-minimize title="Minimize" aria-label="Minimize Scope">−</button>
      </div>
    </header>
    <div class="jacare-scope__body jacare-scope-view" data-body></div>
  `

  host.appendChild(root)

  const header = root.querySelector('[data-drag]') as HTMLElement
  const meta = root.querySelector('[data-meta]') as HTMLElement
  const body = root.querySelector('[data-body]') as HTMLElement
  const dockBtn = root.querySelector('[data-dock]') as HTMLButtonElement
  const clearBtn = root.querySelector('[data-clear]') as HTMLButtonElement
  const minimizeBtn = root.querySelector('[data-minimize]') as HTMLButtonElement

  let ui = readUiConfig()
  let mode: ScopeMode = ui.scopeMode
  applyCorner(root, ui.scopePosition)

  let dragOffsetX = 0
  let dragOffsetY = 0
  let dragging = false

  function applyMode(): void {
    root.classList.toggle('jacare-scope--minimized', mode === 'minimized')
    minimizeBtn.textContent = mode === 'minimized' ? '+' : '−'
    minimizeBtn.setAttribute(
      'aria-label',
      mode === 'minimized' ? 'Expand Scope' : 'Minimize Scope',
    )
    minimizeBtn.setAttribute('title', mode === 'minimized' ? 'Expand' : 'Minimize')
    ui = writeUiConfig({ scopeMode: mode })
  }

  function setMode(next: ScopeMode): void {
    mode = next
    applyMode()
  }

  applyMode()

  const onPosition = (event: Event): void => {
    const detail = (event as CustomEvent<{ corner: PanelCorner }>).detail
    if (!detail?.corner) return
    ui = writeUiConfig({ scopePosition: detail.corner })
    root.style.transform = ''
    applyCorner(root, detail.corner)
  }

  const onMode = (event: Event): void => {
    const detail = (event as CustomEvent<{ mode: ScopeMode }>).detail
    if (detail?.mode !== 'open' && detail?.mode !== 'minimized') return
    setMode(detail.mode)
  }

  window.addEventListener('jacare:devtools:scope-position', onPosition)
  window.addEventListener('jacare:devtools:scope-mode', onMode)

  dockBtn.addEventListener('click', (event) => {
    event.stopPropagation()
    writeUiConfig({ scopeDetached: false, activeTab: 'scope' })
    window.dispatchEvent(
      new CustomEvent('jacare:devtools:scope-detached', { detail: { detached: false } }),
    )
  })

  clearBtn.addEventListener('click', (event) => {
    event.stopPropagation()
    clearScope()
  })

  minimizeBtn.addEventListener('click', (event) => {
    event.stopPropagation()
    setMode(mode === 'minimized' ? 'open' : 'minimized')
  })

  header.addEventListener('click', () => {
    if (mode === 'minimized') setMode('open')
  })

  header.addEventListener('pointerdown', (event) => {
    if (mode !== 'open') return
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

  function render(snapshot: ScopeSnapshot): void {
    meta.textContent = ` · ${scopeSummary(snapshot)}`
    renderScopeView(body, snapshot)
  }

  return {
    render,
    dispose() {
      window.removeEventListener('jacare:devtools:scope-position', onPosition)
      window.removeEventListener('jacare:devtools:scope-mode', onMode)
      root.remove()
    },
  }
}
