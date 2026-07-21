import type { ScopeSnapshot } from '@jacare/core'

export const SCOPE_VIEW_STYLES = `
  .jacare-scope-view {
    overflow: auto;
    padding: 0.5rem 0.65rem;
    height: 100%;
    box-sizing: border-box;
  }

  .jacare-scope-view__empty {
    margin: 0;
    color: #71717a;
    font-size: 0.8125rem;
  }

  .jacare-scope-view__hint {
    margin: 0 0 0.5rem;
    font-size: 0.6875rem;
    color: #71717a;
    line-height: 1.4;
  }

  .jacare-scope-view__list {
    margin: 0;
    padding: 0;
    list-style: none;
    display: grid;
    gap: 0.45rem;
  }

  .jacare-scope-view__item {
    padding: 0.45rem 0.55rem;
    border-radius: 6px;
    background: #f4f4f5;
  }

  .jacare-scope-view__label {
    display: block;
    font-size: 0.6875rem;
    font-weight: 600;
    color: #71717a;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    margin-bottom: 0.2rem;
  }

  .jacare-scope-view__value {
    margin: 0;
    font: 12px/1.45 ui-monospace, SFMono-Regular, Menlo, monospace;
    white-space: pre-wrap;
    word-break: break-word;
  }
`

export function scopeSummary(snapshot: ScopeSnapshot): string {
  return `${snapshot.entries.length} live`
}

export function renderScopeView(target: HTMLElement, snapshot: ScopeSnapshot): void {
  if (snapshot.entries.length === 0) {
    target.innerHTML = `
      <p class="jacare-scope-view__hint">
        Scope is a manual watch list. Call <code>registerScope(id, label, () =&gt; value)</code>
        from <code>onActivate</code> / mount code — values refresh ~every 120ms while DevTools is open.
      </p>
      <p class="jacare-scope-view__empty">No entries yet. Open Tarefas (or Lifecycle) for a live example.</p>
    `
    return
  }

  target.innerHTML = `
    <ul class="jacare-scope-view__list">
      ${snapshot.entries
        .map(
          (entry) => `
        <li class="jacare-scope-view__item">
          <span class="jacare-scope-view__label">${escapeHtml(entry.label)}</span>
          <pre class="jacare-scope-view__value">${escapeHtml(formatValue(entry.value))}</pre>
        </li>
      `,
        )
        .join('')}
    </ul>
  `
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
