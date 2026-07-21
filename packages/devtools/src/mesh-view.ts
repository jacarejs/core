import type { MeshSnapshot } from '@jacare/core'

const RIPPLE_FLASH_MS = 900

export const MESH_VIEW_STYLES = `
  .jacare-mesh-view {
    overflow: auto;
    padding: 0.5rem 0.65rem;
    height: 100%;
    box-sizing: border-box;
  }

  .jacare-mesh-view__empty {
    margin: 0;
    color: #71717a;
    font-size: 0.8125rem;
  }

  .jacare-mesh-view__hint {
    margin: 0 0 0.5rem;
    font-size: 0.6875rem;
    color: #71717a;
    line-height: 1.4;
  }

  .jacare-mesh-view__ripple {
    margin: 0 0 0.55rem;
    padding: 0.4rem 0.5rem;
    border-radius: 6px;
    background: #ecfdf5;
    border: 1px solid #a7f3d0;
    font-size: 0.75rem;
    color: #065f46;
  }

  .jacare-mesh-view__ripple.is-fresh {
    animation: jacare-mesh-ripple-flash 0.9s ease;
  }

  @keyframes jacare-mesh-ripple-flash {
    0% { background: #bbf7d0; }
    100% { background: #ecfdf5; }
  }

  .jacare-mesh-view__bag {
    margin: 0 0 0.65rem;
    padding: 0.45rem 0.55rem;
    border-radius: 6px;
    background: #f4f4f5;
  }

  .jacare-mesh-view__bag-title {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 0.5rem;
    margin-bottom: 0.35rem;
    font-size: 0.75rem;
    font-weight: 700;
  }

  .jacare-mesh-view__bag-meta {
    font-weight: 500;
    color: #71717a;
    font-size: 0.6875rem;
  }

  .jacare-mesh-view__list {
    margin: 0;
    padding: 0;
    list-style: none;
    display: grid;
    gap: 0.3rem;
  }

  .jacare-mesh-view__cell {
    display: grid;
    gap: 0.1rem;
    padding: 0.3rem 0.4rem;
    border-radius: 4px;
    background: #fff;
    border: 1px solid #e4e4e7;
  }

  .jacare-mesh-view__cell.is-flash {
    border-color: #34d399;
    box-shadow: 0 0 0 1px rgba(52, 211, 153, 0.35);
  }

  .jacare-mesh-view__addr {
    font: 11px/1.35 ui-monospace, SFMono-Regular, Menlo, monospace;
    font-weight: 600;
    color: #18181b;
  }

  .jacare-mesh-view__kind {
    font-size: 0.625rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: #71717a;
  }

  .jacare-mesh-view__value {
    margin: 0;
    font: 11px/1.4 ui-monospace, SFMono-Regular, Menlo, monospace;
    white-space: pre-wrap;
    word-break: break-word;
    color: #3f3f46;
  }

  .jacare-mesh-view__bound {
    font-size: 0.625rem;
    color: #2563eb;
  }

  .jacare-mesh-view__port {
    font: 11px/1.35 ui-monospace, SFMono-Regular, Menlo, monospace;
    color: #52525b;
    padding: 0.15rem 0.35rem;
  }
`

export interface MeshViewState {
  lastRippleAt: number
}

export function createMeshViewState(): MeshViewState {
  return { lastRippleAt: 0 }
}

export function meshSummary(snapshot: MeshSnapshot): string {
  const cellCount = snapshot.bags.reduce((n, bag) => n + bag.cells.length, 0)
  return `${snapshot.bags.length} bag${snapshot.bags.length === 1 ? '' : 's'} · ${cellCount} cell${cellCount === 1 ? '' : 's'}`
}

export function renderMeshView(
  target: HTMLElement,
  snapshot: MeshSnapshot,
  state: MeshViewState,
): void {
  if (snapshot.bags.length === 0) {
    target.innerHTML = `
      <p class="jacare-mesh-view__hint">
        Mesh shows <code>createBag</code> cells as stable addresses (<code>@cart/total</code>).
        Open Lab <code>/bag</code> or Todo <code>/shop</code> to see a live bag.
      </p>
      <p class="jacare-mesh-view__empty">No bags registered yet.</p>
    `
    return
  }

  const ripple = snapshot.lastRipple
  const rippleFresh = ripple != null && Date.now() - ripple.at < RIPPLE_FLASH_MS
  if (ripple && ripple.at !== state.lastRippleAt) {
    state.lastRippleAt = ripple.at
  }
  const flashSet = new Set(rippleFresh ? (ripple?.addresses ?? []) : [])

  const rippleHtml =
    ripple && ripple.addresses.length
      ? `<p class="jacare-mesh-view__ripple${rippleFresh ? ' is-fresh' : ''}">
          Ripple · ${escapeHtml(ripple.addresses.join(', '))}
        </p>`
      : ripple
        ? `<p class="jacare-mesh-view__ripple">Last ripple · no cell change</p>`
        : ''

  target.innerHTML =
    rippleHtml +
    snapshot.bags
      .map((bag) => {
        const status = bag.published ? 'live' : 'lazy'
        const cells = bag.cells
          .map((cell) => {
            const bound =
              cell.boundFrom.length > 0
                ? `<span class="jacare-mesh-view__bound">${escapeHtml(cell.boundFrom.join(', '))}${cell.bindings > cell.boundFrom.length ? ` · ${cell.bindings} binds` : ''}</span>`
                : cell.bindings > 0
                  ? `<span class="jacare-mesh-view__bound">${cell.bindings} bind${cell.bindings === 1 ? '' : 's'}</span>`
                  : ''
            return `
              <li class="jacare-mesh-view__cell${flashSet.has(cell.address) ? ' is-flash' : ''}">
                <span class="jacare-mesh-view__addr">${escapeHtml(cell.address)}</span>
                <span class="jacare-mesh-view__kind">${escapeHtml(cell.kind)}</span>
                <pre class="jacare-mesh-view__value">${escapeHtml(formatValue(cell.value))}</pre>
                ${bound}
              </li>
            `
          })
          .join('')
        const ports = bag.ports
          .map(
            (port) =>
              `<li class="jacare-mesh-view__port">${escapeHtml(port.address)} · intent</li>`,
          )
          .join('')

        return `
          <section class="jacare-mesh-view__bag">
            <div class="jacare-mesh-view__bag-title">
              <span>${escapeHtml(bag.id)}</span>
              <span class="jacare-mesh-view__bag-meta">${status} · ${bag.cells.length} cell${bag.cells.length === 1 ? '' : 's'} · ${bag.ports.length} port${bag.ports.length === 1 ? '' : 's'}</span>
            </div>
            ${
              bag.published
                ? `<ul class="jacare-mesh-view__list">${cells}${ports}</ul>`
                : `<p class="jacare-mesh-view__empty">Factory not run yet — first access publishes cells.</p>`
            }
          </section>
        `
      })
      .join('')
}

function formatValue(value: unknown): string {
  if (value === undefined) return '—'
  if (value === '') return '(empty)'
  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return String(value)
  }
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}
