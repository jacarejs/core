import type { MeshSnapshot } from '@jacare/core'
import {
  applyCorner,
  readUiConfig,
  writeUiConfig,
  type PanelCorner,
} from './config.js'

type MeshMode = 'open' | 'minimized'

export interface MeshPanelHandle {
  render(snapshot: MeshSnapshot): void
  dispose(): void
}

const RIPPLE_FLASH_MS = 900

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
        padding: 0.5rem 0.65rem;
      }

      .jacare-mesh__empty {
        margin: 0;
        color: #71717a;
        font-size: 0.8125rem;
      }

      .jacare-mesh__hint {
        margin: 0 0 0.5rem;
        font-size: 0.6875rem;
        color: #71717a;
        line-height: 1.4;
      }

      .jacare-mesh__ripple {
        margin: 0 0 0.55rem;
        padding: 0.4rem 0.5rem;
        border-radius: 6px;
        background: #ecfdf5;
        border: 1px solid #a7f3d0;
        font-size: 0.75rem;
        color: #065f46;
      }

      .jacare-mesh__ripple.is-fresh {
        animation: jacare-mesh-ripple-flash 0.9s ease;
      }

      @keyframes jacare-mesh-ripple-flash {
        0% { background: #bbf7d0; }
        100% { background: #ecfdf5; }
      }

      .jacare-mesh__bag {
        margin: 0 0 0.65rem;
        padding: 0.45rem 0.55rem;
        border-radius: 6px;
        background: #f4f4f5;
      }

      .jacare-mesh__bag-title {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 0.5rem;
        margin-bottom: 0.35rem;
        font-size: 0.75rem;
        font-weight: 700;
      }

      .jacare-mesh__bag-meta {
        font-weight: 500;
        color: #71717a;
        font-size: 0.6875rem;
      }

      .jacare-mesh__list {
        margin: 0;
        padding: 0;
        list-style: none;
        display: grid;
        gap: 0.3rem;
      }

      .jacare-mesh__cell {
        display: grid;
        gap: 0.1rem;
        padding: 0.3rem 0.4rem;
        border-radius: 4px;
        background: #fff;
        border: 1px solid #e4e4e7;
      }

      .jacare-mesh__cell.is-flash {
        border-color: #34d399;
        box-shadow: 0 0 0 1px rgba(52, 211, 153, 0.35);
      }

      .jacare-mesh__addr {
        font: 11px/1.35 ui-monospace, SFMono-Regular, Menlo, monospace;
        font-weight: 600;
        color: #18181b;
      }

      .jacare-mesh__kind {
        font-size: 0.625rem;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: #71717a;
      }

      .jacare-mesh__value {
        margin: 0;
        font: 11px/1.4 ui-monospace, SFMono-Regular, Menlo, monospace;
        white-space: pre-wrap;
        word-break: break-word;
        color: #3f3f46;
      }

      .jacare-mesh__bound {
        font-size: 0.625rem;
        color: #2563eb;
      }

      .jacare-mesh__port {
        font: 11px/1.35 ui-monospace, SFMono-Regular, Menlo, monospace;
        color: #52525b;
        padding: 0.15rem 0.35rem;
      }
    </style>
    <header class="jacare-mesh__header" data-drag>
      <div>
        <span class="jacare-mesh__title">Mesh</span>
        <span class="jacare-mesh__meta" data-meta></span>
      </div>
      <div class="jacare-mesh__actions">
        <button class="jacare-mesh__toggle" type="button" data-minimize title="Minimize" aria-label="Minimize Mesh">−</button>
      </div>
    </header>
    <div class="jacare-mesh__body" data-body></div>
  `

  host.appendChild(root)

  const header = root.querySelector('[data-drag]') as HTMLElement
  const meta = root.querySelector('[data-meta]') as HTMLElement
  const body = root.querySelector('[data-body]') as HTMLElement
  const minimizeBtn = root.querySelector('[data-minimize]') as HTMLButtonElement

  let ui = readUiConfig()
  let mode: MeshMode = ui.meshMode
  applyCorner(root, ui.meshPosition)

  let dragOffsetX = 0
  let dragOffsetY = 0
  let dragging = false
  let lastRippleAt = 0

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

  function formatValue(value: unknown): string {
    if (value === undefined) return '—'
    if (value === '') return '(empty)'
    try {
      return JSON.stringify(value, null, 2)
    } catch {
      return String(value)
    }
  }

  function render(snapshot: MeshSnapshot): void {
    const cellCount = snapshot.bags.reduce((n, bag) => n + bag.cells.length, 0)
    meta.textContent = ` · ${snapshot.bags.length} bag${snapshot.bags.length === 1 ? '' : 's'} · ${cellCount} cell${cellCount === 1 ? '' : 's'}`

    if (snapshot.bags.length === 0) {
      body.innerHTML = `
        <p class="jacare-mesh__hint">
          Mesh shows <code>createBag</code> cells as stable addresses (<code>@cart/total</code>).
          Open Lab <code>/bag</code> or Todo <code>/shop</code> to see a live bag.
        </p>
        <p class="jacare-mesh__empty">No bags registered yet.</p>
      `
      return
    }

    const ripple = snapshot.lastRipple
    const rippleFresh = ripple != null && Date.now() - ripple.at < RIPPLE_FLASH_MS
    if (ripple && ripple.at !== lastRippleAt) {
      lastRippleAt = ripple.at
    }
    const flashSet = new Set(rippleFresh ? (ripple?.addresses ?? []) : [])

    const rippleHtml =
      ripple && ripple.addresses.length
        ? `<p class="jacare-mesh__ripple${rippleFresh ? ' is-fresh' : ''}">
            Ripple · ${escapeHtml(ripple.addresses.join(', '))}
          </p>`
        : ripple
          ? `<p class="jacare-mesh__ripple">Last ripple · no cell change</p>`
          : ''

    body.innerHTML =
      rippleHtml +
      snapshot.bags
        .map((bag) => {
          const status = bag.published ? 'live' : 'lazy'
          const cells = bag.cells
            .map((cell) => {
              const bound =
                cell.boundFrom.length > 0
                  ? `<span class="jacare-mesh__bound">${escapeHtml(cell.boundFrom.join(', '))}${cell.bindings > cell.boundFrom.length ? ` · ${cell.bindings} binds` : ''}</span>`
                  : cell.bindings > 0
                    ? `<span class="jacare-mesh__bound">${cell.bindings} bind${cell.bindings === 1 ? '' : 's'}</span>`
                    : ''
              return `
                <li class="jacare-mesh__cell${flashSet.has(cell.address) ? ' is-flash' : ''}">
                  <span class="jacare-mesh__addr">${escapeHtml(cell.address)}</span>
                  <span class="jacare-mesh__kind">${escapeHtml(cell.kind)}</span>
                  <pre class="jacare-mesh__value">${escapeHtml(formatValue(cell.value))}</pre>
                  ${bound}
                </li>
              `
            })
            .join('')
          const ports = bag.ports
            .map(
              (port) =>
                `<li class="jacare-mesh__port">${escapeHtml(port.address)} · intent</li>`,
            )
            .join('')

          return `
            <section class="jacare-mesh__bag">
              <div class="jacare-mesh__bag-title">
                <span>${escapeHtml(bag.id)}</span>
                <span class="jacare-mesh__bag-meta">${status} · ${bag.cells.length} cell${bag.cells.length === 1 ? '' : 's'} · ${bag.ports.length} port${bag.ports.length === 1 ? '' : 's'}</span>
              </div>
              ${
                bag.published
                  ? `<ul class="jacare-mesh__list">${cells}${ports}</ul>`
                  : `<p class="jacare-mesh__empty">Factory not run yet — first access publishes cells.</p>`
              }
            </section>
          `
        })
        .join('')
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

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}
