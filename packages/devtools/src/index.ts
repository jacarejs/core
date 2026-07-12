import {
  enableDevtools,
  getPulseGraph,
  subscribePulseGraph,
  type PulseGraphSnapshot,
  type PulseNode,
} from '@jacare/core'
import { createPanel } from './panel.js'
import { connectJacareScope } from './scope.js'

export interface ConnectOptions {
  target?: HTMLElement
  scope?: boolean
}

export function connectJacareDevtools(options: ConnectOptions = {}): () => void {
  enableDevtools()
  const host = options.target ?? document.body
  const panel = createPanel(host)
  const unsubscribe = subscribePulseGraph(() => {
    panel.render(getPulseGraph())
  })
  panel.render(getPulseGraph())
  const disposeScope = options.scope === false ? null : connectJacareScope({ target: host })
  return () => {
    unsubscribe()
    panel.dispose()
    disposeScope?.()
  }
}

export type { PulseGraphSnapshot, PulseNode }
export { connectJacareScope } from './scope.js'
export type { ConnectScopeOptions, ScopeSnapshot } from './scope.js'
