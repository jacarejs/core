import {
  getScopeSnapshot,
  startScopePulse,
  subscribeScope,
  type ScopeSnapshot,
} from '@jacare/core'
import { createScopePanel } from './scope-panel.js'

export interface ConnectScopeOptions {
  target?: HTMLElement
  pulseMs?: number
}

export function connectJacareScope(options: ConnectScopeOptions = {}): () => void {
  const host = options.target ?? document.body
  const panel = createScopePanel(host)
  const stopPulse = startScopePulse(options.pulseMs ?? 120)
  const unsubscribe = subscribeScope(() => {
    panel.render(getScopeSnapshot())
  })
  panel.render(getScopeSnapshot())
  return () => {
    unsubscribe()
    stopPulse()
    panel.dispose()
  }
}

export type { ScopeSnapshot }
