const injectedStyles = new Map<string, HTMLStyleElement>()

export function ensureScopedStyle(scopeId: string, css: string): void {
  if (typeof document === 'undefined') return
  const existing = injectedStyles.get(scopeId)
  if (existing) {
    if (existing.textContent !== css) {
      existing.textContent = css
    }
    return
  }
  const style = document.createElement('style')
  style.setAttribute('data-jacare-s', scopeId)
  style.textContent = css
  document.head.appendChild(style)
  injectedStyles.set(scopeId, style)
}

export type SlotRender = (target: HTMLElement) => (() => void) | void

export function mountSlot(
  target: HTMLElement,
  render: SlotRender,
  name?: string,
): (() => void) | void {
  if (name) return
  return render(target) ?? undefined
}
