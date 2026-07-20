import { effect } from '../effect.js'
import { scopeCss } from './scope-css.js'

let styleSeq = 0

/**
 * Per-mount reactive stylesheet. Builds CSS from `readCss`, scopes it, and
 * updates a dedicated <style> tag. Uses a unique scope id so instances don't clash.
 */
export function bindStyleSheet(
  target: Element,
  baseScopeId: string,
  readCss: () => string,
): () => void {
  const scopeId = `${baseScopeId}-${++styleSeq}`
  target.setAttribute('data-jacare-s', scopeId)

  const style = document.createElement('style')
  style.setAttribute('data-jacare-s', scopeId)
  document.head.appendChild(style)

  const stop = effect(() => {
    style.textContent = scopeCss(readCss(), scopeId)
  })

  return () => {
    stop.dispose()
    style.remove()
  }
}
