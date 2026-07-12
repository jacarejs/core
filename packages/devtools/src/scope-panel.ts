import type { ScopeSnapshot } from '@jacare/core'

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
        left: 1rem;
        bottom: 1rem;
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
      }

      .jacare-scope__title {
        font-size: 0.8125rem;
        font-weight: 600;
      }

      .jacare-scope__meta {
        font-size: 0.75rem;
        color: #71717a;
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
    </style>
    <header class="jacare-scope__header">
      <span class="jacare-scope__title">Scope</span>
      <span class="jacare-scope__meta" data-meta></span>
    </header>
    <div class="jacare-scope__body" data-body></div>
  `

  host.appendChild(root)

  const meta = root.querySelector('[data-meta]') as HTMLElement
  const body = root.querySelector('[data-body]') as HTMLElement

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
    meta.textContent = `${snapshot.entries.length} live values`
    if (snapshot.entries.length === 0) {
      body.innerHTML = '<p class="jacare-scope__empty">Register values with <code>registerScope()</code> to watch live state.</p>'
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
