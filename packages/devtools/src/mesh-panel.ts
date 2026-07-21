import type { MeshSnapshot } from '@jacare/core'
import { getBag, listBags } from '@jacare/core'
import {
  applyCorner,
  readUiConfig,
  writeUiConfig,
  type PanelCorner,
} from './config.js'
import {
  createMeshViewState,
  meshSummary,
  MESH_VIEW_STYLES,
  renderMeshView,
} from './mesh-view.js'

type MeshMode = 'open' | 'minimized'

export interface MeshPanelHandle {
  render(snapshot: MeshSnapshot): void
  dispose(): void
}

/** Floating Mesh window — used when the Mesh tab is popped out of Pulse Graph. */
export function createMeshPanel(host: HTMLElement): MeshPanelHandle {
  const root = document.createElement('div')
  root.className = 'jacare-mesh'
  root.innerHTML = `
    <style>
      .jacare-mesh {
        position: fixed;
        z-index: 2147483644;
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

      .jacare-mesh--minimized {
        width: auto;
        max-height: none;
        grid-template-rows: auto;
      }

      .jacare-mesh--minimized .jacare-mesh__body {
        display: none;
      }

      .jacare-mesh--minimized .jacare-mesh__header {
        border-bottom: none;
      }

      .jacare-mesh__header {
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

      .jacare-mesh__header:active {
        cursor: grabbing;
      }

      .jacare-mesh__title {
        font-size: 0.8125rem;
        font-weight: 600;
      }

      .jacare-mesh__meta {
        font-size: 0.75rem;
        color: #71717a;
      }

      .jacare-mesh__actions {
        display: inline-flex;
        gap: 0.35rem;
      }

      .jacare-mesh__toggle {
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

      .jacare-mesh__toggle:hover {
        background: #f4f4f5;
        color: #18181b;
      }

      .jacare-mesh__body {
        overflow: auto;
        min-height: 0;
      }

      ${MESH_VIEW_STYLES}
    </style>
    <header class="jacare-mesh__header" data-drag>
      <div>
        <span class="jacare-mesh__title">Mesh</span>
        <span class="jacare-mesh__meta" data-meta></span>
      </div>
      <div class="jacare-mesh__actions">
        <button class="jacare-mesh__toggle" type="button" data-dock title="Dock into Pulse Graph" aria-label="Dock Mesh into Pulse Graph">↙</button>
        <button class="jacare-mesh__toggle" type="button" data-reset title="Reset all bags to factory defaults" aria-label="Reset Mesh">Reset</button>
        <button class="jacare-mesh__toggle" type="button" data-minimize title="Minimize" aria-label="Minimize Mesh">−</button>
      </div>
    </header>
    <div class="jacare-mesh__body jacare-mesh-view" data-body></div>
  `

  host.appendChild(root)

  const header = root.querySelector('[data-drag]') as HTMLElement
  const meta = root.querySelector('[data-meta]') as HTMLElement
  const body = root.querySelector('[data-body]') as HTMLElement
  const dockBtn = root.querySelector('[data-dock]') as HTMLButtonElement
  const resetBtn = root.querySelector('[data-reset]') as HTMLButtonElement
  const minimizeBtn = root.querySelector('[data-minimize]') as HTMLButtonElement
  const viewState = createMeshViewState()

  let ui = readUiConfig()
  let mode: MeshMode = ui.meshMode
  applyCorner(root, ui.meshPosition)

  let dragOffsetX = 0
  let dragOffsetY = 0
  let dragging = false

  function applyMode(): void {
    root.classList.toggle('jacare-mesh--minimized', mode === 'minimized')
    minimizeBtn.textContent = mode === 'minimized' ? '+' : '−'
    minimizeBtn.setAttribute(
      'aria-label',
      mode === 'minimized' ? 'Expand Mesh' : 'Minimize Mesh',
    )
    minimizeBtn.setAttribute('title', mode === 'minimized' ? 'Expand' : 'Minimize')
    ui = writeUiConfig({ meshMode: mode })
  }

  function setMode(next: MeshMode): void {
    mode = next
    applyMode()
  }

  applyMode()

  const onPosition = (event: Event): void => {
    const detail = (event as CustomEvent<{ corner: PanelCorner }>).detail
    if (!detail?.corner) return
    ui = writeUiConfig({ meshPosition: detail.corner })
    root.style.transform = ''
    applyCorner(root, detail.corner)
  }

  const onMode = (event: Event): void => {
    const detail = (event as CustomEvent<{ mode: MeshMode }>).detail
    if (detail?.mode !== 'open' && detail?.mode !== 'minimized') return
    setMode(detail.mode)
  }

  window.addEventListener('jacare:devtools:mesh-position', onPosition)
  window.addEventListener('jacare:devtools:mesh-mode', onMode)

  dockBtn.addEventListener('click', (event) => {
    event.stopPropagation()
    writeUiConfig({ meshDetached: false, activeTab: 'mesh' })
    window.dispatchEvent(new CustomEvent('jacare:devtools:mesh-detached', { detail: { detached: false } }))
  })

  resetBtn.addEventListener('click', (event) => {
    event.stopPropagation()
    for (const id of listBags()) {
      getBag(id)?.reset()
    }
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

  function render(snapshot: MeshSnapshot): void {
    meta.textContent = ` · ${meshSummary(snapshot)}`
    renderMeshView(body, snapshot, viewState)
  }

  return {
    render,
    dispose() {
      window.removeEventListener('jacare:devtools:mesh-position', onPosition)
      window.removeEventListener('jacare:devtools:mesh-mode', onMode)
      root.remove()
    },
  }
}
