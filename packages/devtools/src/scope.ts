import {
  getScopeSnapshot,
  startScopePulse,
  subscribeScope,
  type ScopeSnapshot,
} from '@jacare/core'
import { createScopePanel } from './scope-panel.js'

export interface ConnectScopeOptions {
  target?: HTMLElement
  /** Poll interval in ms. Pass `false` when a parent already runs `startScopePulse`. */
  pulseMs?: number | false
}

export function connectJacareScope(options: ConnectScopeOptions = {}): () => void {
  const host = options.target ?? document.body
  const panel = createScopePanel(host)
  const stopPulse =
    options.pulseMs === false ? null : startScopePulse(options.pulseMs ?? 120)
  const unsubscribe = subscribeScope(() => {
    panel.render(getScopeSnapshot())
  })
  panel.render(getScopeSnapshot())
  return () => {
    unsubscribe()
    stopPulse?.()
    panel.dispose()
  }
}

export type { ScopeSnapshot }
